# 📦 API Stock Gestor

[See the english version of the README.](README.md)

API RESTful para gestão de estoque com autenticação JWT, upload de imagens via Cloudinary e histórico completo de movimentações.

**Deploy:** https://api-stock-gestor.vercel.app

---

## 🛠️ Tecnologias

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma (PostgreSQL)
- **Auth:** JWT (JSON Web Tokens)
- **Validação:** Zod
- **Upload de imagens:** Cloudinary
- **Deploy:** Vercel

---

## 📐 Arquitetura

```
src/
├── routes/         → Definição das rotas HTTP
├── controllers/    → Tratamento de request/response
├── services/       → Regras de negócio
├── repositories/   → Acesso ao banco de dados (Prisma)
├── schemas/        → Schemas de validação com Zod
├── middlewares/    → Auth, upload e tratamento de erros
└── errors/         → Classes de erro customizadas
```

O projeto segue uma arquitetura em camadas: **routes → controllers → services → repositories**.

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=seu_jwt_secret
CLOUDINARY_NAME=seu_cloud_name
CLOUDINARY_KEY=sua_api_key
CLOUDINARY_SECRET=sua_api_secret
```

---

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Rodar as migrations do banco
npx prisma migrate dev

# Iniciar o servidor em desenvolvimento
npm run dev
```

---

## 🗄️ Modelo de Dados

```
User
 └── Stock (1:1)
      ├── Item[] (1:N)
      │    └── StockMovement[] (1:N)
      └── Category[] (1:N)
```

- Cada **User** recebe um **Stock** automaticamente ao se cadastrar.
- **Items** pertencem a um Stock e, opcionalmente, a uma **Category**.
- Toda atualização de item gera um **StockMovement** com log de alterações e motivo.

---

## 🔐 Autenticação

Todas as rotas protegidas exigem um token `Bearer` no header `Authorization`:

```
Authorization: Bearer <token>
```

O token é obtido via `POST /api/login` e expira em **1 dia**.

---

## 📡 Endpoints

### Auth

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/login` | ❌ | Autentica e retorna um token JWT |

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "123456"
}
```

---

### Usuários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/users` | ❌ | Criar novo usuário |
| GET | `/api/users/me` | ✅ | Buscar usuário |
| PUT | `/api/users/me` | ✅ | Atualizar usuário (suporta upload de avatar) |
| DELETE | `/api/users/me` | ✅ | Deletar usuário |

**Criar usuário — body JSON:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

**Atualizar usuário** — multipart/form-data, todos os campos opcionais:
- `name`, `email`, `password`, `phone`
- `image` (arquivo — JPG, PNG ou WEBP, máx. 2MB)

---

### Itens

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/items` | ✅ | Listar todos os itens do usuário autenticado |
| POST | `/api/items` | ✅ | Criar novo item |
| GET | `/api/items/:id` | ✅ | Buscar item por ID (inclui histórico de movimentações) |
| PUT | `/api/items/:id` | ✅ | Atualizar item |
| DELETE | `/api/items/:id` | ✅ | Deletar item |

**Criar item** — multipart/form-data:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | ✅ | Mínimo 4 caracteres |
| `sku` | string | ✅ | Único por estoque |
| `quantity` | number | ✅ | Mínimo 0 |
| `priceInCents` | number | ✅ | Preço em centavos (ex: 1990 = R$19,90) |
| `description` | string | ❌ | Descrição do item |
| `categoryId` | string | ❌ | Deve pertencer ao estoque do usuário |
| `image` | arquivo | ❌ | JPG, PNG ou WEBP, máx. 2MB |

**Atualizar item** — multipart/form-data, ao menos um campo obrigatório:

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `reason` | string | ✅ (se algum campo for alterado) |
| `name`, `sku`, `quantity`, `priceInCents`, `description`, `categoryId` | — | ao menos um |
| `image` | arquivo | ❌ |

---

### Categorias

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/categories` | ✅ | Listar categorias do estoque do usuário |
| POST | `/api/categories` | ✅ | Criar nova categoria |
| GET | `/api/categories/:id` | ✅ | Buscar categoria por ID |
| PUT | `/api/categories/:id` | ✅ | Atualizar categoria |
| DELETE | `/api/categories/:id` | ✅ | Deletar categoria |

**Body para criar/atualizar:**
```json
{
  "name": "Eletrônicos",
  "color": "#3B82F6",
  "iconName": "laptop"
}
```

Cada estoque não pode ter duas categorias com o mesmo nome ou a mesma cor.

---

### Dashboard

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/dashboard` | ✅ | Estatísticas do estoque |

**Resposta inclui:**
- `totalDifferentItems` — total de itens distintos
- `totalQuantity` — soma de todas as quantidades
- `lowStockItems` — itens com quantidade ≤ 10
- `recentItems` — 10 itens adicionados mais recentemente
- `topMovements` — 5 itens com mais movimentações
- `itemsByCategory` — contagem de itens por categoria (top 5)
- `needsAttention` — itens com campos incompletos (sem imagem, sem descrição, sem categoria ou preço = 0)

---

## 📋 Formato de Erros

**Erros de validação (400):**
```json
{
  "status": "Validation Error",
  "errors": [
    { "field": "email", "message": "Digite um email válido." },
    { "field": "sku", "message": "SKU é obrigatório." }
  ]
}
```

**Erros de negócio (4xx):**
```json
{
  "message": "Item não encontrado."
}
```

**Erros internos (500):**
```json
{
  "message": "Internal server error."
}
```

---

## 📦 Movimentações de Estoque

Toda atualização de item que altere ao menos um campo gera um registro de `StockMovement`. O histórico fica disponível ao buscar o item via `GET /api/items/:id`.

```json
{
  "id": "...",
  "userName": "João Silva",
  "reason": "Correção de preço",
  "changes": [
    { "field": "priceInCents", "oldValue": "1000", "newValue": "1990" }
  ],
  "createdAt": "2026-01-25T..."
}
```

---

## 📸 Upload de Imagens

As imagens são enviadas para o **Cloudinary** e redimensionadas automaticamente para 800×500px. Formatos aceitos: **JPG, PNG, WEBP**. Tamanho máximo: **2MB**.

Ao atualizar um item ou avatar de usuário com uma nova imagem, a imagem anterior é deletada automaticamente do Cloudinary.

---

## 📜 Licença

MIT 

## 👨‍💻 Autor

Feito por João Vitor — [LinkedIn](https://www.linkedin.com/in/jvssvj/) · [GitHub](https://github.com/jvssvj)