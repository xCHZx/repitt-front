# AGENTS.md — Repitt Front

> Contexto compartido para todos los agentes de IA (Claude, Gemini, Codex, Cursor, etc.).
> La memoria dinámica del proyecto vive en [`docs/agents/`](docs/agents/).

## Descripción del proyecto

Frontend de **Repitt**, una plataforma de fidelización de clientes mediante tarjetas de sellos (stamp cards). Permite a empresas crear y gestionar sus programas de fidelización, y a visitantes acumular sellos y canjear recompensas.

## Stack

- **Vue 3** + **Vite** + **TypeScript**
- **Vuetify 3** como UI framework (tema **Vuexy** v9.1.1)
- **Pinia** para estado global (con persistencia via `pinia-plugin-persistedstate`)
- **Axios** para HTTP con JWT Bearer token
- **unplugin-vue-router** para file-based routing
- **CASL** para control de permisos por rol
- **pnpm** como package manager

## Comandos

```bash
pnpm dev          # servidor de desarrollo
pnpm build        # build de producción
pnpm lint         # linting con eslint --fix
pnpm typecheck    # verificación de tipos TypeScript
```

## Arquitectura

### Roles de usuario
Hay dos roles principales que determinan el flujo de navegación:
- **empresa** → `/empresa/*` — gestión de negocios, tarjetas, visitas, clientes (mini CRM), métricas
- **visitante** → `/visitante/*` — tarjetas propias, negocios, perfil, QR

### Layouts
El proyecto usa **tres layouts**:

| Layout | Archivo | Usado en |
|--------|---------|----------|
| Default (sidebar Vuexy) | `src/layouts/default.vue` | auth, rutas genéricas |
| Company (bottom nav empresa) | `src/layouts/company.vue` | `/empresa/*` (excepto `seleccionar.vue` → `blank`) |
| Visitor (bottom nav visitante) | `src/layouts/visitor.vue` | `/visitante/*` |

Las páginas declaran su layout con `definePage({ meta: { layout: 'company' } })`. Sin declaración explícita usan el default (sidebar Vuexy) — **evitar esto en páginas de empresa o visitante**.

El layout `company.vue` incluye: top bar fijo con nombre del negocio, bottom nav con FAB central "Registrar visita".

El layout `visitor.vue` es completamente custom (no usa `VerticalNavLayout`). Incluye:
- Top bar fijo con back button condicional, título de página y acceso a empresa (solo `Owner`)
- Bottom nav con 5 tabs: Inicio / Tarjetas / **QR (FAB elevado)** / Visitas / Perfil
- Requiere `injectSkinClasses()` y `AppLoadingIndicator` para funcionar con el theming de Vuexy

### Routing
File-based routing en `src/pages/`. Las rutas se generan automáticamente a partir de la estructura de carpetas.

### Stores (Pinia)
- `src/stores/auth.ts` — token JWT, datos del usuario, rol, estado de suscripción
- `src/stores/company.ts` — empresa seleccionada actualmente

Ambos stores usan `persist: true`.

### Servicios HTTP
Todos los servicios usan `authAxios` definido en `src/services/axios.ts`, que inyecta automáticamente el JWT del store en cada request. Si el servidor responde 401, redirige a `/auth/login`.

La URL base de la API se configura en `.env` con la variable `VITE_API_URL`.

**Patrón de endpoints empresa:** todos siguen `/businesses/:businessId/[recurso]`. El `businessId` se obtiene **siempre** de `companyStore.selectedCompany.id`.

**Patrón de endpoints visitante:** todos siguen `/users/me/[recurso]` (el backend infiere el usuario del JWT).

### Variables de entorno
```
VITE_API_URL=      # URL base del backend NestJS
```
Hay entornos separados: `.env.development`, `.env.staging`, `.env.production`.

## Tema visual

| Propiedad | Valor |
|-----------|-------|
| Color primario | `#6C3CE1` (primary-darken-1: `#5328B8`) |
| Fuente | Plus Jakarta Sans (cargada via webfontloader, override global `* { font-family }`) |
| Background light | `#F7F6FE` |
| Accent de recompensas | `warning: #FF9F43` (ámbar) — usar para progress bars, chips de progreso |

Variables CSS de Vuetify para usar en SCSS:
- Color sólido: `rgb(var(--v-theme-primary))`
- Semi-transparente: `rgba(var(--v-global-theme-primary), 0.4)` (usa el var de App.vue)

## Convenciones de código

- **Siempre usar Composition API** con `<script setup lang="ts">`. Nunca Options API.
- **Usar componentes Vuetify** para la UI. No crear estilos personalizados salvo necesidad justificada.
- **Respetar el tema Vuexy**: usar las clases, variables y patrones que ya usa el template.
- Los directorios `src/@core/` y `src/@layouts/` son del template base — **modificarlos con cuidado** y solo cuando sea estrictamente necesario.
- Iconos via **Iconify** (conjuntos disponibles: `tabler`, `mdi`, `fa`). Ejemplo: `<VIcon icon="tabler-user" />`.
- No instalar dependencias nuevas sin consultar.
- **Fechas ISO:** nunca mostrar fechas crudas del backend. Siempre formatear con `toLocaleDateString('es-ES', ...)`.
- **Fallbacks de texto:** usar texto significativo (`'Sin nombre'`, `'—'`), nunca `'...'`.
- **VAvatar sin imagen:** pasar `undefined`, no string vacío, para que el fallback de inicial funcione.
- **No usar SweetAlert2 (Swal).** El patrón reemplazado es nativo Vuetify: `isLoading` ref en VBtn, VAlert inline para errores, VDialog para confirmaciones, VSnackbar para éxito. Ver `docs/agents/patterns.md`.

## Separación de componentes

### Cuándo extraer
- Bloque de markup repetido 2+ veces → extraer siempre
- Dialog/modal inline en una página → siempre su propio componente
- Bloque de más de ~50 líneas con lógica propia → evaluar extracción

### Organización de `src/components/`
```
general/      # reutilizables entre secciones (QuickActionCard, HeroCTACard, MainMenuItemList)
empresa/      # específicos de /empresa (CambiarPerfilDialog)
businesses/   # entidad negocio
stampCards/   # entidad tarjeta de sellos
visits/       # entidad visita
users/        # entidad usuario
dialogs/      # dialogs genéricos del template Vuexy base
```

### Navegación en templates
- Usar prop `to` de Vuetify (`VCard`, `VBtn`, `VListItem`) — activa `.v-card--link` con cursor y ripple automáticos
- **No crear wrappers `goToPage(url)`** — llamar `router.push()` directamente o usar `to`
- Inline styles de cursor/hover → reemplazar por prop `to` o clase en `<style scoped>`

### Listas repetitivas
Definir array en `<script setup>` + `v-for` en lugar de bloques duplicados:
```ts
const quickActions = [
  { icon: 'tabler-cards', label: 'Tarjetas', to: '/ruta' },
]
```

### Lifecycle hooks
No mezclar `onBeforeMount` + `onMounted` para lógica relacionada. Consolidar en un `onMounted` con guard + return temprano:
```ts
onMounted(async () => {
  if (!condicion) { router.push('/otra-ruta'); return }
  await setup()
  fetchData()
})
```

## Estructura de servicios

```
src/services/
  auth/           # login, registro, recuperar contraseña
  company/        # businesses, stampCards, visits, metrics, userStampCards, customers
  visitor/        # business, users, userStampCards, visits
  catalog/        # categorías (GET /catalogs/categories)
  utils/          # refreshUserData — actualiza auth store desde GET /users/me
  axios.ts        # instancia de axios con interceptores JWT
```

> `subscription/` fue eliminado (2026-03-25) — MVP gratuito, Stripe en v2.

### Endpoints de usuario (`visitor/users.ts`)
- `getCurrentVisitorData()` → `GET /users/me` → retorna usuario (extrae `response.data.data`)
- `updateCurrentVisitorData({ firstName?, lastName?, phone? })` → `PATCH /users/me` → retorna plano

### Respuestas del backend
- Endpoints `/businesses/...` → wrapper manual `{ data: {...} }` → parse con `response.data.data`
- `GET /users/me` → wrapper especial `{ role, data: {...} }` → parse con `response.data.data`
- `PATCH /users/me` y demás `/users/...` → respuesta plana → parse con `response.data`
- `refreshUserData()` retorna `{ role, data: {...} }`. Al usar en componentes: `(await refreshUserData()).data`

## Testing y deploy

- **No hay tests** automatizados.
- **Deploy manual** — build con `pnpm build` y despliegue del output.

## Memoria dinámica

El conocimiento acumulado durante el desarrollo (decisiones, patrones, gotchas) vive en [`docs/agents/`](docs/agents/):

| Archivo | Contenido |
|---------|-----------|
| [decisions.md](docs/agents/decisions.md) | Decisiones de arquitectura y por qué se tomaron |
| [patterns.md](docs/agents/patterns.md) | Patrones de código recurrentes en el proyecto |
| [gotchas.md](docs/agents/gotchas.md) | Cosas que parecen simples pero tienen trampa |
| [api-notes.md](docs/agents/api-notes.md) | Comportamientos del backend descubiertos en desarrollo |
