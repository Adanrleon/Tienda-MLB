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

### ¿Qué es un archivo `.env`?

El archivo `.env` es un archivo de **configuración especial** que guarda "secretos" y configuraciones que:
- ❌ **NO deben compartirse públicamente** (como contraseñas, claves API)
- ✅ Son **diferentes en cada máquina** (tu PC puede tener valores distintos al de tu colaborador)
- ✅ Nunca se suben a GitHub (está en `.gitignore`)

Es como un cofre de contraseñas local que solo tu máquina lee.

---

### 3.1 Crear el archivo `.env`

Copia el archivo de ejemplo que ya existe:

```bash
cp .env.example .env
```

Este comando crea un nuevo archivo llamado `.env` basado en `.env.example`.

---

### 3.2 Editar el archivo `.env`

Ahora necesitas abrir el archivo `.env` en tu editor de texto favorito (VS Code, Notepad++, etc.):

**En VS Code:**
1. Abre la carpeta del proyecto en VS Code
2. En la barra lateral izquierda, busca el archivo `.env`
3. Haz clic para abrirlo
4. Copia y pega este contenido:

```env
# ========================================
# CONFIGURACIÓN DEL FRONTEND (Next.js)
# ========================================

# Esta es la URL del backend. El frontend usará esta URL para hacer peticiones.
# Mantén localhost:4000 durante desarrollo
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# URL del frontend. Se usa para validaciones de seguridad
NEXTAUTH_URL=http://localhost:3000

# IMPORTANTE: Necesitas generar una clave aleatoria aquí
# Abre: https://generate-secret.vercel.app/32
# Copia el resultado (una cadena larga) y pégalo aquí
NEXTAUTH_SECRET=aqui-pega-una-cadena-aleatoria-de-32-caracteres-que-generaste

# Otra clave aleatoria (igual que arriba, genera una nueva)
# Puedes usar el mismo generador: https://generate-secret.vercel.app/32
AUTH_SECRET=aqui-pega-otra-cadena-aleatoria-de-32-caracteres

# Las siguientes variables son para OAuth (login con Google/GitHub)
# POR AHORA DÉJALAS VACÍAS (no necesitas configurarlas aún)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Las siguientes variables son para Stripe (pagos)
# POR AHORA DÉJALAS VACÍAS (no necesitas configurarlas aún)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel

# La siguiente variable es para PayPal (pagos)
# POR AHORA DÉJALA VACÍA (no necesitas configurarla aún)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_PAYPAL_CURRENCY=USD

# ========================================
# CONFIGURACIÓN DEL BACKEND (NestJS)
# ========================================

# El puerto donde corre el backend
# Mantén 4000 (es el que se usa por defecto)
PORT=4000

# La URL del frontend (el backend necesita saber de dónde pueden venir peticiones)
FRONTEND_ORIGIN=http://localhost:3000

# ========================================
# CONFIGURACIÓN DE LA BASE DE DATOS
# ========================================

# Esta cadena le dice a tu aplicación cómo conectarse a PostgreSQL
# Estructura: postgresql://usuario:contraseña@host:puerto/nombre_base_datos
# 
# Explicación de cada parte:
#   - usuario: postgres (usuario por defecto de PostgreSQL)
#   - contraseña: postgres (contraseña por defecto)
#   - host: localhost (tu máquina local)
#   - puerto: 5432 (puerto por defecto de PostgreSQL)
#   - nombre_base_datos: tienda_mlb (el nombre que le dimos)
#
# Si PostgreSQL está corriendo correctamente, DÉJALO IGUAL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tienda_mlb

# ========================================
# CONFIGURACIÓN DE AUTENTICACIÓN JWT
# ========================================

# Otra clave aleatoria para firmar los tokens de autenticación
# Genera una nueva con: https://generate-secret.vercel.app/32
JWT_SECRET=aqui-pega-otra-cadena-aleatoria-para-firmar-tokens

# Cuánto tiempo es válido un token (7 días)
# DÉJALO IGUAL
JWT_EXPIRES_IN=7d

# Las siguientes variables son para Stripe (pagos)
# POR AHORA DÉJALAS VACÍAS (no necesitas configurarlas aún)
STRIPE_SECRET_KEY=
```

---

### 3.3 Generar las Claves Aleatorias (MUY IMPORTANTE!)

Necesitas generar claves aleatorias para estas variables:
- `NEXTAUTH_SECRET`
- `AUTH_SECRET`
- `JWT_SECRET`

**Paso a paso:**

1. Abre esta página en tu navegador: https://generate-secret.vercel.app/32

2. Verás un botón que dice "Generate" o una cadena de caracteres ya generada

3. Copia toda esa cadena (Ctrl+C)

4. Vuelve a tu archivo `.env` y busca `NEXTAUTH_SECRET=aqui-pega-una-cadena...`

5. Borra el texto después del `=` y pega lo que copiaste

6. Resultado debe verse así:
   ```env
   NEXTAUTH_SECRET=a7x9k2mP9qL3vN5bW8cD1eF4gH6jK7mN0pQ2rS3tU5
   ```

7. **Repite esto 2 veces más** para `AUTH_SECRET` y `JWT_SECRET` (genera nuevas claves cada vez)

---

### 3.4 Verificar que todo está correcto

Tu archivo `.env` debe verse así cuando termines:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a7x9k2mP9qL3vN5bW8cD1eF4gH6jK7mN0pQ2rS3tU5
AUTH_SECRET=z1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tienda_mlb
JWT_SECRET=m9n8o7p6q5r4s3t2u1v0w9x8y7z6a5b4c3d2e1f0
JWT_EXPIRES_IN=7d
```

**Checklist:**
- ✅ `NEXTAUTH_SECRET` no está vacío y tiene caracteres aleatorios
- ✅ `AUTH_SECRET` no está vacío y tiene caracteres aleatorios diferentes
- ✅ `JWT_SECRET` no está vacío y tiene caracteres aleatorios diferentes
- ✅ `DATABASE_URL` dice `postgresql://postgres:postgres@localhost:5432/tienda_mlb`
- ✅ El resto de variables opcionales pueden estar vacías

**Guarda el archivo (Ctrl+S en VS Code)**

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
