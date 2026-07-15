# Guía de instalación — ERP Suelas

Guía paso a paso para levantar el proyecto **desde cero en otra computadora**. Está pensada para alguien que nunca lo ha corrido antes. Sirve para Windows, macOS y Linux.

> ¿Solo quieres el resumen? Salta a [Instalación en 6 pasos](#instalación-en-6-pasos).

---

## 1. Qué necesitas instalar antes

Instala estas 3 herramientas (una sola vez por computadora):

| Herramienta | Para qué | Dónde |
|-------------|----------|-------|
| **Node.js 20 o superior** | Correr el backend y el frontend | https://nodejs.org (descarga la versión "LTS") |
| **Docker Desktop** | Levantar la base de datos PostgreSQL sin instalarla a mano | https://www.docker.com/products/docker-desktop |
| **Git** | Descargar el código desde GitHub | https://git-scm.com/downloads |

### Verifica que quedaron instalados

Abre una terminal (en Windows: **Git Bash** o **PowerShell**) y corre:

```bash
node -v      # debe mostrar v20.x.x o superior
npm -v       # debe mostrar 10.x.x o superior
docker -v    # debe mostrar una versión de Docker
git --version
```

Si alguno falla, vuelve a instalarlo. **Importante:** abre **Docker Desktop** y espera a que diga "Running" antes de continuar (Docker debe estar prendido para que funcione la base de datos).

---

## 2. Instalación en 6 pasos

### Paso 1 — Descargar el código

```bash
git clone <URL-DEL-REPO-EN-GITHUB>
cd "Nueva carpeta"
```

(Reemplaza `<URL-DEL-REPO-EN-GITHUB>` por la URL que te den, ej. `https://github.com/usuario/erp-suelas.git`)

### Paso 2 — Instalar las dependencias

```bash
npm install
```

Esto descarga todo lo que el proyecto necesita (tarda 1-2 minutos la primera vez).

### Paso 3 — Crear los archivos de entorno (`.env`) ⚠️ IMPORTANTE

Por seguridad, los archivos `.env` **no vienen en el repositorio** (contienen contraseñas). Tienes que crearlos tú. Son **dos** archivos:

**a) Crea el archivo `apps/api/.env`** con este contenido exacto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/erp_suelas?schema=public"
JWT_SECRET="dev-secret-cambiar-en-produccion"
JWT_EXPIRES_IN="8h"
PORT=3001
```

**b) Crea el archivo `apps/web/.env`** con este contenido:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

> 💡 Truco: hay un archivo `.env.example` en la raíz con estos mismos valores de referencia. Puedes copiar de ahí.

### Paso 4 — Levantar la base de datos (Docker)

```bash
npm run db:up
```

Esto enciende PostgreSQL 17 dentro de Docker, en el puerto **5433** (usamos 5433 y no el 5432 típico para no chocar si ya tienes otro PostgreSQL instalado).

### Paso 5 — Crear las tablas y cargar datos de ejemplo

```bash
npm run db:migrate      # crea todas las tablas
npm run db:seed         # carga usuarios, productos, pedidos de ejemplo, etc.
```

### Paso 6 — Arrancar todo

```bash
npm run dev
```

Esto levanta el backend (API) y el frontend (web) al mismo tiempo. Déjalo corriendo.

---

## 3. Abrir la aplicación

Con `npm run dev` corriendo, abre en el navegador:

- **Panel de administración:** http://localhost:3000/admin
- **Tienda pública (storefront):** http://localhost:3000

### Usuarios para entrar al panel

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| `admin@erp.com` | `admin123` | Administrador (ve todo) |
| `almacen@erp.com` | `admin123` | Almacenero |
| `ventas@erp.com` | `admin123` | Vendedor |

Para **detener** todo: presiona `Ctrl + C` en la terminal donde corre `npm run dev`.

---

## 4. Uso del día a día

Ya instalado, cada vez que quieras trabajar solo necesitas **2 comandos**:

```bash
npm run db:up      # enciende la base de datos (si no está prendida)
npm run dev        # levanta la app
```

Para saber si la base ya está prendida: `docker ps` — si ves `erp-suelas-db ... (healthy)`, salta directo a `npm run dev`.

> Nota: **Docker Desktop debe estar abierto** para que `db:up` funcione.

---

## 5. Atajo: todo de una vez

Después de haber creado los `.env` (Paso 3), puedes hacer los pasos 2, 4, 5 en un solo comando:

```bash
npm run setup      # install + db:up + db:migrate + db:seed
npm run dev
```

---

## 6. Problemas comunes y soluciones

**`Error: listen EADDRINUSE: address already in use :::3000` (o `:::3001`)**
Quedó un proceso de Node colgado ocupando el puerto. Ciérralo:
- Windows (PowerShell): `Get-Process node | Stop-Process -Force` y vuelve a `npm run dev`.
- O simplemente reinicia la computadora.

**`P1000: Authentication failed` o `Can't reach database server` al migrar**
- Verifica que **Docker Desktop esté abierto** y corriendo.
- Verifica que el contenedor esté arriba: `docker ps` (debe aparecer `erp-suelas-db`). Si no, corre `npm run db:up`.
- Verifica que `apps/api/.env` tenga la `DATABASE_URL` exacta del Paso 3 (puerto **5433**, usuario y clave `postgres`).

**El puerto 5433 ya está ocupado**
Es raro, pero si tienes algo en 5433, edita el puerto en `docker-compose.yml` (ej. `"5434:5432"`) y ajusta la `DATABASE_URL` en `apps/api/.env` al mismo número.

**Cambié algo en la base y quiero empezar de cero**
```bash
npm run db:reset       # borra y recrea todas las tablas
npm run db:seed        # vuelve a cargar los datos de ejemplo
```

**Docker Desktop no arranca / no está instalado**
La base de datos no funciona sin Docker. Instálalo y ábrelo (debe decir "Running"). Alternativamente, puedes usar un PostgreSQL propio: cambia la `DATABASE_URL` en `apps/api/.env` para que apunte a tu servidor.

---

## 7. Comandos útiles (referencia)

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Levanta API + web juntos |
| `npm run db:up` | Enciende PostgreSQL (Docker) |
| `npm run db:down` | Apaga PostgreSQL |
| `npm run db:migrate` | Crea/actualiza las tablas |
| `npm run db:seed` | Carga datos de ejemplo (se puede repetir) |
| `npm run db:reset` | Borra y recrea la base desde cero |
| `npm run build` | Compila para producción |

---

## Resumen de la arquitectura (para ubicarte)

```
Nueva carpeta/          ← la raíz (esto es lo que clonas)
├── apps/api/           ← backend (NestJS) — puerto 3001
├── apps/web/           ← frontend (Next.js) — puerto 3000
├── packages/           ← código compartido
└── docker-compose.yml  ← la base de datos PostgreSQL
```

Para entender cómo está armado el sistema por dentro (módulos, eventos, etc.), lee el **`README.md`**.
