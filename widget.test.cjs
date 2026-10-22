const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {JSDOM}=require("jsdom");
const base=__dirname;
async function ui(output, execute) {
  const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
  const dom = new JSDOM(html);
  const calls = [];
  const opened = [];
  const context = vm.createContext({
    document: dom.window.document,
    setTimeout() {},
    alert() {},
    ZOHO: {
      embeddedApp: { on() {}, init() {} },
      CRM: {
        ...require("./owner-fixture.cjs"),
        FUNCTIONS: {
          execute: async (name, data) => {
            const req = JSON.parse(data.arguments);
            calls.push({ name, req });
            return execute
              ? execute(req)
              : { details: { output: JSON.stringify(output) } };
          },
        },
        UI: { Record: { open: (record) => opened.push(record) } },
      },
    },
  });
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  const result = {
    doc: dom.window.document,
    calls,
    opened,
    context,
    invoke: (js) => vm.runInContext(js, context),
  };
  result.loading = result.invoke('currentOppId = "1"; carregarDados()');
  return result;
}
const data = {
  status: "success",
  tipo_oportunidade: "Venda",
  produto_id: "9",
  produto_nome: "Produto",
  empresa_origem_id: "100",
  empresa_origem_nome: "Origem",
  contato_origem_id: "101",
  empresas: [
    { id: "200", nome: "Parceira", contatos: [{ id: "201", nome: "Maria" }] },
    { id: "300", nome: "Outra", contatos: [{ id: "301", nome: "João" }] },
  ],
  contatos_sem_empresa: 0,
};
async function choose(u, company = "200", contact = "201") {
  await u.loading;
  u.doc.getElementById("empresaSelect").value = company;
  u.invoke("aoSelecionarEmpresa()");
  u.doc.getElementById("contatoSelect").value = contact;
}

test("C3 selecionar empresa filtra contatos sem outra chamada", async () => {
  const u = await ui(data);
  await choose(u);
  assert.deepEqual(
    [...u.doc.querySelectorAll("#contatoSelect option")].map((o) => o.value),
    ["", "201"],
  );
  assert.equal(u.calls.length, 1);
  assert.equal(u.calls[0].name, "negociacaocontatoswidget");
});
test("C8 carregamento bloqueia criacao", async () => {
  let release;
  const u = await ui(
    null,
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  assert.equal(u.doc.getElementById("criarButton").disabled, true);
  assert.match(u.doc.getElementById("status").textContent, /Carregando/);
  await new Promise(resolve => setImmediate(resolve));
  release({ output: JSON.stringify(data) });
  await u.loading;
});
test("C13 trocar empresa limpa o contato anterior", async () => {
  const u = await ui(data);
  await choose(u);
  u.doc.getElementById("empresaSelect").value = "300";
  u.invoke("aoSelecionarEmpresa()");
  assert.equal(u.doc.getElementById("contatoSelect").value, "");
  assert.deepEqual(
    [...u.doc.querySelectorAll("#contatoSelect option")].map((o) => o.value),
    ["", "301"],
  );
});
test("C14 nomes sao texto com IDs preservados", async () => {
  const special = structuredClone(data);
  special.empresas[0].nome = 'A "B" <teste>';
  special.empresas[0].contatos[0].nome = "M & <outro>";
  const u = await ui(special);
  await choose(u);
  assert.equal(
    u.doc.querySelector('#empresaSelect option[value="200"]').textContent,
    'A "B" <teste>',
  );
  assert.equal(
    u.doc.querySelector('#contatoSelect option[value="201"]').textContent,
    "M & <outro>",
  );
  assert.equal(u.doc.querySelector("teste,outro"), null);
});
test("C22 segunda submissao simultanea e bloqueada", async () => {
  let release;
  const u = await ui(null, (req) =>
    req.action
      ? new Promise((resolve) => {
          release = resolve;
        })
      : Promise.resolve({ output: JSON.stringify(data) }),
  );
  await choose(u);
  const first = u.invoke("confirmarCriacao()");
  await u.invoke("confirmarCriacao()");
  assert.equal(
    u.calls.filter((c) => c.req.action === "criar_negocio").length,
    1,
  );
  assert.equal(u.doc.getElementById("criarButton").disabled, true);
  release({ output: JSON.stringify({ status: "success", deal_id: "700" }) });
  await first;
});
test("C24 sucesso abre o deal_id retornado", async () => {
  const u = await ui(null, (req) => ({
    output: JSON.stringify(
      req.action ? { status: "success", deal_id: "700" } : data,
    ),
  }));
  await choose(u);
  await u.invoke("confirmarCriacao()");
  assert.equal(u.opened.length, 1);
  assert.equal(u.opened[0].Entity, "Deals");
  assert.equal(u.opened[0].RecordID, "700");
});
// Synthetic contract: no CRM records or private Deluge code are included here.
const origin = { ...data, dados_oportunidade: { quantidade:12.5, qtd_arredondada:13, preco_unitario:7.25, moeda:'USD', validade_produto:'2027-05-31' }, referencia_origem:'synthetic-snapshot-v1' };
test('Opp source summary shows rounding and desired fields stay manual', async()=>{
  const u=await ui(origin); await choose(u);
  assert.equal(u.doc.getElementById('quantidadeOppInput').value,'12.5');
  assert.match(u.doc.getElementById('qtdArredondada').textContent,/13/);assert.match(u.doc.getElementById('qtdArredondada').textContent,/arredond/);assert.equal(u.doc.getElementById('precoOppInput').value,'7.25');assert.equal(u.doc.getElementById('moedaOppSelect').value,'USD');assert.equal(u.doc.getElementById('validadeOppInput').value,'2027-05-31');
  assert.equal(u.doc.getElementById('qtdInput').value,'');assert.equal(u.doc.getElementById('precoInput').value,'');
  u.doc.getElementById('qtdInput').value='2.5';u.doc.getElementById('precoInput').value='9.75';
  u.doc.getElementById('empresaSelect').value='300';u.invoke('aoSelecionarEmpresa()');
  assert.equal(u.doc.getElementById('qtdInput').value,'2.5');assert.equal(u.doc.getElementById('precoInput').value,'9.75');
});
test('Opp create sends context reference and preserves manual input', async()=>{
  const u=await ui(null,req=>({output:JSON.stringify(req.action?{status:'success',deal_id:'700'}:origin)}));await choose(u);
  u.doc.getElementById('qtdInput').value='2.5';u.doc.getElementById('precoInput').value='9.75';await u.invoke('confirmarCriacao()');
  assert.equal(u.calls[1].req.referencia_origem,'synthetic-snapshot-v1');assert.equal(u.calls[1].req.payload.Quantidade_Desejada,'2.5');assert.equal(u.calls[1].req.payload.Preco_Unitario_Desejado,'9.75');assert.equal(u.opened.length,1);
});


test('Four reviewed values are sent independently of desired values', async()=>{
  const u=await ui(null,req=>({output:JSON.stringify(req.action?{status:'success',deal_id:'700'}:origin)}));await choose(u);
  u.doc.getElementById('quantidadeOppInput').value='25.5';
  u.doc.getElementById('precoOppInput').value='18.5';
  u.doc.getElementById('moedaOppSelect').value='EUR';
  u.doc.getElementById('validadeOppInput').value='2028-12-31';
  u.invoke('atualizarCamposOpp()');
  assert.match(u.doc.getElementById('qtdArredondada').textContent,/26/);
  assert.match(u.doc.querySelector('label[for="precoOppInput"]').textContent,/EUR/);
  assert.match(u.doc.getElementById('moedaAviso').textContent,/não.*convert/i);
  await u.invoke('confirmarCriacao()');
  assert.equal(u.calls[1].req.valores_negociacao.quantidade,'25.5');
  assert.equal(u.calls[1].req.valores_negociacao.preco_unitario,'18.5');
  assert.equal(u.calls[1].req.valores_negociacao.moeda,'EUR');
  assert.equal(u.calls[1].req.valores_negociacao.validade_produto,'2028-12-31');
  assert.equal(u.calls[1].req.payload.Quantidade_Desejada,'');
  assert.equal(u.calls[1].req.payload.Preco_Unitario_Desejado,'');
});
