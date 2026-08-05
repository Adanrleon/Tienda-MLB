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

## Nota breve

La tienda está pensada para funcionar como demo completa. Si la API o la pasarela de pago no están activas, algunos flujos pueden caer en modo demostración.
