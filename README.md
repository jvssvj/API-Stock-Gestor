# 📦 API Stock Gestor

[Veja a versão do README em Português](README.PTBR.md)

A RESTful API for inventory management with JWT authentication, image uploads via Cloudinary, and full stock movement history.

**Live:** https://api-stock-gestor.vercel.app

---

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma (PostgreSQL)
- **Auth:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **Image Upload:** Cloudinary
- **Deploy:** Vercel

---

## 📐 Architecture

```
src/
├── routes/         → HTTP route definitions
├── controllers/    → Request/response handling
├── services/       → Business logic
├── repositories/   → Database access (Prisma)
├── schemas/        → Zod validation schemas
├── middlewares/    → Auth, upload, error handling
└── errors/         → Custom error classes
```

The project follows a layered architecture: **routes → controllers → services → repositories**.

---

## ⚙️ Environment Variables

Create a `.env` file at the root of the project:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## 🗄️ Data Model

```
User
 └── Stock (1:1)
      ├── Item[] (1:N)
      │    └── StockMovement[] (1:N)
      └── Category[] (1:N)
```

- Each **User** automatically gets a **Stock** on registration.
- **Items** belong to a Stock and optionally to a **Category**.
- Every item update generates a **StockMovement** with a change log and reason.

---

## 🔐 Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is obtained via `POST /api/login` and expires in **1 day**.

---

## 📡 API Endpoints

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/login` | ❌ | Authenticate and receive a JWT token |

**Request body:**
```json
{
  "email": "user@email.com",
  "password": "123456"
}
```

---

### Users

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/users` | ❌ | Create a new user |
| GET | `/api/users/:id` | ✅ | Get user |
| PUT | `/api/users/:id` | ✅ | Update user (supports image upload) |
| DELETE | `/api/users/:id` | ✅ | Delete user |

**Create user body:**
```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "123456"
}
```

**Update user** — multipart/form-data, all fields optional:
- `name`, `email`, `password`, `phone`
- `image` (file — JPG, PNG or WEBP, max 2MB)

---

### Items

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/items` | ✅ | List all items for the authenticated user |
| POST | `/api/items` | ✅ | Create a new item |
| GET | `/api/items/:id` | ✅ | Get item by ID (includes movement history) |
| PUT | `/api/items/:id` | ✅ | Update item |
| DELETE | `/api/items/:id` | ✅ | Delete item |

**Create item** — multipart/form-data:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Min 4 characters |
| `sku` | string | ✅ | Unique per stock |
| `quantity` | number | ✅ | Min 0 |
| `priceInCents` | number | ✅ | Price in cents (e.g. 1990 = $19.90) |
| `description` | string | ❌ | Item description |
| `categoryId` | string | ❌ | Must belong to the user's stock |
| `image` | file | ❌ | JPG, PNG or WEBP, max 2MB |

**Update item** — multipart/form-data, at least one field required:

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | ✅ (if any field is changed) |
| `name`, `sku`, `quantity`, `priceInCents`, `description`, `categoryId` | — | at least one |
| `image` | file | ❌ |

---

### Categories

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/categories` | ✅ | List all categories for the user's stock |
| POST | `/api/categories` | ✅ | Create a new category |
| GET | `/api/categories/:id` | ✅ | Get category by ID |
| PUT | `/api/categories/:id` | ✅ | Update category |
| DELETE | `/api/categories/:id` | ✅ | Delete category |

**Create/update category body:**
```json
{
  "name": "Electronics",
  "color": "#3B82F6",
  "iconName": "laptop"
}
```

Each user's stock can't have two categories with the same name or the same color.

---

### Dashboard

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/dashboard` | ✅ | Get stock statistics |

**Response includes:**
- `totalDifferentItems` — total distinct items
- `totalQuantity` — sum of all item quantities
- `lowStockItems` — items with quantity ≤ 10
- `recentItems` — 10 most recently added items
- `topMovements` — 5 most updated items
- `itemsByCategory` — item count per category (top 5)
- `needsAttention` — items with missing fields (no image, no description, no category, or price = 0)

---

## 📋 Error Format

**Validation errors (400):**
```json
{
  "status": "Validation Error",
  "errors": [
    { "field": "email", "message": "Enter a valid email." },
    { "field": "sku", "message": "SKU is required." }
  ]
}
```

**Business errors (4xx):**
```json
{
  "message": "Item not found."
}
```

**Internal errors (500):**
```json
{
  "message": "Internal server error."
}
```

---

## 📦 Stock Movements

Every item update that changes at least one field generates a `StockMovement` record. The change log is attached to the item and available via `GET /api/items/:id`.

```json
{
  "id": "...",
  "userName": "John Doe",
  "reason": "Price correction",
  "changes": [
    { "field": "priceInCents", "oldValue": "1000", "newValue": "1990" }
  ],
  "createdAt": "2026-01-25T..."
}
```

---

## 📸 Image Upload

Images are uploaded to **Cloudinary** and automatically resized to 800×500px. Supported formats: **JPG, PNG, WEBP**. Max size: **2MB**.

When an item or user avatar is updated with a new image, the previous image is automatically deleted from Cloudinary.

---

## 📜 License

MIT

## 👨‍💻 Author

Made by João Vitor — [LinkedIn](https://www.linkedin.com/in/jvssvj/) · [GitHub](https://github.com/jvssvj)
