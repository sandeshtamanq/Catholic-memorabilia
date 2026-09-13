# Catholic Memorabilia API

Backend service for the Catholic Memorabilia platform, built with NestJS and TypeORM. The API supports authentication, role-based access control, category management, product catalog management, and email-based account flows for a Catholic merchandise storefront.

## Overview

This project provides the server-side foundation for a catalog and storefront application where:

- users can sign up and log in
- admin users can manage categories and products
- public endpoints expose categories and products
- product images are uploaded and stored through a file-storage service
- email notifications are sent for account verification and password reset flows
- Swagger documentation is available for API exploration

## Tech stack

- Node.js 20
- NestJS 10
- TypeScript
- PostgreSQL
- TypeORM
- Passport + JWT authentication
- Swagger/OpenAPI
- Docker + Docker Compose
- AWS S3-compatible storage via Supabase storage client
- Nodemailer / Nest mailer

## Project structure

```text
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── AppConfig.ts
│   └── DatabaseConfig.ts
├── core/
│   ├── auth/
│   ├── category/
│   ├── product/
│   └── user/
├── infra/
│   ├── mail/
│   └── supabase/
├── lib/
│   ├── decorators/
│   ├── templates/
│   └── utils/
└── test/
```

## Features

### Authentication and users

- user sign-up with strong password validation
- login with email and password
- JWT-based protected routes
- user role support: `Admin` and `User`
- current user profile endpoint
- email verification flow during sign-up

### Catalog management

- create, list, update, and delete categories
- create, list, update, and delete products
- category/product relation using TypeORM
- product image upload support via multipart form-data

### Security

- JWT guard on protected API routes
- role guard for admin-only actions
- validation pipe for request DTO validation
- helmet, compression, and cookie parsing enabled in the application bootstrap

## Prerequisites

Before starting the app, install:

- Node.js 20+
- npm
- PostgreSQL 16+ or Docker

## Environment configuration

The app loads environment files from the `env` directory. For local development, create a file named `env/local.env` and populate it using the values from `.env.example` as a reference.

Example:

```bash
mkdir -p env
cp .env.example env/local.env
```

Required variables include:

```env
NODE_ENV=local
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=catholic_memorabilia
DATABASE_SYNC=true
DATABASE_MIGRATIONS_RUN=true
JWT_SECRET=change-me-super-secret
FE_APP=http://localhost:4200
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=true
MAIL_USER=change-me
MAIL_PASS=change-me
```

If you use Supabase storage for uploaded product images, add the S3/storage-related values expected by the app as well (for example `SUPABASE_S3_ENDPOINT`, `SUPABASE_S3_REGION`, and the access credentials).

## Local development

Install dependencies:

```bash
npm install
```

Start the app in watch mode:

```bash
npm run start:dev
```

The API will run on:

```text
http://localhost:3000
```

Swagger UI is available at:

```text
http://localhost:3000/docs
```

## Production build

```bash
npm run build
npm run start:prod
```

## Docker setup

This repository includes a Docker Compose setup for running the API and PostgreSQL together.

```bash
docker compose up --build
```

Services:

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Available API endpoints

### Auth

- `POST /auth/sign-up` — create a new account
- `POST /auth/login` — login and receive a JWT token
- `GET /auth/test` — protected test route using JWT

### Users

- `GET /users/me` — fetch the authenticated user profile

### Categories

- `GET /categories` — list categories
- `POST /categories` — create category (admin only)
- `PATCH /categories/:id` — update category (admin only)
- `DELETE /categories/:id` — delete category (admin only)

### Products

- `GET /products` — list all products
- `POST /products` — create product with image upload (admin only)
- `GET /products/:id` — fetch product detail (admin only)
- `PATCH /products/:id` — update product and image (admin only)
- `DELETE /products/:id` — delete product (admin only)

## Example payloads

### Sign up

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "contactNumber": "+61412345678",
  "address": "123 Main Street",
  "password": "StrongPass123!"
}
```

### Login

```json
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

### Create category

```json
{
  "categoryName": "Sacred Art"
}
```

### Create product

Use multipart form-data with fields:

- `productName`
- `productDescription`
- `productPrice`
- `categoryId`
- `productImage` (file upload)

## Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## License

This project is currently unlicensed in the package metadata (`"license": "UNLICENSED"`).

## Notes

- The app uses `DATABASE_SYNC=true` and `DATABASE_MIGRATIONS_RUN=true` in the default configuration for local setup.
- Some integrations such as Supabase storage, Firebase, and email delivery are wired into the application and require valid credentials in the environment.
- The app title and Swagger documentation are configured in `src/main.ts` under the `Catholic-memorabilia` project name.
