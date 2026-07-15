# ERP Suelas

ERP interno para una fábrica peruana de **suelas de zapato**. Cubre el ciclo completo desde materia prima hasta la entrega: inventario, producción por receta (BOM), compras, ventas (panel interno + storefront público), facturación interna y logística.

Diseñado con **arquitectura modular tipo Odoo sobre NestJS**: cada módulo es independiente y se comunica con los demás únicamente por **eventos**, para poder agregar módulos nuevos (Contabilidad, CRM, RRHH, Calidad…) sin tocar los existentes.

> 🚀 **¿Recién clonaste el repo en otra PC?** Sigue la guía paso a paso en **[SETUP.md](./SETUP.md)** (qué instalar, cómo crear los `.env`, cómo arrancar).

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · TypeScript |
| Backend | NestJS 11 · TypeScript · `@nestjs/event-emitter` |
| Base de datos | PostgreSQL 17 · Prisma ORM 6 |
| Auth | JWT (`@nestjs/passport` + `passport-jwt`) · bcrypt · guards por rol |
| Monorepo | Turborepo · npm workspaces |

> **Nota de versiones:** el prompt pide "últimas versiones estables". Al verificar, `prisma` y `typescript` publicaban un major nuevo (Prisma 7, TypeScript 7 nativo) que rompe la cadena de decoradores de NestJS y el generador de Prisma del código base. Se fijó la **última versión de la línea probada por el ecosistema Next 16 + Nest 11**: Prisma 6.19, TypeScript 5.9, Next 16.2, Nest 11.1, Tailwind 4.3.

---

## Requisitos

- **Node.js 20+** (probado con 22.x)
- **Docker** (para Postgres 17) — no necesitas instalar Postgres localmente

---

## Puesta en marcha

```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Levantar Postgres 17 en Docker (se publica en el puerto 5433 del host
#    para no chocar con un Postgres local en 5432)
npm run db:up

# 3. Crear el esquema (migración) y generar el cliente Prisma
npm run db:migrate

# 4. Cargar datos de ejemplo
npm run db:seed

# 5. Levantar API (3001) y web (3000) juntos
npm run dev
```

O todo de una:

```bash
npm run setup   # install + db:up + db:migrate + db:seed
npm run dev
```

Luego abre:

- **Storefront público:** http://localhost:3000
- **Panel admin:** http://localhost:3000/admin
- **API:** http://localhost:3001

### Usuarios de prueba

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| `admin@erp.com` | `admin123` | ADMIN |
| `almacen@erp.com` | `admin123` | ALMACENERO |
| `ventas@erp.com` | `admin123` | VENDEDOR |

---

## Flujo end-to-end (para probar en el panel)

El seed deja stock inicial bajo a propósito, para que se recorra toda la cadena:

1. **Compras** → *Nueva orden de compra* (proveedor + materia prima) → **Recibir**
   → sube el stock de materia prima *(evento `purchase_order.received`)*.
2. **Producción** → hay una receta *Suela Runner Talla 40*. *Nueva orden de producción* → **Completar**
   → consume materia prima y suma producto terminado *(evento `production.completed`)*.
3. **Inventario** → verifica que la variante `SR-RUN-40` ya tiene stock.
4. **Storefront** (http://localhost:3000) → agrega productos al carrito → **Confirmar pedido**
   (sin login, sin pago) → crea un pedido `WEB`.
5. **Ventas** → aparece el pedido → **Confirmar** → descuenta stock *(evento `order.confirmed`)*.
6. **Facturación** → *Emitir* boleta/factura → comprobante con numeración propia
   (`B001-000001`), `sunatStatus = NO_ENVIADO` (stub, sin SUNAT real).
7. **Logística** → crea el despacho → **En ruta** → **Entregado**
   → el pedido pasa a `DESPACHADO` y luego `ENTREGADO` *(eventos `shipment.dispatched` / `shipment.delivered`)*.

Este flujo completo está verificado por API en `scripts` durante el desarrollo.

---

## Arquitectura modular por eventos

**Regla de oro:** ningún módulo importa el `Service` de otro para modificar sus datos. Para cambiar el estado de otro módulo se **emite un evento**; los interesados lo **escuchan** con `@OnEvent(...)`. El emisor no sabe quién escucha.

```
Purchases.receive()        --emit--> purchase_order.received --> RawMaterials (suma stock)
Production.complete()      --emit--> production.completed     --> Inventory  (suma producto)
                                                              --> RawMaterials (descuenta MP)
Sales.confirm()            --emit--> order.confirmed          --> Inventory  (descuenta producto)
Logistics.dispatch()       --emit--> shipment.dispatched      --> Sales (pedido → DESPACHADO)
Logistics.markDelivered()  --emit--> shipment.delivered       --> Sales (pedido → ENTREGADO)
```

- El catálogo central de eventos y sus payloads tipados está en `apps/api/src/common/events.ts`.
- **`apps/api/src/app.module.ts` es el único lugar** donde se activa/desactiva un módulo (el array `imports`).

### Cómo agregar un módulo nuevo (ej. Contabilidad)

1. Crea `apps/api/src/accounting/` con su `*.module.ts`, `*.service.ts`, `*.controller.ts` y (si reacciona a algo) su `*.listener.ts`.
2. Define en `common/events.ts` los eventos nuevos que emita, si los hay.
3. Para **reaccionar** a eventos existentes (ej. emitir un asiento contable cuando `order.confirmed`), agrega un `@OnEvent('order.confirmed')` en tu listener. **No tocas Sales.**
4. Agrega `AccountingModule` al array `imports` de `app.module.ts`. Nada más.

Otros patrones tipo Odoo ya implementados:
- **Contacto unificado** (`Contact`): un cliente y/o proveedor en una sola tabla (`res.partner`).
- **Variantes de producto** genéricas: `ProductTemplate` + `ProductVariant` con un sistema `Attribute`/`AttributeValue` reutilizable (no hardcodeado a "talla").

---

## Estructura del proyecto

```
/
├─ docker-compose.yml            # Postgres 17 (host: 5433)
├─ turbo.json · package.json     # monorepo (workspaces + scripts)
├─ apps/
│  ├─ api/                       # NestJS
│  │  ├─ prisma/{schema.prisma, seed.ts, migrations/}
│  │  └─ src/
│  │     ├─ common/              # PrismaService, events.ts, filtro Prisma
│  │     ├─ auth/                # JWT, passport, RolesGuard, @Roles, @Public
│  │     ├─ core/                # usuarios + contactos unificados
│  │     ├─ raw-materials/       # materia prima, stock, movimientos, almacenes
│  │     ├─ production/          # BOM + órdenes de producción  (emite evento)
│  │     ├─ inventory/           # producto terminado, variantes, kardex (escucha)
│  │     ├─ purchases/           # órdenes de compra (emite evento)
│  │     ├─ sales/               # pedidos internos + checkout web (emite/escucha)
│  │     ├─ invoicing/           # comprobante interno (stub SUNAT)
│  │     ├─ logistics/           # despacho/entrega (emite eventos)
│  │     └─ app.module.ts        # ← único switch de módulos
│  └─ web/                       # Next.js
│     ├─ app/(storefront)/       # catálogo + carrito + checkout (público)
│     ├─ app/admin/              # panel interno protegido, 1 sección por módulo
│     ├─ app/login/ · proxy.ts   # login + protección de rutas
│     └─ lib/                    # api client (server), sesión, acciones, formato
└─ packages/
   └─ shared-types/              # enums y tipos compartidos api ↔ web
```

---

## Diseño

Dirección visual propia: **"Claro técnico"** — fondo slate claro, superficies blancas, acento **teal acero** (`#0D9488`), tipografía sans del sistema con números tabulares para tablas densas. Estados con color (pendiente/confirmado/entregado, etc.), foco de teclado visible, textos de interfaz directos en español. El panel admin prioriza tablas densas y feedback inmediato; el storefront es más limpio (catálogo + carrito).

---

## Seguridad / sesión

- Login por email + contraseña (`bcrypt`), devuelve **JWT**.
- El frontend guarda el token en una **cookie httpOnly** (nunca en `localStorage`/`sessionStorage`). Las páginas del admin son server components que llaman a la API con el token desde el servidor.
- Guards globales: `JwtAuthGuard` (todo exige token salvo `@Public()`) + `RolesGuard` (`@Roles(...)`).
- Endpoints públicos: `POST /auth/login`, `GET /products/catalog`, `POST /orders/checkout`.

---

## Qué NO incluye este MVP (por diseño)

- Sin integración real a SUNAT / PSE / OSE (el comprobante queda en `NO_ENVIADO`).
- Sin pasarela de pago (el storefront solo genera el pedido).
- Sin multi-empresa / multi-tenant.
- Logística simple (sin rutas ni GPS).

Todo está pensado para que estas piezas (y módulos como Contabilidad, CRM, RRHH, Calidad) **quepan después sin refactor**.

---

## Scripts útiles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Levanta API + web (Turbo) |
| `npm run build` | Compila API + web |
| `npm run db:up` / `db:down` | Inicia / detiene Postgres (Docker) |
| `npm run db:migrate` | Aplica migraciones Prisma |
| `npm run db:seed` | Recarga datos de ejemplo (re-ejecutable) |
| `npm run db:reset` | Borra y recrea la BD desde cero |
