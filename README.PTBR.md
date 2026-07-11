# API Stock Gestor

[Ver a versão em inglês](README.md)

API RESTful para gestão de estoque com autenticação JWT, persistência em PostgreSQL, categorias de itens, upload de imagens via Cloudinary, métricas de dashboard e histórico de atualizações dos itens.

**API em produção:** https://api-stock-gestor.vercel.app

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Requisitos](#requisitos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar](#como-rodar)
- [Scripts](#scripts)
- [Modelo de Dados](#modelo-de-dados)
- [Autenticação](#autenticação)
- [Paginação](#paginação)
- [Upload de Imagens](#upload-de-imagens)
- [Padrão de Resposta](#padrão-de-resposta)
- [Formato de Erros](#formato-de-erros)
- [Referência da API](#referência-da-api)
- [Movimentações de Estoque](#movimentações-de-estoque)
- [Licença](#licença)
- [Autor](#autor)

## Funcionalidades

- Cadastro e login de usuários com JWT.
- Um estoque é criado automaticamente para cada usuário.
- Gerenciamento do perfil do usuário autenticado.
- CRUD de itens com categoria e imagem opcionais.
- CRUD de categorias limitado ao estoque do usuário autenticado.
- Listagem paginada de itens e categorias.
- Estatísticas de dashboard para acompanhamento do estoque.
- Histórico de movimentações para atualizações de itens.
- Upload de imagens para o Cloudinary com limpeza da imagem antiga ao substituir ou deletar.
- Validação e tratamento de erros centralizados.

## Tecnologias

- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework:** Express
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma
- **Autenticação:** JWT
- **Validação:** Zod
- **Upload de arquivos:** Multer
- **Armazenamento de imagens:** Cloudinary
- **Deploy:** Vercel

## Arquitetura do Projeto

```text
src/
  routes/         Definição das rotas HTTP
  controllers/    Tratamento de request e response
  services/       Regras de negócio e orquestração
  repositories/   Acesso ao banco com Prisma
  schemas/        Schemas de validação com Zod
  middlewares/    Autenticação, upload e tratamento de erros
  errors/         Classes de erro customizadas
  database/       Instância do Prisma Client
```

A API segue um fluxo em camadas:

```text
routes -> controllers -> services -> repositories -> database
```

## Requisitos

- Node.js 20 ou superior recomendado.
- npm.
- Banco PostgreSQL.
- Conta no Cloudinary.

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=seu_jwt_secret
CLOUDINARY_NAME=seu_cloud_name
CLOUDINARY_KEY=sua_api_key
CLOUDINARY_SECRET=seu_api_secret
ALLOWED_ORIGIN=http://localhost:5173
PORT=3000
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | String de conexão PostgreSQL usada pelo Prisma. |
| `JWT_SECRET` | Sim | Segredo usado para assinar e verificar tokens JWT. |
| `CLOUDINARY_NAME` | Sim | Cloud name do Cloudinary. |
| `CLOUDINARY_KEY` | Sim | API key do Cloudinary. |
| `CLOUDINARY_SECRET` | Sim | API secret do Cloudinary. |
| `ALLOWED_ORIGIN` | Sim | Origem do frontend permitida pelo CORS. |
| `PORT` | Não | Porta do servidor local. Padrão: `3000`. |

## Como Rodar

```bash
npm install
npx prisma migrate dev
npm run dev
```

A API local ficará disponível em:

```text
http://localhost:3000/api
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento com `tsx watch`. |
| `npm run build` | Gera o Prisma Client e compila o TypeScript. |
| `npm start` | Executa a aplicação compilada em `dist/server.js`. |
| `npx prisma migrate dev` | Executa as migrations em desenvolvimento. |
| `npx prisma studio` | Abre o Prisma Studio para inspecionar o banco. |

## Modelo de Dados

```text
User
  Stock (1:1)
    Category[] (1:N)
    Item[] (1:N)
      StockMovement[] (1:N)
```

### User

Representa uma conta da aplicação. Um estoque é criado automaticamente quando o usuário se cadastra.

Campos importantes:

- `id`
- `firstName`
- `lastName`
- `email`
- `password`
- `phone`
- `avatarUrl`
- `avatarPublicId`

### Stock

Representa o estoque do usuário. Cada usuário possui um estoque.

### Category

Agrupa itens dentro de um estoque.

Campos importantes:

- `id`
- `name`
- `color`
- `iconName`
- `stockId`

### Item

Representa um item do estoque.

Campos importantes:

- `id`
- `name`
- `description`
- `quantity`
- `priceInCents`
- `sku`
- `imageUrl`
- `imagePublicId`
- `stockId`
- `categoryId`

### StockMovement

Armazena o histórico de atualizações de um item.

Campos importantes:

- `id`
- `itemId`
- `userId`
- `userName`
- `reason`
- `changes`
- `createdAt`

## Autenticação

Rotas protegidas exigem um token Bearer no header `Authorization`:

```http
Authorization: Bearer <token>
```

O token é retornado por `POST /api/login` e expira em 1 dia.

O payload do JWT inclui:

- `userId`
- `firstName`
- `lastName`
- `stockId`

## Paginação

As rotas de listagem de itens e categorias aceitam paginação por query params.

| Query param | Tipo | Padrão | Limite | Descrição |
|-------------|------|--------|--------|-----------|
| `page` | number | `1` | Inteiro positivo | Página atual. |
| `limit` | number | `10` | Máximo `100` | Itens por página. |

Exemplo:

```http
GET /api/items?page=1&limit=10
```

Respostas paginadas incluem um objeto `meta`:

```json
{
  "data": [],
  "meta": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1
  }
}
```

## Upload de Imagens

Uploads usam `multipart/form-data` e o campo do arquivo deve se chamar `image`.

Formatos aceitos:

- `image/jpeg`
- `image/png`
- `image/webp`

Limites e comportamento:

- Tamanho máximo: `2MB`.
- Imagens são enviadas para o Cloudinary.
- Imagens são armazenadas na qualidade original enviada por padrão.
- Quando uma imagem de item ou avatar de usuário é substituída, a imagem anterior é deletada do Cloudinary.
- Quando um item ou usuário é deletado, a imagem relacionada também é deletada quando existir.

## Padrão de Resposta

A maioria das respostas de sucesso usa um destes formatos:

```json
{
  "message": "Operação realizada com sucesso.",
  "data": {}
}
```

```json
{
  "data": {}
}
```

Listagens paginadas incluem `meta`:

```json
{
  "data": [],
  "meta": {
    "totalItems": 0,
    "totalPages": 0,
    "currentPage": 1
  }
}
```

## Formato de Erros

### Erro de Validação - 400

```json
{
  "status": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Digite um email válido."
    }
  ]
}
```

### Erro de Negócio - 4xx

```json
{
  "message": "Item não encontrado."
}
```

### Erro de Upload - 400

```json
{
  "message": "O limite do arquivo é de 2MB."
}
```

### Erro Interno - 500

```json
{
  "message": "Internal server error."
}
```

## Referência da API

Base URL:

```text
/api
```

### Auth

#### POST `/login`

Autentica um usuário e retorna um token JWT.

Requer autenticação: Não.

Body:

```json
{
  "email": "joao@example.com",
  "password": "123456"
}
```

Resposta de sucesso: `200 OK`

```json
{
  "data": {
    "token": "jwt-token",
    "user": {
      "userId": "user-id",
      "avatarUrl": "https://res.cloudinary.com/...",
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao@example.com",
      "stockId": "stock-id"
    }
  }
}
```

Possíveis erros:

- `400` erro de validação.
- `401` email ou senha inválidos.

### Usuários

#### POST `/register`

Cria um usuário e automaticamente cria um estoque para ele.

Requer autenticação: Não.

Body:

```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "password": "123456"
}
```

Regras de validação:

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `firstName` | string | Sim | Min 2, max 50 caracteres. |
| `lastName` | string | Sim | Min 2, max 50 caracteres. |
| `email` | string | Sim | Deve ser um email válido e único. |
| `password` | string | Sim | Min 6 caracteres. |

Resposta de sucesso: `201 Created`

```json
{
  "message": "Usuário cadastrado com sucesso!",
  "data": {
    "id": "user-id",
    "email": "joao@example.com",
    "phone": null,
    "avatarPublicId": null,
    "avatarUrl": null,
    "firstName": "João",
    "lastName": "Silva"
  }
}
```

#### GET `/users/me`

Retorna o usuário autenticado e seu estoque.

Requer autenticação: Sim.

Resposta de sucesso: `200 OK`

```json
{
  "message": "Usuário encontrado!",
  "data": {
    "id": "user-id",
    "email": "joao@example.com",
    "phone": null,
    "avatarUrl": null,
    "firstName": "João",
    "lastName": "Silva",
    "stock": {
      "id": "stock-id",
      "userId": "user-id"
    }
  }
}
```

#### PUT `/users/me`

Atualiza o usuário autenticado. Suporta upload de avatar.

Requer autenticação: Sim.

Content type: `multipart/form-data`.

Campos:

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `firstName` | string | Não | Min 2, max 50 caracteres. |
| `lastName` | string | Não | Min 2, max 50 caracteres. |
| `email` | string | Não | Deve ser válido e único. |
| `password` | string | Não | Min 6 caracteres. |
| `phone` | string | Não | 10 ou 11 dígitos numéricos. |
| `image` | arquivo | Não | JPG, PNG ou WEBP, máx. 2MB. |

Resposta de sucesso: `200 OK`

```json
{
  "message": "Usuário atualizado com sucesso!",
  "data": {
    "id": "user-id",
    "email": "joao@example.com",
    "phone": "11999999999",
    "avatarUrl": "https://res.cloudinary.com/...",
    "firstName": "João",
    "lastName": "Silva"
  }
}
```

#### DELETE `/users/me`

Deleta o usuário autenticado.

Requer autenticação: Sim.

Resposta de sucesso: `200 OK`

```json
{
  "message": "Usuário deletado com sucesso!"
}
```

### Itens

#### GET `/items`

Lista os itens do estoque do usuário autenticado.

Requer autenticação: Sim.

Query params:

| Param | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `page` | number | Não | `1` | Página atual. |
| `limit` | number | Não | `10` | Itens por página, máx. `100`. |

Resposta de sucesso: `200 OK`

```json
{
  "data": [
    {
      "id": "item-id",
      "name": "Notebook",
      "quantity": 10,
      "priceInCents": 399900,
      "sku": "NOTE-001",
      "description": "Notebook Dell",
      "imageUrl": "https://res.cloudinary.com/...",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "category": {
        "id": "category-id",
        "name": "Eletrônicos",
        "color": "#3B82F6",
        "iconName": "laptop"
      }
    }
  ],
  "meta": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

#### POST `/items`

Cria um novo item.

Requer autenticação: Sim.

Content type: `multipart/form-data`.

Campos:

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | Sim | Min 4 caracteres. |
| `description` | string | Não | Texto livre. |
| `quantity` | number | Sim | Min 0. |
| `priceInCents` | number | Sim | Min 1. Use centavos, por exemplo `1990` para `R$ 19,90`. |
| `categoryId` | string | Não | Deve pertencer ao estoque do usuário autenticado. |
| `sku` | string | Sim | Obrigatório e único por estoque. |
| `image` | arquivo | Não | JPG, PNG ou WEBP, máx. 2MB. |

Exemplo de campos do formulário:

```text
name=Notebook
sku=NOTE-001
quantity=10
priceInCents=399900
description=Notebook Dell
categoryId=category-id
image=@notebook.webp
```

Resposta de sucesso: `201 Created`

```json
{
  "message": "Item cadastrado com sucesso!",
  "data": {
    "id": "item-id",
    "name": "Notebook",
    "sku": "NOTE-001",
    "quantity": 10,
    "imageUrl": "https://res.cloudinary.com/..."
  }
}
```

#### GET `/items/:id`

Retorna um item por ID, incluindo categoria e histórico de movimentações.

Requer autenticação: Sim.

Resposta de sucesso: `200 OK`

```json
{
  "data": {
    "id": "item-id",
    "imageUrl": "https://res.cloudinary.com/...",
    "imagePublicId": "stock-gestor/stocks/...",
    "name": "Notebook",
    "description": "Notebook Dell",
    "quantity": 10,
    "priceInCents": 399900,
    "sku": "NOTE-001",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "stockId": "stock-id",
    "category": {
      "id": "category-id",
      "name": "Eletrônicos"
    },
    "movements": [
      {
        "id": "movement-id",
        "userName": "João Silva",
        "reason": "Correção de preço",
        "changes": [
          {
            "field": "priceInCents",
            "oldValue": "399900",
            "newValue": "389900"
          }
        ],
        "createdAt": "2026-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

#### PUT `/items/:id`

Atualiza um item. Toda atualização bem-sucedida com alterações cria uma movimentação de estoque.

Requer autenticação: Sim.

Content type: `multipart/form-data`.

Regras:

- `reason` é obrigatório.
- Pelo menos um campo do item, `image` ou `removeImage=true` deve ser enviado.
- `sku` deve continuar único dentro do mesmo estoque.
- `categoryId` deve pertencer ao estoque do usuário autenticado.
- Envie `categoryId=null` para remover a categoria do item.
- Envie `removeImage=true` para remover a imagem atual.

Campos:

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `reason` | string | Sim | Explica por que o item foi atualizado. |
| `name` | string | Não | Min 4 caracteres. |
| `description` | string | Não | Texto livre. |
| `quantity` | number | Não | Min 0. |
| `priceInCents` | number | Não | Min 1. |
| `categoryId` | string ou null | Não | ID da categoria ou `null` para desconectar. |
| `sku` | string | Não | Único por estoque. |
| `image` | arquivo | Não | Substitui a imagem atual. |
| `removeImage` | string | Não | Use `true` para remover a imagem atual. |

Resposta de sucesso: `200 OK`

```json
{
  "message": "Item atualizado com sucesso!",
  "data": {
    "id": "item-id",
    "name": "Notebook",
    "description": "Notebook Dell",
    "quantity": 12,
    "priceInCents": 389900,
    "sku": "NOTE-001",
    "imageUrl": "https://res.cloudinary.com/...",
    "imagePublicId": "stock-gestor/stocks/...",
    "stockId": "stock-id",
    "categoryId": "category-id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
}
```

#### DELETE `/items/:id`

Deleta um item e sua imagem no Cloudinary quando existir.

Requer autenticação: Sim.

Resposta de sucesso: `200 OK`

```json
{
  "message": "Item deletado com sucesso!"
}
```

### Categorias

#### GET `/categories`

Lista as categorias do estoque do usuário autenticado.

Requer autenticação: Sim.

Query params:

| Param | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `page` | number | Não | `1` | Página atual. |
| `limit` | number | Não | `10` | Itens por página, máx. `100`. |

Resposta de sucesso: `200 OK`

```json
{
  "data": [
    {
      "id": "category-id",
      "name": "Eletrônicos",
      "stockId": "stock-id",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "color": "#3B82F6",
      "iconName": "laptop"
    }
  ],
  "meta": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

#### POST `/categories`

Cria uma categoria no estoque do usuário autenticado.

Requer autenticação: Sim.

Body:

```json
{
  "name": "Eletrônicos",
  "color": "#3B82F6",
  "iconName": "laptop"
}
```

Campos:

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | Sim | Nome da categoria. Deve ser único por estoque, ignorando maiúsculas/minúsculas. |
| `color` | string | Sim | Valor de cor usado pelo frontend. |
| `iconName` | string | Sim | Identificador de ícone usado pelo frontend. |

Resposta de sucesso: `201 Created`

```json
{
  "message": "Categoria cadastrada!",
  "data": {
    "id": "category-id",
    "name": "Eletrônicos",
    "stockId": "stock-id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "color": "#3B82F6",
    "iconName": "laptop"
  }
}
```

#### GET `/categories/:id`

Retorna uma categoria por ID.

Requer autenticação: Sim.

Resposta de sucesso: `200 OK`

```json
{
  "data": {
    "id": "category-id",
    "name": "Eletrônicos",
    "stockId": "stock-id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "color": "#3B82F6",
    "iconName": "laptop"
  }
}
```

#### PUT `/categories/:id`

Atualiza uma categoria. Pelo menos um campo deve ser enviado.

Requer autenticação: Sim.

Body:

```json
{
  "name": "Hardware",
  "color": "#22C55E",
  "iconName": "cpu"
}
```

Campos:

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | Não | Deve ser único por estoque, ignorando maiúsculas/minúsculas. |
| `color` | string | Não | Valor de cor usado pelo frontend. |
| `iconName` | string | Não | Identificador de ícone usado pelo frontend. |

Resposta de sucesso: `200 OK`

```json
{
  "data": {
    "id": "category-id",
    "name": "Hardware",
    "stockId": "stock-id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z",
    "color": "#22C55E",
    "iconName": "cpu"
  }
}
```

#### DELETE `/categories/:id`

Deleta uma categoria.

Requer autenticação: Sim.

Resposta de sucesso: `200 OK`

```json
{
  "message": "Categoria deletada com sucesso."
}
```

### Dashboard

#### GET `/dashboard`

Retorna estatísticas do estoque do usuário autenticado.

Requer autenticação: Sim.

Resposta de sucesso: `200 OK`

```json
{
  "data": {
    "totalDifferentItems": 12,
    "totalQuantity": 245,
    "lowStockCount": 2,
    "lowStockItems": [
      {
        "id": "item-id",
        "name": "Notebook",
        "quantity": 4
      }
    ],
    "recentItems": [
      {
        "id": "item-id",
        "name": "Notebook",
        "quantity": 10,
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "topMovements": [
      {
        "label": "Notebook",
        "value": 5
      }
    ],
    "itemsByCategory": [
      {
        "label": "Eletrônicos",
        "value": 8
      }
    ],
    "needsAttention": [
      {
        "id": "item-id",
        "name": "Mouse",
        "missingFields": ["imageUrl", "description"]
      }
    ]
  }
}
```

Campos do dashboard:

| Campo | Descrição |
|-------|-----------|
| `totalDifferentItems` | Total de itens distintos no estoque. |
| `totalQuantity` | Soma da quantidade de todos os itens. |
| `lowStockCount` | Quantidade de itens com estoque menor ou igual a 10. |
| `lowStockItems` | Itens com quantidade menor ou igual a 10. |
| `recentItems` | 10 itens criados mais recentemente. |
| `topMovements` | 5 itens com maior número de movimentações. |
| `itemsByCategory` | Top 5 categorias por quantidade de itens. |
| `needsAttention` | Itens sem campos importantes, como imagem, descrição, categoria ou preço. |

## Movimentações de Estoque

Uma movimentação é criada quando a atualização de um item altera pelo menos um campo rastreado.

Campos rastreados:

- `name`
- `quantity`
- `priceInCents`
- `sku`
- `categoryId`
- `image`

Exemplo de movimentação:

```json
{
  "id": "movement-id",
  "userName": "João Silva",
  "reason": "Correção de preço",
  "changes": [
    {
      "field": "priceInCents",
      "oldValue": "399900",
      "newValue": "389900"
    }
  ],
  "createdAt": "2026-01-02T00:00:00.000Z"
}
```

## Licença

MIT

## Autor

Feito por João Vitor - [LinkedIn](https://www.linkedin.com/in/jvssvj/) - [GitHub](https://github.com/jvssvj)
