# FitStock — Criar Negociação no Zoho CRM

Widget do botão Criar Negociação de Oportunidades de Mercado. As empresas e os contatos vêm exclusivamente dos Contacts associados à oportunidade, mantendo contato opcional e os campos comerciais atuais. E-mail não é exigido.

## Origem e histórico

Cópia de https://github.com/abiezerlima/criar-negocio realizada em 20/10/2026 com os seis commits originais. A tag `before-contacts-migration-2026-10-20` aponta para `edcfa79c2e8c8c279e48300cd6c17af777cd8efd`, antes da mudança.

## Hospedagem e função

GitHub Pages serve a raiz de `main` em https://fitstock.github.io/zoho-crm-negociacao/index.html.

O widget chama `negociacaocontatoswidget`, uma função Standalone dedicada no Zoho CRM. A execução pelo SDK requer habilitar OAuth 2.0 na opção REST API da função. Não são usados tokens ou chaves no HTML. O código Deluge e os metadados administrativos ficam no repositório privado de administração, fora deste site público.

O apontamento do widget só deve ser trocado depois de validar a função, seu modo de autenticação e a resposta HTTPS da página. A função anterior `buscarempresaswidget` é preservada.

## Comportamento

- Selecionar uma empresa mostra somente seus contatos associados à oportunidade atual.
- Não há busca de outros contatos por empresa nem fallback para Possíveis Buyers.
- Contatos sem empresa são informados, mas não usados para criar Deals sem empresa.
- A confirmação revalida os vínculos no servidor e mantém o mapeamento atual de comprador e vendedor.
- O botão fica bloqueado durante o carregamento e a criação. Falhas de criação não têm repetição automática.

## Testes da interface

```sh
npm ci
npm run check
```

Os testes usam DOM e SDK simulados; não criam negociações. Os testes de negócio da função, compilação e evidências de publicação são mantidos no repositório administrativo.

## Reversão

No Zoho, restaure a URL externa do widget Criar Negociação para:

https://abiezerlima.github.io/criar-negocio/index.html

O widget original continua chamando `buscarempresaswidget`, preservada. Portanto, restaurar essa URL recupera também o comportamento anterior de Possíveis Buyers. A função nova pode permanecer sem consumidores; não é necessário excluir funções ou negociações.

O código original também pode ser consultado pela tag `before-contacts-migration-2026-10-20`. A reversão de hospedagem não altera negociações já criadas.

## Dados da oportunidade na negociação

O formulário exibe os dados de origem que serão copiados ao criar: quantidade, preço, moeda e validade. A quantidade é arredondada para o inteiro mais próximo (12,4 → 12; 12,5 → 13), mantendo o campo Qtd inteiro. Os valores desejados permanecem opcionais e manuais. A função dedicada mantém a inversão de comprador/vendedor para oportunidades de compra e copia os dados do contato vendedor.

A versão anterior do HTML está preservada na tag `before-opp-data-2026-10-20` e no commit `b702e461ccf9ac00bfb58c177938832b3e659c66`. Para reverter o comportamento completo, restaurar também a versão anterior da função no CRM a partir do backup privado da operação; reverter apenas o HTML não desfaz a cópia feita pelo servidor. O apontamento do widget continua o mesmo. Não excluir negociações já criadas.


## Revisar valores antes de criar

Quantidade, preço, moeda e validade agora vêm preenchidos da Opp e podem ser editados. A negociação usa os valores finais revisados, sem editar a Opp. Quantidade mantém arredondamento para inteiro. Mudar a moeda não converte o número do preço automaticamente. Os campos desejados e seletores de empresa/contato continuam separados.

A tag `before-editable-opp-data-2026-10-20` preserva o HTML anterior à edição dos quatro campos, em `fbe68a95217c33e4cff180be1a24bcda54581f2a`. Para rollback completo, restaurar também a função anterior no Zoho a partir do backup privado dessa versão. Não excluir negociações já criadas.


## Responsável na criação

O formulário pré-seleciona o usuário conectado ao Zoho CRM e permite escolher outro usuário ativo. O responsável é enviado em Owner; a função dedicada valida o usuário antes de gravar. Falha de leitura de usuários bloqueia a criação. Não muda o remetente do e-mail nem os responsáveis de registros existentes.

Reversão da interface: restaurar os arquivos da tag before-owner-selector-2026-10-21 em um novo commit. O backend mantém compatibilidade com formulários anteriores. Backup privado da função e procedimento completo preservados no projeto administrativo FitStock.

## Uso do produto ao criar negociação

Após a criação confirmada, a função registra Usa para a empresa compradora e o produto da negociação, preservando o histórico. Em oportunidades de compra, a compradora é a empresa de origem. Isso funciona também sem contato comprador selecionado. Falha da classificação não desfaz nem duplica a negociação: o formulário informa a pendência e permite abrir o registro existente. Não há atualização retroativa de negociações anteriores.

Reversão: tag before-auto-use-2026-10-21 e backup privado das duas funções Deluge, incluindo o motor de histórico. Restaurar frontend e função de negociação antes de considerar restaurar o motor; não apagar eventos ou classificações já registradas.
