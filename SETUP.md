# 🚀 Guía de Configuración Local - Tienda MLB

Esta guía te ayudará a configurar el proyecto **Tienda MLB** en tu computadora para desarrollo.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** (v18 o superior) → [Descargar](https://nodejs.org/)
- **npm** (viene con Node.js)
- **PostgreSQL** (v14 o superior) → [Descargar](https://www.postgresql.org/download/)
  - *Alternativa:* Usa **Docker** para correr PostgreSQL sin instalación local

---

## 📥 Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Adanrleon/Tienda-MLB.git
cd Tienda-MLB
```

---

## 📦 Paso 2: Instalar Dependencias

Desde la raíz del proyecto, instala todas las dependencias del monorepo (frontend y backend):

```bash
npm install
```

Esto instalará:
- Dependencias del workspace raíz
- Dependencias de `apps/web` (Next.js)
- Dependencias de `apps/api` (NestJS)

---

## 🔐 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo `.env`

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

### 3.2 Editar el archivo `.env`

Abre `.env` en tu editor y configura las variables necesarias:

```env
# ==================
# FRONTEND (Next.js)
# ==================
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-una-clave-aleatoria-min-32-caracteres
AUTH_SECRET=genera-otra-clave-aleatoria-min-32-caracteres

# OAuth (Opcional - déjalo vacío si no usas)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Stripe (Opcional - solo si tienes claves de prueba)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel

# PayPal (Opcional - déjalo vacío si no usas)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_PAYPAL_CURRENCY=USD

# ==================
# BACKEND (NestJS)
# ==================
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Base de Datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tienda_mlb

# JWT
JWT_SECRET=genera-una-clave-aleatoria-aqui
JWT_EXPIRES_IN=7d

# Stripe (Opcional)
STRIPE_SECRET_KEY=
```

**Notas importantes:**
- Para `NEXTAUTH_SECRET` y `AUTH_SECRET`, puedes generar una cadena aleatoria con: `openssl rand -base64 32` (en WSL/macOS/Linux) o usar un [generador online](https://generate-secret.vercel.app/32)
- Las variables opcionales (OAuth, Stripe, PayPal) pueden quedarse vacías para desarrollo
- El frontend mostrará datos mock si la API no está disponible

---

## 🗄️ Paso 4: Levantar la Base de Datos

Elige una opción:

### Opción A: Con Docker (Recomendado)

```bash
docker-compose up -d
```

Esto levanta PostgreSQL en el puerto 5432 con las credenciales del `.env`.

Verificar que está corriendo:
```bash
docker ps
```

### Opción B: PostgreSQL Local Instalado

Conectarse a PostgreSQL y crear la base de datos:

```bash
psql -U postgres
```

Luego ejecutar:
```sql
CREATE DATABASE tienda_mlb;
\q
```

---

## 🗃️ Paso 5: Inicializar la Base de Datos

Desde la raíz del proyecto, ejecuta:

```bash
npm --workspace @tienda-mlb/api run db:generate
```

Esto genera el cliente Prisma basado en el schema.

```bash
npm --workspace @tienda-mlb/api run db:migrate
```

Esto aplica las migraciones SQL a la base de datos.

```bash
npm --workspace @tienda-mlb/api run db:seed
```

Esto llena la base de datos con datos iniciales.

---

## ▶️ Paso 6: Ejecutar el Proyecto

### Opción A: En Dos Terminales (Recomendado)

**Terminal 1 - Backend (API NestJS):**
```bash
npm run dev:api
```

Espera a ver: `[Nest] ... - 06/05/2026, ... NestJS Development Server is running on port 4000`

**Terminal 2 - Frontend (Next.js):**
```bash
npm run dev:web
```

Espera a ver: `▲ Next.js 15.x.x` y `- Local: http://localhost:3000`

### Opción B: Desde una sola Terminal

Si prefieres, puedes ejecutar ambos en paralelo (menos recomendado para debugging):

```bash
npm run dev:api & npm run dev:web
```

---

## 🌐 Paso 7: Acceder a la Aplicación

Abre tu navegador y ve a:

- **Frontend:** http://localhost:3000
- **Backend (Swagger):** http://localhost:4000/api (si está configurado)

### ¿Qué deberías ver?

- La página de inicio con productos
- Navegación funcional
- Si la API está corriendo: datos reales desde la BD
- Si la API NO está corriendo: datos mock de demostración

---

## 🔑 Paso 8: (Opcional) Crear Usuario Admin

Para acceder al panel `/admin`, un usuario debe tener el rol `ADMIN`.

### Opción A: Por CLI de PostgreSQL

```bash
psql -U postgres -d tienda_mlb
```

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu-email@example.com';
```

### Opción B: Por herramienta visual (pgAdmin o DBeaver)

Conectate a la BD y actualiza el campo `role` en la tabla `User` a `ADMIN`.

---

## 📝 Troubleshooting

### ❌ Error: "Cannot find module '@tienda-mlb/api'"

```bash
npm install
```

### ❌ Error: "ECONNREFUSED 127.0.0.1:5432"

PostgreSQL no está corriendo. Ejecuta:

```bash
docker-compose up -d
```

O asegúrate de que PostgreSQL local esté iniciado.

### ❌ Error: "column \"...\" of relation \"...\" does not exist"

Las migraciones no se aplicaron. Ejecuta:

```bash
npm --workspace @tienda-mlb/api run db:migrate
```

### ❌ Puerto 3000 o 4000 ya está en uso

Cierra las aplicaciones que usen esos puertos o cambia el puerto en el archivo `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api  # cambiar 4000 a 4001
PORT=4001
```

### ❌ El frontend muestra datos mock

Asegúrate de que:
1. El backend está corriendo: `npm run dev:api`
2. `NEXT_PUBLIC_API_URL` en `.env` es correcto
3. No hay errores en la consola del navegador

---

## ✅ Checklist de Verificación

Marca cada paso cuando lo completes:

- [ ] Node.js v18+ instalado
- [ ] PostgreSQL corriendo (Docker o local)
- [ ] Repositorio clonado
- [ ] `npm install` ejecutado exitosamente
- [ ] Archivo `.env` creado y configurado
- [ ] `npm run db:generate` ejecutado
- [ ] `npm run db:migrate` ejecutado
- [ ] `npm run db:seed` ejecutado
- [ ] Backend corriendo en `http://localhost:4000` (`npm run dev:api`)
- [ ] Frontend corriendo en `http://localhost:3000` (`npm run dev:web`)
- [ ] Página de inicio cargando con productos
- [ ] ✅ **¡Listo para desarrollar!**

---

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de Prisma](https://www.prisma.io/docs/)
- [Documentación de NextAuth.js](https://next-auth.js.org/)

---

## 🤝 Ayuda

Si tienes problemas:

1. Revisa el archivo `.logs/api.err.log` para errores del backend
2. Revisa el archivo `.logs/web.err.log` para errores del frontend
3. Abre la consola del navegador (F12) para ver errores del frontend
4. Ejecuta `git status` para verificar que no hay cambios sin commitear

¡Happy coding! 🚀
