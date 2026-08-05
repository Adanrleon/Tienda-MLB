# Tienda MLB

Una tienda en línea de jerseys de la MLB diseñada para mostrar un proyecto real de comercio electrónico. Aquí puedes navegar productos, agregar al carrito, iniciar sesión y completar compras.

## Qué es

Tienda MLB es una tienda web para vender camisetas y productos de béisbol de la MLB. Está pensada para ser una demostración de una experiencia de compra organizada, con catálogo, carrito de compras y pago.

## Lo que incluye

- Catálogo de productos de MLB
- Página de detalle de producto
- Carrito con cantidades actualizables
- Proceso de checkout
- Inicio de sesión para usar el carrito y pagar
- Panel de administración protegido para gestionar productos

## Stack tecnológico

- **Next.js**: sirve la tienda en el navegador y maneja las páginas del frontend.
- **React**: construye los componentes visuales de la aplicación.
- **Tailwind CSS**: define el estilo y diseño responsivo de la interfaz.
- **Framer Motion**: anima las transiciones y hace la experiencia más fluida.
- **NextAuth.js**: gestiona el inicio de sesión y la sesión del usuario.
- **NestJS**: corre el backend que atiende los datos de productos, carrito y usuarios.
- **Prisma**: maneja la base de datos y realiza las consultas con seguridad.
- **PostgreSQL**: almacena los productos, usuarios, carrito y pedidos.
- **Stripe**: procesa el pago y crea el flujo de checkout.

## Por qué es útil

Este proyecto sirve para presentar cómo sería un comercio electrónico moderno con: navegación de catálogo, control de sesiones, carrito persistente y un área privada para administrar productos.

## Cómo usarlo

1. Clona el repositorio.
2. Instala dependencias en la raíz.
3. Inicia el backend y el frontend.

### Comandos básicos

```bash
npm install
npm run dev:api
npm run dev:web
```

## Estructura principal

- `apps/web`: interfaz de la tienda
- `apps/api`: servidor que sirve productos, carrito y autenticación

## Qué se necesita configurar

- Variables de entorno para la API y autenticación
- Datos de pago para el checkout
- Usuario con rol `ADMIN` para el panel de administración
