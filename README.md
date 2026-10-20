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
