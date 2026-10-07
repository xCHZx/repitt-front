# Convenciones del front contra la API v1

Fuente de verdad del contrato: `src/api/openapi.json` (copia congelada de `repitt-backend/docs/api/openapi.json`).
Guía funcional: `E:/Repos/repitt-backend/docs/api/front-guide-v1.md` (las secciones `§x.y` de este documento se refieren a ella).
Si la guía y el contrato difieren, manda el contrato.

## Capa HTTP (`src/api/`)

| Archivo | Qué es |
|---|---|
| `openapi.json` · `v1.d.ts` | contrato y tipos generados (`pnpm api:types`). **Nunca** escribir tipos de API a mano |
| `types.ts` | alias con nombre (`MeDto`, `Business`, `StampCard`, `CursorPage<T>`…). Agregar alias aquí si hace falta |
| `client.ts` | `request(method, '/v1/...', { path, query, body, headers, signal, meta })` tipado por ruta + interceptores |
| `endpoints/*.ts` | una función por operación: `authApi`, `meApi`, `publicApi`, `businessesApi`, `cardsApi`, `loyaltyApi`, `crmApi`, `billingApi` (también exportados como namespaces desde `@/api`) |
| `errors.ts` | `ApiError` (`status`, `code`, `detailCode`, `fieldErrors`, `detailObj`, `requestId`, `retryAfterMs`, `isNetwork`, `isConflictRetry`) |
| `messages.ts` | catálogo §5 → texto de UI: `errorMessage(e)`, `describeError(e)` |
| `idempotency.ts` | `withIdempotency(key => …)`, `newIdempotencyKey()` |

- Las funciones de `endpoints/` ya devuelven `data` (sin envelope). Las listas paginadas devuelven `{ data, page }`.
- Todo error que llega a una página es `ApiError`. **Decidir siempre por `code` / `detailCode`, nunca por el texto.**
- Lo que ya resuelven los interceptores (NO repetir en las páginas):
  - `401 TOKEN_EXPIRED` → refresh + reintento; `UNAUTHENTICATED` / `SESSION_REVOKED` → login.
  - `403 ACCOUNT_SUSPENDED` → `/cuenta-suspendida`.
  - `403 PASSWORD_REQUIRED` / `REAUTH_REQUIRED` → diálogo global de step-up y reintento (misma `Idempotency-Key`). Si el usuario cancela, la página recibe el error original.
  - `409 CONFLICT` + `retry` → un reintento automático (no en los verify con OTP: ahí la página reinicia desde pedir código).
  - `429` en GET con `Retry-After` ≤ 5 s → espera y reintento.
- Escrituras de mostrador (sellar, alta, canjear, anular): **siempre** `withIdempotency(key => loyaltyApi.stamp(businessId, body, key))`. Una clave por intento lógico; un «registrar sin sellar» tras un error es un intento nuevo.

## Estado

- `useSessionStore()` (`@/stores/session`): `me` (`MeDto`), `accessToken` (solo memoria), `amr`, `isAuthenticated`, `memberships`, `hasMemberships`, `hasPassword`, `isOtpSession`, `emailPendingVerification`, `applySession({ accessToken, amr, user })`, `loadMe()`, `logout(everywhere?)`, `clear()`.
- `useBusinessStore()` (`@/stores/business`): `businesses`, `active`, `activeId`, `role`, `isOwner`, `isCashier`, `entitlement`, `canOperate`, `timezone`, `select(id)`, `load()`, `upsert(business)`, `refreshActive()` (maneja el `404` = ya no eres miembro, §3.3).
  El `businessId` de toda llamada `/v1/businesses/{businessId}/**` sale de `business.activeId`.
- Los stores viejos `auth` y `company` y todo `src/services/**` desaparecen: no importarlos.
- `homeRoute()` / `afterLoginRoute(redirect)` (`@/utils/home`): a dónde va un usuario tras iniciar sesión.

## Rutas y `definePage`

`requiresAuth` / `requiredRole` ya no existen. Meta disponible (ver `env.d.ts` y el guard en `src/plugins/1.router/index.ts`):

| meta | Uso |
|---|---|
| `public: true` | sin sesión (auth, página pública, privacidad, reset, verificación, cuenta suspendida) |
| `guestOnly: true` | además manda a casa a quien ya tiene sesión (login, registro) |
| `area: 'business'` | todo `/empresa/**` (requiere membresía y negocio activo) |
| `needsBusiness: false` | `/empresa/seleccionar`, `/empresa/crear` |
| `ownerOnly: true` | pantallas de dueño (cajero → `/empresa`) |
| `requiresEntitlement: true` | pantallas de mostrador bloqueadas sin `entitlement.allowed` |
| `layout` | `blank` · `company` · `visitor` |

Navegar **por path** (`router.push('/empresa/tarjetas')`, `to="/empresa"`), no por nombre de ruta.

## UI

- Composition API + `<script setup lang="ts">`, Vuetify/Vuexy, sin SweetAlert2.
- Importar **explícitamente** los componentes y composables nuevos (`@/components/common/...`, `@/composables/...`): los `.d.ts` de auto-import se regeneran solo con Vite.
- Errores: `const { error, fieldErrors, capture, reset } = useApiError()` + `<ApiErrorAlert :error="error" />` (muestra el folio `requestId`) y `:error-messages="fieldErrors['business.name']"` en los campos.
  El texto viene de `messages.ts`; el `message` del backend ya está en español y se puede mostrar.
- Carga: `isLoading` en botones, `VSkeletonLoader` en listas. Un error de carga **no** se muestra como lista vacía.
- Listas con cursor: `useCursorList(cursor => api(...{ cursor, limit }))` → `items`, `loading`, `hasMore`, `loadMore`, `reload`, `error`, `isEmpty`. **No hay totales** en v1: no inventarlos.
- Fechas: `@/utils/dates` — `formatInstant(iso, business.timezone)`, `formatDateTime`, `formatTime`, `formatLocalDate('YYYY-MM-DD')` para `startsOn`/`endsOn` (inclusivo), `todayInZone(tz)`, `timeAgo`. Nunca `toLocaleDateString` sin zona para datos del negocio.
- QR: `<AppQrCode :value="qrPayload" />` (`@/components/common/AppQrCode.vue`). v1 ya no manda imágenes de QR del usuario/tarjeta.
- Markdown (aviso de privacidad): `<MarkdownContent :source="bodyMd" />`. Aviso simplificado: `<PrivacyNoticeShort />`.
- Paywall: `<EntitlementBanner />` (`@/components/business/EntitlementBanner.vue`) y `paywallMessage(reason, role)` (`@/utils/entitlement`) ante un `402`.
- OTP: `<OtpCodeForm :expires-at :destination :loading :resending :error @submit @resend @back />` (`@/components/auth/OtpCodeForm.vue`).
- Reautenticar antes de una acción costosa (exportar datos): `await ensureReauthenticated()` (`@/composables/useReauth`).
- Imágenes (logo, ícono): `accept="image/png,image/jpeg,image/webp"` y validar `file.size <= 2 * 1024 * 1024` antes de subir.
- Teléfonos: se envían como los teclea el usuario; el front ya no antepone `+52`. Las respuestas de negocio solo traen `phoneMasked`.
- ids: siempre uuid tomados de respuestas previas; `repittCode` (8 caracteres) solo en página pública y QR.
- Estilos: propiedades lógicas (`inline-size`, `block-size`…), sin `:deep()` en bloques `scoped` (usar un bloque global con clase propia).
