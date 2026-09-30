# Restaurant Ordering System — API de Catálogo

API REST para organizar categorias e produtos do catálogo de um restaurante, centralizando cadastro, consulta, atualização e exclusão dos itens. Este módulo não implementa pedidos, pagamentos ou usuários.

## Integrante

Erick Carvalho.

Base de código: projeto de aula `restaurant_ordering_system_sjp-aula-07-controller-routes`, com autoria original indicada no package.json como Mateus R. Pereira. Esta APS mantém o domínio e a organização da aula.

## Tecnologias

Node.js (22 ou superior; testes locais com 24.19.0), TypeScript, Express 5, Supabase, PostgreSQL e Git. Bibliotecas: `@supabase/supabase-js`, `tsx`, `@types/express` e `@types/node`. Testes com `node:test`, `node:assert` e HTTP nativo, sem dependência adicional. As versões exatas instaladas constam no package-lock.json.

## Entidades e relacionamento

Uma **Category pode possuir vários Products e cada Product pertence a uma Category**.

| Category / categories | Tipo | Regra |
| --- | --- | --- |
| id | UUID | Gerado automaticamente pelo banco; não enviar no body |
| name | string | Obrigatório, não vazio |
| description | string | Obrigatória, não vazia |
| icon | string | Pode ser vazia; exemplo: 🍕 |
| display_order | integer | De 0 a 2147483647 |
| active | boolean | true ou false |

| Product / products | Tipo | Regra |
| --- | --- | --- |
| id | UUID | Gerado automaticamente pelo banco; não enviar no body |
| categoryId | UUID | Obrigatório; categoria existente |
| name | string | Obrigatório, não vazio |
| description | string | Obrigatória, não vazia |
| price | number | Finito e maior que zero |
| image | string | URL/caminho ou string vazia; a API não baixa nem valida o recurso |
| available | boolean | true ou false |
| active | boolean | true ou false |

POST e PUT exigem todos os campos editáveis da respectiva tabela acima, mesmo os booleanos e as strings que podem ser vazias. PUT substitui a representação editável completa; atualização parcial não é suportada. Campos desconhecidos, `id`, null, arrays, tipos incorretos ou body ausente são rejeitados com 400. Booleanos não devem ser enviados entre aspas. IDs das rotas e categoryId devem usar UUID canônico válido.

## Estrutura

```text
src/
├── config/
│   └── supabase.ts
├── controller/
│   ├── CategoryController.ts
│   ├── ProductController.ts
│   ├── validation.ts
│   └── errorHandler.ts
├── model/
│   ├── Category.ts
│   └── Product.ts
├── routes/
│   ├── categoryRoutes.ts
│   └── productRoutes.ts
├── app.ts
└── server.ts
test/api.test.mjs
database.sql
restaurant-ordering-system-API.postman_collection.json
```

- `config`: lê as variáveis e cria o cliente Supabase para o backend.
- `model`: executa consultas, inserts, updates e deletes no banco.
- `controller`: valida requisições e define respostas HTTP. Os dois pequenos auxiliares compartilham validação e tratamento de erros.
- `routes`: associa métodos/caminhos aos controllers. `/categories/search` vem antes de `/:id`.
- `app.ts`: configura JSON, health, rotas, resposta 404 e middleware de erros.
- `server.ts`: inicia o servidor na porta 3000.
- `test`: verifica API e SDK com um servidor PostgREST simulado; não acessa seu Supabase.

Fluxo: requisição → Route → Controller → Model → Supabase/PostgreSQL → resposta JSON. Express 5 encaminha automaticamente rejeições dos handlers async ao middleware de erros. Os imports `.js` no TypeScript são intencionais para o build ESM/NodeNext.

## Instalação e execução

Depois de publicar o projeto, substitua `URL_DO_SEU_REPOSITORIO` pela URL real (não foi fornecida nesta revisão):

```bash
git clone URL_DO_SEU_REPOSITORIO restaurant-ordering-system
cd restaurant-ordering-system
npm install
```

Se recebeu o ZIP, extraia-o e abra o terminal na pasta que contém package.json. Para instalação reproduzível use `npm ci` no lugar de `npm install`.

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Preencha localmente:

```dotenv
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SECRET_KEY=substitua-pela-chave-do-backend
```

| Variável | Finalidade |
| --- | --- |
| SUPABASE_URL | Project URL do projeto Supabase |
| SUPABASE_SECRET_KEY | Chave secreta de backend; não é a senha PostgreSQL |

Não envie `.env`, chaves ou senhas ao Git/Postman. `.gitignore` protege `.env` e variantes e permite somente `.env.example`. O cliente desativa persistência/renovação de sessão porque esta API usa chave de servidor. O exemplo de configuração não contém credenciais reais.

Com o banco e `.env` configurados:

```bash
npm run dev
```

Ou execute o código compilado:

```bash
npm run build
npm start
```

Os dois modos carregam `.env` explicitamente; rode os comandos na raiz do projeto. Abra **http://localhost:3000**. O health confirma apenas que o processo HTTP responde, não a conexão com o banco. Para ambientes que injetam variáveis diretamente, o build pode ser iniciado com `node dist/server.js` sem arquivo `.env`.

## Configuração do Supabase e banco

1. No painel Supabase, crie um projeto para esta APS. Guarde a senha do banco fora do repositório e aguarde a criação.
2. Na área de conexão/configurações de API do projeto, copie o **Project URL** para `SUPABASE_URL`.
3. Na área **API Keys**, obtenha uma **secret key** para servidor (`sb_secret_...`), ou a chave legada **service_role**, quando disponível. Coloque-a em `SUPABASE_SECRET_KEY`. Não use chave publishable/anon com este SQL. Os rótulos do painel podem variar. Nunca compartilhe a chave nem use no frontend.
4. Abra o **SQL Editor** e execute todo o `database.sql` em um banco novo. O script usa uma transação e não remove nem migra tabelas existentes. Se já houver essas tabelas, compare a estrutura antes de executar; não apague dados para resolver o conflito.
5. No **Table Editor**, confira `public.categories` e `public.products`, os UUIDs e os campos. A coluna deve se chamar exatamente **categoryId**, respeitando maiúsculas. No SQL ela é escrita como `"categoryId"`; sem aspas PostgreSQL transforma o nome em minúsculas.
6. Confira a FK `products_categoryId_fkey` de `products.categoryId` para `categories.id`. A exclusão é RESTRICT: remova primeiro os produtos para depois excluir a categoria. A API responde 409 quando há conflito de FK.
7. Inicie a API. Faça GET `/categories`: 200 com `[]` em um banco vazio confirma que aquela consulta chegou ao banco com sucesso. POST Category, POST Product e os GETs seguintes confirmam escrita e leitura. Veja os registros também no Table Editor.
8. Reinicie a API e consulte os mesmos IDs para confirmar persistência. Execute os testes manuais abaixo, incluindo FK e exclusões.

Consulta opcional para inspecionar a FK no SQL Editor:

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.products'::regclass and contype = 'f';
```

`database.sql` cria PKs UUID com `gen_random_uuid()`, campos NOT NULL, checks de nome/descrição/preço/ordem, FK e índice em categoryId. Defaults SQL: icon/image vazios, display_order 0 e booleanos true. Os defaults atendem inserções diretas; a API exige o body completo. `price` é numeric positivo, sem arredondamento imposto pela API.

O SQL habilita RLS e remove acesso de anon/authenticated. O backend usa secret/service_role, com permissão para operar as tabelas. Esta APS não implementa autenticação de usuários: quem alcançar a API poderá usar o CRUD. Execute localmente para demonstração; a chave fica somente no backend.

Não foi possível inspecionar o schema de uma conta real. O SQL fornecido define a convenção reproduzível; não comprova que um banco preexistente tenha o mesmo schema.

## Endpoints

Todas as respostas são JSON. POST/PUT devem enviar `Content-Type: application/json` (limite 100 KB).

| Método | Rota | Descrição | Body necessário |
| --- | --- | --- | --- |
| GET | / | Health do processo HTTP | Não |
| GET | /categories | Lista todas; retorna [] se vazio | Não |
| GET | /categories/search?keyword=Pizza | Pesquisa em name e description | Não; keyword obrigatório |
| GET | /categories/:id | Consulta Category por UUID | Não |
| POST | /categories | Cria Category; retorna registro e Location | Category completo |
| PUT | /categories/:id | Atualiza Category existente | Category completo |
| DELETE | /categories/:id | Exclui Category sem produtos | Não |
| GET | /products | Lista todos; retorna [] se vazio | Não |
| GET | /products/:id | Consulta Product por UUID | Não |
| POST | /products | Cria Product relacionado à Category | Product completo |
| PUT | /products/:id | Atualiza Product existente | Product completo |
| DELETE | /products/:id | Exclui Product | Não |

Pesquisa: keyword deve conter de 1 a 100 caracteres e não pode ser só espaços. Aceita letras (incluindo acentos), números, espaços, hífen e sublinhado. A restrição evita inserir sintaxe no filtro PostgREST; sublinhado é escapado como texto literal. Retorna resultados ordenados por display_order. Não exige active=true.

## Exemplos JSON

### Criar Category

```json
{
  "name": "Pizzas",
  "description": "Pizzas artesanais com diversos sabores.",
  "icon": "🍕",
  "display_order": 1,
  "active": true
}
```

### Atualizar Category

```json
{
  "name": "Pizzas",
  "description": "Pizzas tradicionais e especiais.",
  "icon": "🍕",
  "display_order": 2,
  "active": true
}
```

### Criar Product

Copie o `id` retornado ao criar Category e substitua o UUID ilustrativo abaixo pelo ID real. O ID ilustrativo não representa uma categoria já cadastrada.

```json
{
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Pizza Margherita",
  "description": "Molho de tomate, muçarela e manjericão.",
  "price": 35.9,
  "image": "",
  "available": true,
  "active": true
}
```

### Atualizar Product

Use o ID real da categoria e envie todos os campos:

```json
{
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Pizza Margherita",
  "description": "Molho de tomate, muçarela e manjericão.",
  "price": 39.9,
  "image": "",
  "available": false,
  "active": true
}
```

## Códigos HTTP

| Status | Uso |
| --- | --- |
| 200 | Consulta, atualização ou exclusão bem-sucedida |
| 201 | Registro criado; JSON com UUID gerado |
| 400 | ID/body/JSON/tipo/campo inválido ou violação de check |
| 404 | Rota ou registro inexistente |
| 409 | Conflito de FK ou unicidade; categoria inexistente no Product ou categoria ainda vinculada |
| 413 | Body maior que 100 KB |
| 500 | Falha inesperada, de configuração ou do banco |

Erros seguem `{ "message": "Descrição simples do erro." }`. Exclusões retornam 200 com mensagem; um segundo DELETE retorna 404. Erros inesperados não expõem detalhes internos ou credenciais. Chave inválida, banco indisponível ou tabela ausente não são tratados como recurso inexistente.

## Testes locais automatizados

```bash
npm test
```

Executa build e quatro grupos de testes: validação HTTP/JSON/UUID, campos e tipos, CRUD completo com FK simulada, falhas inesperadas de banco. Usa servidores HTTP locais, o cliente Supabase real e respostas PostgREST simuladas. Não precisa de `.env`, não usa credenciais reais e não comprova PostgreSQL/FK real. O código de simulação está apenas em `test/`, fora do build da aplicação.

## Postman e teste manual real

1. Configure o Supabase, SQL e `.env`; inicie a API.
2. Importe `restaurant-ordering-system-API.postman_collection.json` no Postman.
3. Confira `baseUrl=http://localhost:3000`. Deixe categoryId e productId vazios; não crie variáveis de ambiente com os mesmos nomes, pois podem sobrescrever as da coleção.
4. Execute em ordem 01–18 no Collection Runner, ou envie cada requisição individualmente. O POST Category salva automaticamente um UUID real em categoryId; o POST Product usa esse UUID e salva productId.
5. A sequência consulta, pesquisa, atualiza, verifica o conflito ao excluir categoria vinculada, rejeita preço/UUID inválidos e exclui primeiro Product, depois Category. Ao final testa Product com a Category já excluída (409). Os scripts verificam status/JSON e IDs retornados.
6. Para verificar persistência, pare após a requisição 10, confira os registros no Table Editor, reinicie a API e repita os GETs antes de executar as exclusões.
7. Para casos adicionais, envie body ausente, description vazia, active como string e JSON malformado: espere 400. Use um UUID válido inexistente em GET/PUT/DELETE: espere 404 (no PUT envie body completo com uma categoria existente para Product).
8. Em ambiente de teste, pare a API, configure temporariamente uma chave inválida e reinicie. GET `/categories` deve retornar 500, não 404. Restaure a configuração em seguida.

A coleção cria e remove dados de teste; execute em um projeto destinado à APS. Ela não foi executada no aplicativo Postman nesta revisão. O teste real de banco e o envio do repositório continuam necessários; veja `AUDITORIA.md`.

## Git e entrega no AVA

O ZIP original não contém histórico `.git`, e nenhum repositório do integrante foi informado. Não use o repositório do professor como link de entrega. Crie um repositório seu e, na raiz extraída, execute:

```bash
git init
git add .
git status
git check-ignore .env
git commit -m "Finaliza API de catálogo da APS"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Configure seu nome/e-mail no Git caso solicitado. Antes do commit confira que `.env` não está na lista de arquivos preparados. Substitua a URL no comando e neste README pelo endereço real. Entregue no AVA o link do seu repositório, após concluir os testes reais e conferir o acesso do avaliador.

Para demonstrar: explique Category 1:N Product, UUID/FK, caminho Route→Controller→Model, validação, códigos HTTP, variáveis de ambiente, persistência após reinício e conflito na exclusão de categoria vinculada.
