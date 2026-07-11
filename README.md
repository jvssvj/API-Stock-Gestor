# API Stock Gestor

[Leia a versao em Portugues](README.PTBR.md)

RESTful API for inventory management with JWT authentication, PostgreSQL persistence, item categories, Cloudinary image uploads, dashboard metrics, and item update history.

**Live API:** https://api-stock-gestor.vercel.app

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [Pagination](#pagination)
- [Image Uploads](#image-uploads)
- [Response Pattern](#response-pattern)
- [Error Format](#error-format)
- [API Reference](#api-reference)
- [Stock Movements](#stock-movements)
- [License](#license)
- [Author](#author)

## Features

- User registration and login with JWT.
- One stock is automatically created for each user.
- Authenticated user profile management.
- Item CRUD with optional category and image.
- Category CRUD scoped to the authenticated user's stock.
- Paginated item and category listings.
- Dashboard statistics for inventory monitoring.
- Stock movement history for item updates.
- Image upload to Cloudinary with old image cleanup on replacement or deletion.
- Centralized validation and error handling.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Zod
- **File Upload:** Multer
- **Image Storage:** Cloudinary
- **Deploy:** Vercel

## Project Architecture

```text
src/
  routes/         HTTP route definitions
  controllers/    Request and response handling
  services/       Business rules and orchestration
  repositories/   Database access with Prisma
  schemas/        Zod validation schemas
  middlewares/    Auth, upload, and error handling
  errors/         Custom error classes
  database/       Prisma client instance
```

The API follows a layered flow:

```text
routes -> controllers -> services -> repositories -> database
```

## Requirements

- Node.js 20 or newer is recommended.
- npm.
- PostgreSQL database.
- Cloudinary account.

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
ALLOWED_ORIGIN=http://localhost:5173
PORT=3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWT tokens. |
| `CLOUDINARY_NAME` | Yes | Cloudinary cloud name. |
| `CLOUDINARY_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_SECRET` | Yes | Cloudinary API secret. |
| `ALLOWED_ORIGIN` | Yes | Frontend origin allowed by CORS. |
| `PORT` | No | Local server port. Defaults to `3000`. |

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run dev
```

The local API will run at:

```text
http://localhost:3000/api
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server with `tsx watch`. |
| `npm run build` | Generates Prisma Client and compiles TypeScript. |
| `npm start` | Runs the compiled application from `dist/server.js`. |
| `npx prisma migrate dev` | Runs database migrations in development. |
| `npx prisma studio` | Opens Prisma Studio for database inspection. |

## Data Model

```text
User
  Stock (1:1)
    Category[] (1:N)
    Item[] (1:N)
      StockMovement[] (1:N)
```

### User

Represents an application account. A stock is created automatically when the user registers.

Important fields:

- `id`
- `firstName`
- `lastName`
- `email`
- `password`
- `phone`
- `avatarUrl`
- `avatarPublicId`

### Stock

Represents the user's inventory container. Each user has one stock.

### Category

Groups items inside a stock.

Important fields:

- `id`
- `name`
- `color`
- `iconName`
- `stockId`

### Item

Represents an inventory item.

Important fields:

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

Stores the update history of an item.

Important fields:

- `id`
- `itemId`
- `userId`
- `userName`
- `reason`
- `changes`
- `createdAt`

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

The token is returned by `POST /api/login` and expires in 1 day.

The JWT payload includes:

- `userId`
- `firstName`
- `lastName`
- `stockId`

## Pagination

The item and category list endpoints accept pagination through query parameters.

| Query param | Type | Default | Limit | Description |
|-------------|------|---------|-------|-------------|
| `page` | number | `1` | Positive integer | Current page. |
| `limit` | number | `10` | Max `100` | Items per page. |

Example:

```http
GET /api/items?page=1&limit=10
```

Paginated responses include a `meta` object:

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

## Image Uploads

Image uploads use `multipart/form-data` and the file field must be named `image`.

Accepted formats:

- `image/jpeg`
- `image/png`
- `image/webp`

Limits and behavior:

- Max file size: `2MB`.
- Images are uploaded to Cloudinary.
- Images are stored in their original uploaded quality by default.
- When an item image or user avatar is replaced, the previous Cloudinary image is deleted.
- When an item or user is deleted, its related Cloudinary image is deleted when available.

## Response Pattern

Most successful responses use one of these formats:

```json
{
  "message": "Operation completed successfully.",
  "data": {}
}
```

```json
{
  "data": {}
}
```

Paginated list responses include `meta`:

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

## Error Format

### Validation Error - 400

```json
{
  "status": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Enter a valid email."
    }
  ]
}
```

### Business Error - 4xx

```json
{
  "message": "Item not found."
}
```

### Upload Error - 400

```json
{
  "message": "The file size limit is 2MB."
}
```

### Internal Error - 500

```json
{
  "message": "Internal server error."
}
```

## API Reference

Base URL:

```text
/api
```

### Auth

#### POST `/login`

Authenticates a user and returns a JWT token.

Auth required: No.

Request body:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

Success response: `200 OK`

```json
{
  "data": {
    "token": "jwt-token",
    "user": {
      "userId": "user-id",
      "avatarUrl": "https://res.cloudinary.com/...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "stockId": "stock-id"
    }
  }
}
```

Possible errors:

- `400` validation error.
- `401` invalid email or password.

### Users

#### POST `/register`

Creates a new user and automatically creates a stock for that user.

Auth required: No.

Request body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

Validation rules:

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `firstName` | string | Yes | Min 2, max 50 characters. |
| `lastName` | string | Yes | Min 2, max 50 characters. |
| `email` | string | Yes | Must be a valid and unique email. |
| `password` | string | Yes | Min 6 characters. |

Success response: `201 Created`

```json
{
  "message": "User registered successfully!",
  "data": {
    "id": "user-id",
    "email": "john@example.com",
    "phone": null,
    "avatarPublicId": null,
    "avatarUrl": null,
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### GET `/users/me`

Returns the authenticated user and its stock.

Auth required: Yes.

Success response: `200 OK`

```json
{
  "message": "User found!",
  "data": {
    "id": "user-id",
    "email": "john@example.com",
    "phone": null,
    "avatarUrl": null,
    "firstName": "John",
    "lastName": "Doe",
    "stock": {
      "id": "stock-id",
      "userId": "user-id"
    }
  }
}
```

#### PUT `/users/me`

Updates the authenticated user. Supports avatar upload.

Auth required: Yes.

Content type: `multipart/form-data`.

Fields:

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `firstName` | string | No | Min 2, max 50 characters. |
| `lastName` | string | No | Min 2, max 50 characters. |
| `email` | string | No | Must be valid and unique. |
| `password` | string | No | Min 6 characters. |
| `phone` | string | No | 10 or 11 numeric digits. |
| `image` | file | No | JPG, PNG or WEBP, max 2MB. |

Success response: `200 OK`

```json
{
  "message": "User updated successfully!",
  "data": {
    "id": "user-id",
    "email": "john@example.com",
    "phone": "11999999999",
    "avatarUrl": "https://res.cloudinary.com/...",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### DELETE `/users/me`

Deletes the authenticated user.

Auth required: Yes.

Success response: `200 OK`

```json
{
  "message": "User deleted successfully!"
}
```

### Items

#### GET `/items`

Lists items from the authenticated user's stock.

Auth required: Yes.

Query parameters:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | number | No | `1` | Current page. |
| `limit` | number | No | `10` | Items per page, max `100`. |

Success response: `200 OK`

```json
{
  "data": [
    {
      "id": "item-id",
      "name": "Notebook",
      "quantity": 10,
      "priceInCents": 399900,
      "sku": "NOTE-001",
      "description": "Dell notebook",
      "imageUrl": "https://res.cloudinary.com/...",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "category": {
        "id": "category-id",
        "name": "Electronics",
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

Creates a new item.

Auth required: Yes.

Content type: `multipart/form-data`.

Fields:

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | Min 4 characters. |
| `description` | string | No | Free text. |
| `quantity` | number | Yes | Min 0. |
| `priceInCents` | number | Yes | Min 1. Use cents, for example `1990` for `$19.90`. |
| `categoryId` | string | No | Must belong to the authenticated user's stock. |
| `sku` | string | Yes | Required and unique per stock. |
| `image` | file | No | JPG, PNG or WEBP, max 2MB. |

Example form fields:

```text
name=Notebook
sku=NOTE-001
quantity=10
priceInCents=399900
description=Dell notebook
categoryId=category-id
image=@notebook.webp
```

Success response: `201 Created`

```json
{
  "message": "Item created successfully!",
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

Returns one item by ID, including category and movement history.

Auth required: Yes.

Success response: `200 OK`

```json
{
  "data": {
    "id": "item-id",
    "imageUrl": "https://res.cloudinary.com/...",
    "imagePublicId": "stock-gestor/stocks/...",
    "name": "Notebook",
    "description": "Dell notebook",
    "quantity": 10,
    "priceInCents": 399900,
    "sku": "NOTE-001",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "stockId": "stock-id",
    "category": {
      "id": "category-id",
      "name": "Electronics"
    },
    "movements": [
      {
        "id": "movement-id",
        "userName": "John Doe",
        "reason": "Price correction",
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

Updates an item. Every successful update with changes creates a stock movement record.

Auth required: Yes.

Content type: `multipart/form-data`.

Rules:

- `reason` is required.
- At least one item field, `image`, or `removeImage=true` must be sent.
- `sku` must remain unique within the same stock.
- `categoryId` must belong to the authenticated user's stock.
- Send `categoryId=null` to remove the category association.
- Send `removeImage=true` to delete the current image.

Fields:

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `reason` | string | Yes | Explains why the item was updated. |
| `name` | string | No | Min 4 characters. |
| `description` | string | No | Free text. |
| `quantity` | number | No | Min 0. |
| `priceInCents` | number | No | Min 1. |
| `categoryId` | string or null | No | Category ID or `null` to disconnect. |
| `sku` | string | No | Unique per stock. |
| `image` | file | No | Replaces the current image. |
| `removeImage` | string | No | Use `true` to remove the current image. |

Success response: `200 OK`

```json
{
  "message": "Item updated successfully!",
  "data": {
    "id": "item-id",
    "name": "Notebook",
    "description": "Dell notebook",
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

Deletes an item and its Cloudinary image when available.

Auth required: Yes.

Success response: `200 OK`

```json
{
  "message": "Item deleted successfully!"
}
```

### Categories

#### GET `/categories`

Lists categories from the authenticated user's stock.

Auth required: Yes.

Query parameters:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | number | No | `1` | Current page. |
| `limit` | number | No | `10` | Items per page, max `100`. |

Success response: `200 OK`

```json
{
  "data": [
    {
      "id": "category-id",
      "name": "Electronics",
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

Creates a category in the authenticated user's stock.

Auth required: Yes.

Request body:

```json
{
  "name": "Electronics",
  "color": "#3B82F6",
  "iconName": "laptop"
}
```

Fields:

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | Category name. Must be unique per stock, case-insensitive. |
| `color` | string | Yes | Color value used by the frontend. |
| `iconName` | string | Yes | Icon identifier used by the frontend. |

Success response: `201 Created`

```json
{
  "message": "Category created!",
  "data": {
    "id": "category-id",
    "name": "Electronics",
    "stockId": "stock-id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "color": "#3B82F6",
    "iconName": "laptop"
  }
}
```

#### GET `/categories/:id`

Returns one category by ID.

Auth required: Yes.

Success response: `200 OK`

```json
{
  "data": {
    "id": "category-id",
    "name": "Electronics",
    "stockId": "stock-id",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "color": "#3B82F6",
    "iconName": "laptop"
  }
}
```

#### PUT `/categories/:id`

Updates a category. At least one field must be sent.

Auth required: Yes.

Request body:

```json
{
  "name": "Hardware",
  "color": "#22C55E",
  "iconName": "cpu"
}
```

Fields:

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | No | Must be unique per stock, case-insensitive. |
| `color` | string | No | Color value used by the frontend. |
| `iconName` | string | No | Icon identifier used by the frontend. |

Success response: `200 OK`

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

Deletes a category.

Auth required: Yes.

Success response: `200 OK`

```json
{
  "message": "Category deleted successfully."
}
```

### Dashboard

#### GET `/dashboard`

Returns inventory statistics for the authenticated user's stock.

Auth required: Yes.

Success response: `200 OK`

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
        "label": "Electronics",
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

Dashboard fields:

| Field | Description |
|-------|-------------|
| `totalDifferentItems` | Total number of distinct items in stock. |
| `totalQuantity` | Sum of all item quantities. |
| `lowStockCount` | Number of items with quantity less than or equal to 10. |
| `lowStockItems` | Items with quantity less than or equal to 10. |
| `recentItems` | 10 most recently created items. |
| `topMovements` | 5 items with the highest number of movements. |
| `itemsByCategory` | Top 5 categories by item count. |
| `needsAttention` | Items missing important fields such as image, description, category, or price. |

## Stock Movements

A stock movement is created when an item update changes at least one tracked field.

Tracked fields include:

- `name`
- `quantity`
- `priceInCents`
- `sku`
- `categoryId`
- `image`

Example movement:

```json
{
  "id": "movement-id",
  "userName": "John Doe",
  "reason": "Price correction",
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

## License

MIT

## Author

Made by Joao Vitor - [LinkedIn](https://www.linkedin.com/in/jvssvj/) - [GitHub](https://github.com/jvssvj)
