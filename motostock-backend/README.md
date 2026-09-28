# MotoStock — Backend

API REST completa para o sistema **MotoStock** (controle de estoque de loja de peças, acessórios e equipamentos para motocicletas), feita para se conectar ao front-end React/TypeScript.

## Stack

- **Node.js + Express + TypeScript**
- **SQLITE** com **Prisma ORM**
- Autenticação **JWT** (access token + refresh token)
- Validação de dados com **Zod**
- Upload de imagens com **Multer**
- Exportação de relatórios em **CSV (Excel)** e **PDF**

## 1. Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior (local, Docker ou serviço na nuvem como Neon/Supabase/Railway)

## 2. Instalação

```bash
# instalar dependências
npm install

# copiar variáveis de ambiente e ajustar conforme seu ambiente
cp .env.example .env
```

Edite o `.env` e configure principalmente:

- `DATABASE_URL`: string de conexão do SQLITE
- `CORS_ORIGIN`: URL onde o front-end React está rodando (ex: `http://localhost:5173`)
- `JWT_SECRET` e `JWT_REFRESH_SECRET`: troque por valores fortes e aleatórios

## 3. Banco de dados

```bash
# cria as tabelas no banco a partir do schema Prisma
npm run prisma:migrate

# popula o banco com dados fictícios (produtos, categorias, fornecedores, usuários)
npm run seed
```

Usuários criados pelo seed:

| Papel          | E-mail                    | Senha            |
|----------------|----------------------------|------------------|
| Administrador  | admin@motostock.com        | admin123         |
| Funcionário    | juliana@motostock.com      | funcionario123   |

## 4. Rodando o servidor

```bash
# ambiente de desenvolvimento (hot reload)
npm run dev

# build e execução em produção
npm run build
npm start
```

A API sobe em `http://localhost:3333/api` (porta configurável via `.env`).

## 5. Estrutura do projeto

```
src/
  config/         → variáveis de ambiente
  lib/            → cliente Prisma
  middlewares/    → autenticação, validação, upload, tratamento de erros
  modules/
    auth/         → login, refresh token, perfil
    users/        → gestão de usuários (admin)
    categories/   → categorias de produtos
    suppliers/    → fornecedores
    products/     → produtos (CRUD, filtros, status de estoque)
    stock/        → visão geral e resumo do estoque
    movements/    → entrada, saída, ajuste e histórico de movimentações
    dashboard/    → estatísticas e gráficos da tela inicial
    reports/      → relatórios e exportação (CSV/PDF)
    notifications/→ notificações do sistema
    search/       → busca global
    uploads/      → upload de fotos de produto
  routes/         → agregador de rotas
  app.ts          → configuração do Express
  server.ts       → ponto de entrada
prisma/
  schema.prisma   → modelagem do banco de dados
  seed.ts         → dados fictícios iniciais
```

## 6. Autenticação

Todas as rotas (exceto `/auth/login` e `/auth/refresh`) exigem o header:

```
Authorization: Bearer <accessToken>
```

Fluxo:
1. `POST /api/auth/login` → retorna `accessToken`, `refreshToken` e dados do usuário
2. Quando o `accessToken` expirar, chame `POST /api/auth/refresh` com o `refreshToken` para obter um novo par de tokens
3. `GET /api/auth/me` → retorna o usuário autenticado

Regras de permissão: rotas de exclusão e gestão de usuários exigem papel `ADMINISTRADOR`; o restante está liberado para `ADMINISTRADOR` e `FUNCIONARIO`.

## 7. Principais endpoints

### Autenticação
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Usuários (admin)
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id` (inativa o usuário)

### Categorias
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Fornecedores
- `GET /api/suppliers`
- `POST /api/suppliers`
- `PUT /api/suppliers/:id`
- `DELETE /api/suppliers/:id`

### Produtos
- `GET /api/products` — filtros: `search`, `categoryId`, `brand`, `supplierId`, `stockStatus` (`NORMAL`/`BAIXO`/`SEM_ESTOQUE`), `status`, paginação e ordenação
- `GET /api/products/low-stock`
- `GET /api/products/brands`
- `GET /api/products/generate-sku?categoryId=&brand=` — sugere um SKU (ex: `TRA-VAZ-0042`) para o campo com ícone de "gerar" no cadastro de produto
- `GET /api/products/:id`
- `POST /api/products` — inclui `supplierProductCode` (código do produto no catálogo do fornecedor/fabricante)
- `PUT /api/products/:id`
- `DELETE /api/products/:id` (inativa se já houver movimentações)

### Estoque
- `GET /api/stock/summary` — cards do dashboard/estoque
- `GET /api/stock` — visão geral com filtros

### Movimentações
- `GET /api/movements` — histórico com filtros (`productId`, `type`, `userId`, `dateFrom`, `dateTo`). Cada item inclui os dados da operação de origem (`invoiceNumber`, `referenceCode`) quando existir
- `GET /api/movements/recent`
- `POST /api/movements/entry` — entrada de estoque (multi-produto); aceita `invoiceNumber` (nota fiscal) e/ou `referenceCode` (referência livre)
- `POST /api/movements/exit` — saída de estoque (valida estoque disponível); aceita `referenceCode` (ex: "Pedido Balcão #8841", "OS Oficina #419")
- `POST /api/movements/adjustment` — ajuste de estoque

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/movements-chart?period=7d|30d|90d|1y`
- `GET /api/dashboard/low-stock`
- `GET /api/dashboard/recent-movements`
- `GET /api/dashboard/stock-value-by-category` — alimenta o gráfico de rosca "Valor por Categoria", já com `percentage` calculado

### Relatórios
- `GET /api/reports/stock`
- `GET /api/reports/low-stock`
- `GET /api/reports/out-of-stock`
- `GET /api/reports/entries?dateFrom&dateTo`
- `GET /api/reports/exits?dateFrom&dateTo`
- `GET /api/reports/movements?dateFrom&dateTo`
- `GET /api/reports/stock-value`
- `GET /api/reports/stock-value-by-category`
- `GET /api/reports/top-products`
- `GET /api/reports/export/csv?type=stock|low-stock|movements`
- `GET /api/reports/export/pdf?type=stock|low-stock`

### Notificações
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

### Busca global
- `GET /api/search?q=termo`

### Upload
- `POST /api/uploads/product-photo` — `multipart/form-data`, campo `photo`; retorna `{ url }` para ser salvo em `photoUrl` do produto

## 8. Padrão de resposta paginada

Endpoints de listagem retornam:

```json
{
  "data": [ /* itens */ ],
  "pagination": { "total": 120, "page": 1, "perPage": 10, "totalPages": 12 }
}
```

Parâmetros de paginação aceitos: `?page=1&perPage=10`.

## 9. Sobre o seletor de período do Dashboard (Hoje / 7 dias / 30 dias / Este mês)

O front-end exibe um seletor de período no topo do Dashboard com variações percentuais como "+3,2% vs mês anterior". O backend atual (`GET /api/dashboard/stats`) retorna sempre os números atuais (estado presente do estoque), sem comparação histórica, pois isso exigiria manter "fotografias" diárias do estoque (uma tabela de snapshots) para calcular a variação entre períodos. Ficou como próximo passo sugerido — ver seção 10.

## 10. Próximos passos sugeridos

- Trocar armazenamento de imagens local (`/uploads`) por um serviço como S3/Cloudinary em produção
- Adicionar blacklist de refresh tokens para revogação imediata no logout
- Adicionar testes automatizados (Jest/Vitest + Supertest)
- Adicionar rate limiting nas rotas de autenticação
- Adicionar leitura de código de barras (integração futura, conforme o prompt do front-end)
- Criar tabela de snapshots diários de estoque para viabilizar as comparações "vs período anterior" do Dashboard
- Endpoint de impressão de etiquetas (SKU + código de barras) para o botão "Etiquetas" da tela de Estoque
