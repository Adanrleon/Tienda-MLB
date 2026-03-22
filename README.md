# Tienda MLB

E-commerce fullstack desacoplado para la venta de jerseys MLB, siguiendo la especificacion final:

- `apps/web`: Next.js + React + Tailwind CSS + Framer Motion + NextAuth.js
- `apps/api`: NestJS + Prisma + PostgreSQL + Stripe

## Arquitectura

- Frontend SSR/CSR hibrido con App Router
- Backend REST independiente
- PostgreSQL como base de datos relacional
- Prisma como ORM
- Login obligatorio para carrito y checkout
- Ruta `/admin` protegida por rol `ADMIN`

## Estructura

```text
.
+-- apps/
|   +-- api/
|   |   +-- prisma/
|   |   \-- src/
|   \-- web/
|       \-- src/
+-- .env.example
\-- package.json
```

## Variables de entorno

Usa `.env.example` como base. Las principales son:

- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`

## Scripts

Desde la raiz:

```bash
npm install
npm run dev:api
npm run dev:web
```

## Backend

Endpoints principales:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/session/exchange`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/:slug`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `POST /api/checkout/session`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `POST /api/admin/products/upload`

## Frontend

Pantallas incluidas:

- `/`
- `/catalog`
- `/product/[slug]`
- `/cart`
- `/checkout`
- `/login`
- `/admin`

La UI usa datos mock si la API aun no esta corriendo, para que el frontend no quede bloqueado.

## Notas

- El carrito del frontend persiste en `localStorage` como fallback visual y de UX.
- El checkout usa Stripe si `STRIPE_SECRET_KEY` esta configurada; si no, devuelve una URL mock de exito.
- Para habilitar el panel admin, asigna el rol `ADMIN` a un usuario en la base de datos.
