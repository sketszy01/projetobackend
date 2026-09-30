# Auditoria da APS — 24/09/2026

## Escopo e fontes

Examinados todos os arquivos do ZIP anexado, inclusive os Models, Controllers, Routes, configuração, coleção e lockfile. O arquivo Markdown.md citado não está disponível nos anexos locais nem dentro do ZIP. A revisão usa o ZIP e os requisitos explícitos da solicitação atual; a comparação literal com Markdown.md permanece pendente. Nenhum projeto anterior foi utilizado.

## A. Problemas encontrados

- Lógica HTTP de Product dentro de app.ts e ausência de ProductController/productRoutes.
- Ausência de validação de body, campos, tipos e UUID. Pesquisa interpolada sem restrição de sintaxe.
- Falhas de banco indiscriminadamente tratadas como 404.
- DELETE usava single() sem selecionar o registro removido, dificultando distinguir sucesso de inexistência.
- Sem SQL para reproduzir UUID/FK/schema, sem README e sem teste automatizado útil.
- Postman com DELETE Category configurado como GET, pesquisa incorreta, IDs numéricos e requisições incompletas.
- npm start não carregava .env; configuração usava non-null assertion sem validar variáveis.
- Servidor antigo duplicado. Metadados apontavam ao repositório da aula como se fosse o de entrega.

## B. Correções

Separação da lógica de Product; validação compartilhada; respostas 400/404/409/413/500; tratamento central de rejeições async pelo Express 5; maybeSingle() para inexistência e select de IDs excluídos. Preservadas as funções dos Models e as rotas Category. Mantido categoryId com coluna SQL entre aspas. Criados SQL, README, testes e coleção ordenada com captura automática de IDs. Corrigido start e exemplo de ambiente. Removido código antigo. Autoria original do pacote preservada e integrante da APS documentado como Erick Carvalho.

## C. Arquivos criados

- README.md
- AUDITORIA.md
- database.sql
- src/controller/ProductController.ts
- src/controller/validation.ts
- src/controller/errorHandler.ts
- src/routes/productRoutes.ts
- test/api.test.mjs

## D. Arquivos modificados

- .env.example
- .gitignore
- package.json
- package-lock.json
- restaurant-ordering-system-API.postman_collection.json
- src/app.ts
- src/config/supabase.ts
- src/controller/CategoryController.ts
- src/model/Category.ts
- src/model/Product.ts

Removido: src/server - Copia.ts. Preservados: tsconfig.json, src/server.ts e src/routes/categoryRoutes.ts.

## E–G. Configuração, execução e Postman

O README contém os passos completos para criar o projeto Supabase, obter Project URL e secret/service_role key, executar SQL, conferir a FK, configurar .env, instalar e executar a API e importar/executar a coleção. Não foi fornecido acesso a uma conta Supabase nem URL de repositório do integrante.

## Validações executadas

- Node v24.19.0 e npm 11.9.0 neste ambiente.
- npm ci: concluído, 93 pacotes instalados.
- npm run build: concluído sem erros TypeScript.
- npm test: quatro grupos aprovados, zero falhas. Exercita requisições HTTP reais contra Express e Supabase SDK conectado a um servidor PostgREST local simulado.
- Casos locais: health, rota desconhecida, UUID, body ausente/array/null/inválido, JSON malformado, campos obrigatórios/tipos, preço, ordem, campos extras, pesquisa, CRUD das duas entidades, não encontrado, conflito FK simulado, falha inesperada com 500.
- npm start e npm run dev: iniciados separadamente e GET / retornou 200. Configuração temporária fictícia, removida após teste. Nenhuma consulta a banco real nessa verificação.
- Coleção: JSON interpretado, 18 requisições com scripts de status/JSON; inclui as 11 rotas de entidades e health. Não executada no aplicativo Postman.
- Segurança: não foi encontrado .env no ZIP nem credencial privada nos arquivos examinados. A URL de projeto presente no exemplo original foi substituída por exemplo genérico; URL não é chave secreta. Verificação adicional por padrões de JWT/chave secreta/chave privada não encontrou ocorrências reais. A análise não equivale a garantia absoluta de ausência de segredos.
- ZIP original sem histórico .git. Não foi criado/publicado repositório remoto nem realizado commit em nome do integrante.

## H. Checklist final

Legenda: ✅ implementado e/ou verificado localmente conforme evidência; ⚠️ requer validação/configuração externa. Sucesso com banco simulado não comprova Supabase ou PostgreSQL reais.

| Requisito | Status | Evidência |
| --- | --- | --- |
| Node.js | ✅ | package.json; execução Node 24.19.0 |
| TypeScript | ✅ | tsconfig.json; build sem erros |
| Express | ✅ | app.ts; respostas HTTP locais |
| Supabase | ⚠️ | config/supabase.ts; SDK testado com serviço simulado, sem conta real |
| PostgreSQL | ⚠️ | database.sql revisado, não executado em PostgreSQL |
| 2 entidades | ✅ | model/Category.ts e Product.ts |
| UUID | ⚠️ | Validação local aprovada; geração SQL depende de executar database.sql |
| Foreign Key | ⚠️ | SQL com RESTRICT; tratamento HTTP simulado, FK real pendente |
| CRUD Category | ⚠️ | Rotas completas testadas com banco simulado; persistência real pendente |
| CRUD Product | ⚠️ | Rotas completas testadas com banco simulado; persistência real pendente |
| GET/POST/PUT/DELETE e busca por ID | ✅ | Testes HTTP dos dois recursos |
| Models | ✅ | src/model |
| Controllers | ✅ | src/controller |
| Routes | ✅ | src/routes |
| JSON | ✅ | Respostas JSON e teste de JSON malformado |
| Códigos HTTP | ✅ | Testados 200, 201, 400, 404, 409 e 500; 413 implementado |
| Validações | ✅ | validation.ts; tipos, UUID e campos testados |
| Tratamento de erros | ✅ | errorHandler.ts e testes de falha |
| .env | ⚠️ | Não distribuído; usuário precisa criar com credenciais |
| .env.example | ✅ | Valores fictícios; nenhuma chave real |
| .gitignore | ✅ | Exclui .env, variantes, node_modules e dist |
| Git/repositório | ⚠️ | Sem histórico no original; comandos de publicação no README |
| README | ✅ | Integrante, entidades, configuração, banco, rotas, exemplos e testes |
| Documentação de endpoints | ✅ | Tabela completa no README |
| Documentação do banco | ✅ | README + database.sql |
| Exemplos de requisições | ✅ | Quatro exemplos JSON completos |
| Instruções de execução | ✅ | dev e start verificados com health local |
| Postman | ⚠️ | Coleção completa gerada; execução contra Supabase pendente |
| Equipe de até 3 | ✅ | Único integrante informado: Erick Carvalho |
| Markdown.md oficial | ⚠️ | Arquivo não disponível; conferência literal pendente |

## Checklist manual antes da entrega

- [ ] Conferir o arquivo oficial Markdown.md quando disponível.
- [ ] Criar/configurar Supabase e executar database.sql em banco novo.
- [ ] Conferir UUIDs, coluna categoryId e FK no Table Editor/SQL Editor.
- [ ] Preencher .env local e obter GET /categories com 200.
- [ ] Executar a coleção na ordem; verificar criação, leitura e atualização das duas entidades.
- [ ] Reiniciar a API antes das exclusões e confirmar persistência.
- [ ] Confirmar 409 ao excluir categoria vinculada e ao usar categoria inexistente.
- [ ] Excluir Product e Category; confirmar 404 depois da exclusão.
- [ ] Confirmar ausência de credenciais nos arquivos preparados para o Git.
- [ ] Criar commits, publicar no repositório próprio, preencher URL no README e entregar o link no AVA.

Conclusão: código compila, os comandos de execução iniciam a API e os testes locais passaram. A entrega acadêmica definitiva depende da validação em banco real, conferência do arquivo oficial ausente e publicação Git; esses itens não foram declarados como concluídos.
