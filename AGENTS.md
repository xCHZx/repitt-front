# AGENTS.md — Repitt Front

> Contexto compartido para todos los agentes de IA (Claude, Gemini, Codex, Cursor, etc.).
> La memoria dinámica del proyecto vive en [`docs/agents/`](docs/agents/).

## Descripción del proyecto

Frontend de **Repitt**, una plataforma de fidelización de clientes mediante tarjetas de sellos (stamp cards). Los negocios crean y operan sus programas (dueños y cajeros); los clientes acumulan sellos y canjean recompensas.

Desde 2026-10-06 consume la **API v1** del backend (`repitt-backend`, NestJS + OpenAPI). El contrato v1 está congelado: solo habrá cambios aditivos.

## Fuentes de verdad de la API

| Qué | Dónde |
|-----|-------|
| Contrato | `src/api/openapi.json` (copia de `repitt-backend/docs/api/openapi.json`, rama `qa`). **Manda sobre la guía** |
| Tipos | `src/api/v1.d.ts`, generado con `pnpm api:types`. **Nunca** escribir tipos de API a mano |
| Guía funcional | `repitt-backend/docs/api/front-guide-v1.md` (pantallas, errores → UI, reglas) |
| Convenciones del front | [`docs/agents/v1-conventions.md`](docs/agents/v1-conventions.md) — **leer antes de tocar código** |

Para actualizar el contrato: copiar el `openapi.json` nuevo a `src/api/` y correr `pnpm api:types`.

## Stack

- **Vue 3** + **Vite** + **TypeScript** (strict)
- **Vuetify 3** (tema **Vuexy** v9.1.1)
- **Pinia** (sin persistencia de datos de la API)
- **Axios** con `withCredentials` (refresh en cookie httpOnly)
- **unplugin-vue-router** (rutas por archivos)
- **openapi-typescript**, **qrcode**, **markdown-it**, **vitest**
- **pnpm** 8.15.9 (`packageManager` fijado)

## Comandos

```bash
pnpm dev               # servidor de desarrollo (http://localhost:5173)
pnpm build             # build de producción
pnpm typecheck         # vue-tsc (los errores en src/@core y src/@layouts son de la plantilla)
pnpm lint              # eslint --fix sobre todo el repo
pnpm test              # unit tests (src/**/*.spec.ts)
pnpm test:integration  # contrato contra un backend local: BACKEND_LOG=<log del backend> pnpm test:integration
pnpm api:types         # regenera src/api/v1.d.ts desde src/api/openapi.json
```

## Arquitectura

### Capa HTTP — `src/api/`

```
src/api/
  openapi.json · v1.d.ts   # contrato y tipos generados
  types.ts                 # alias con nombre (MeDto, Business, StampCard, CursorPage<T>…)
  client.ts                # request(method, '/v1/...', opts) tipado por ruta + interceptores
  errors.ts                # ApiError (code, detailCode, fieldErrors, detailObj, requestId, retryAfterMs)
  messages.ts              # catálogo de errores → texto de UI
  idempotency.ts           # withIdempotency (sellar, alta, canje, anulación)
  refresh.ts               # refresh de un solo vuelo (promesa compartida + navigator.locks)
  endpoints/               # auth, me, public, businesses, cards, loyalty, crm, billing
```

Los interceptores resuelven: refresh en `401 TOKEN_EXPIRED`, fin de sesión, cuenta suspendida, step-up / reautenticación (diálogo global `ReauthDialog`) con reintento, reintento único en `409 CONFLICT retry` y esperas cortas de `Retry-After` en lecturas. Las páginas **no** repiten esa lógica.

### Sesión y roles

- `src/stores/session.ts`: access token **solo en memoria**; al cargar la app se hace `POST /v1/auth/refresh` y `GET /v1/me`. No hay rol global.
- `src/stores/business.ts`: negocios donde el usuario es miembro (`GET /v1/businesses`), negocio activo (solo su id se recuerda en `localStorage`), `role` (`owner` / `cashier`) y `entitlement`.
- Sin membresías = cliente (visitante). Tras iniciar sesión: 0 membresías → `/visitante`; 1 → `/empresa`; varias → `/empresa/seleccionar`.
- El acceso a pago se decide por `entitlement { allowed, reason, until }`, nunca por `isPublished` ni por el estado de la suscripción.

### Rutas y layouts

Guard en `src/plugins/1.router/index.ts` según `definePage({ meta })`: `public`, `guestOnly`, `area: 'business'`, `needsBusiness`, `ownerOnly`, `requiresEntitlement` (ver `env.d.ts`).

| Layout | Archivo | Uso |
|--------|---------|-----|
| Blank | `src/layouts/blank.vue` (`default.vue` es igual) | auth, página pública, selector de negocio |
| Company | `src/layouts/company.vue` | `/empresa/**`: top bar con negocio activo, banner de entitlement, bottom nav por rol (dueño / cajero) con FAB «Registrar» |
| Visitor | `src/layouts/visitor.vue` | `/visitante/**`: cartera, QR, actividad, cuenta |

Áreas principales:
- **Dueño** (`/empresa`): negocio, publicación, assets, tarjetas, cajeros (`/empresa/cajeros`), clientes (CRM), movimientos (`/empresa/visitas`), métricas, planes.
- **Mostrador** (dueño y cajero): `/empresa/visitas/registrar`, `/empresa/recompensas`, `/empresa/ciclos/:cycleId`.
- **Cliente** (`/visitante`): cartera, detalle por ciclo, actividad, mi QR, cuenta (`/visitante/perfil`, también para dueños y cajeros), privacidad.
- **Públicas**: `/n/:repittCode` → `/visitante/negocios/:code`, `/privacidad`, `/reset-password`, `/verify-email`, `/cuenta-suspendida`.

### Variables de entorno

```
VITE_API_URL=http://localhost:3000/v1   # incluye el prefijo /v1
```

`.env.*` (excepto `.env.example`) no se versionan. API y front deben ser **same-site** en producción (cookie de refresh `SameSite=Lax`).

## Tema visual

| Propiedad | Valor |
|-----------|-------|
| Color primario | `#6C3CE1` (primary-darken-1: `#5328B8`) |
| Fuente | Plus Jakarta Sans (webfontloader, override global `* { font-family }`) |
| Background light | `#F7F6FE` |
| Accent de recompensas | `warning: #FF9F43` |

## Convenciones de código

- **Composition API** con `<script setup lang="ts">`.
- **Vuetify** para la UI; respetar el tema Vuexy. `src/@core/` y `src/@layouts/` son de la plantilla: tocarlos solo si es estrictamente necesario.
- Iconos Iconify (`tabler`, `mdi`, `fa`).
- **No instalar dependencias sin consultar.**
- **Sin SweetAlert2**: `isLoading` en botones, `ApiErrorAlert` / `VAlert` inline, `VDialog` para confirmar, `VSnackbar` para éxito.
- Errores: decidir por `code` / `detailCode`; mostrar con `useApiError` + `ApiErrorAlert` (incluye el folio `requestId`).
- Fechas: `src/utils/dates.ts` (zona del negocio para todo dato del negocio; `startsOn`/`endsOn` como fechas locales).
- Navegar por **path**; importar explícitamente componentes y composables nuevos.
- Detalle completo en [`docs/agents/v1-conventions.md`](docs/agents/v1-conventions.md).

## Separación de componentes

- Bloque repetido 2+ veces, dialog inline o bloque > ~50–80 líneas con lógica propia → componente.
- `src/components/`: `common/` (ApiErrorAlert, AppQrCode, MarkdownContent, PrivacyNoticeShort), `auth/`, `business/`, `cards/`, `counter/`, `crm/`, `billing/`, `visitor/`, `general/` (QuickActionCard, HeroCTACard…).
- Usar la prop `to` de Vuetify para navegar; no crear wrappers `goToPage`.
- Un solo `onMounted` con guard y return temprano en lugar de mezclar hooks.

## Testing y deploy

- `pnpm test`: unit tests del núcleo HTTP (errores, refresh, idempotencia, interceptores) y utilidades.
- `pnpm test:integration`: flujos principales contra el backend local (OTP desde el log del backend).
- Deploy: build estático (`pnpm build`) servido por nginx (`prod.Dockerfile`, `qa.Dockerfile`).

## Memoria dinámica

| Archivo | Contenido |
|---------|-----------|
| [v1-conventions.md](docs/agents/v1-conventions.md) | Convenciones obligatorias contra la API v1 |
| [decisions.md](docs/agents/decisions.md) | Decisiones de arquitectura y por qué |
| [patterns.md](docs/agents/patterns.md) | Patrones de UI recurrentes |
| [gotchas.md](docs/agents/gotchas.md) | Trampas conocidas |
| [api-notes.md](docs/agents/api-notes.md) | Comportamientos del backend v1 descubiertos al integrar |
