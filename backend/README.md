# Backend

API Node.js + Express + PostgreSQL do DigFin.

## Configuração local

1. Copie `.env.example` para `.env`.
2. Preencha `DATABASE_URL` com as credenciais do seu PostgreSQL.
3. Confirme que o schema `digfin` e a tabela `digfin.bandeira_cartao` existem.
4. Execute `npm run migrate` para aplicar as migrations pendentes.
5. Execute `npm run dev`.

## Manutenção do banco

O arquivo `database/schema.sql` é o bootstrap para uma instalação nova. Depois que o banco estiver criado, alterações estruturais devem ser feitas em novos arquivos numerados em `database/migrations/`, nunca editando uma migration já aplicada. A conexão compartilhada com o banco fica em `database/Pool.ts`.

O comando `npm run migrate` executa os arquivos pendentes em ordem lexicográfica e registra cada arquivo em `digfin.schema_migrations`. A primeira migration atual reforça o isolamento por `conta_id` nas referências de cartões e contas bancárias.

Antes de adicionar tabelas de transações, mantenha o mesmo padrão: `conta_id` obrigatório, chaves estrangeiras compostas quando a relação cruzar entidades da conta, índices para filtros e joins frequentes, e regras de exclusão explícitas.

O servidor inicia em `http://localhost:3000` por padrão. A porta e a origem do frontend podem ser alteradas no `.env`.

Enquanto a autenticação ainda não foi implementada, `CONTA_ID` define a conta de desenvolvimento usada internamente pelo backend. O frontend não envia esse valor. Quando o login existir, o middleware de autenticação deverá substituir esse contexto pelo `conta_id` da sessão do usuário.

## Endpoints

- `GET /health`: verifica se a API está no ar.
- `GET /api/bandeira-cartao`: lista as bandeiras.
- `POST /api/bandeira-cartao`: cria uma bandeira com `{ "description": "Visa" }`.
- `PUT /api/bandeira-cartao/:id`: atualiza uma bandeira.
- `DELETE /api/bandeira-cartao/:id`: remove uma bandeira.
- `GET /api/cartao-credito`: lista os cartões de crédito.
- `POST /api/cartao-credito`: cria um cartão com `{ "name": "Cartão principal", "cardBrandId": "1", "dueDay": 10 }`.
- `PUT /api/cartao-credito/:id`: atualiza um cartão.
- `DELETE /api/cartao-credito/:id`: remove um cartão.
- `GET /api/categorias`: lista categorias e subcategorias da conta.
- `POST /api/categorias`: cria uma categoria.
- `PUT /api/categorias/:id`: atualiza uma categoria.
- `DELETE /api/categorias/:id`: remove uma categoria sem subcategorias.
- `POST /api/categorias/subcategorias`: cria uma subcategoria, com `categoryId` opcional.
- `PUT /api/categorias/subcategorias/:id`: atualiza uma subcategoria.
- `DELETE /api/categorias/subcategorias/:id`: remove uma subcategoria.

O backend usa camadas de rotas, controllers, services e repositories. O repository é o único ponto que conhece os nomes de colunas do PostgreSQL (`descricao`); a API mantém o contrato `description` usado pelo frontend.

## Contrato de erros

Erros de aplicação retornam um código estável e parâmetros opcionais. O frontend deve traduzir o código localmente:

```json
{
	"code": "cardBrandDescriptionDuplicate",
	"params": {}
}
```

Clientes que não conseguem traduzir códigos podem solicitar uma mensagem localizada enviando `Prefer: localized-error-message` e `Accept-Language`. Nesse caso, a resposta também inclui `message`; ela é uma capacidade de compatibilidade e não deve ser usada como identificador do erro.