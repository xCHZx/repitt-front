# Notas de API

Comportamientos del backend (NestJS) descubiertos durante el desarrollo.

---

<!-- Formato sugerido:
## [Endpoint o módulo] — YYYY-MM-DD
**Comportamiento:** qué hace o retorna de forma no obvia
**Impacto:** cómo afecta al frontend
-->

## Normalización de campos — 2026-03-18
**Comportamiento:** Algunos endpoints retornan campos en `snake_case` (`logo_path`, `is_active`) y otros en `camelCase` (`logoPath`, `isActive`) dependiendo del endpoint.
**Impacto:** El store `company` normaliza ambos formatos en `selectCompany()`. Al leer datos del backend, verificar siempre qué formato usa ese endpoint específico.

---

## Patrón general de endpoints empresa — 2026-03-21
**Comportamiento:** Todos los endpoints autenticados de empresa siguen el patrón `/businesses/:businessId/[recurso]`. El `businessId` es el ID de la empresa actualmente seleccionada.
**Impacto:** Siempre pasar `companyStore.selectedCompany.id` como primer parámetro en servicios de empresa.

Endpoints migrados:
| Viejo | Nuevo |
|-------|-------|
| `GET /company/stampcard/business/:id/active/logged-user` | `GET /businesses/:businessId/stamp-cards` |
| `POST /company/visit` | `POST /businesses/:businessId/visits/scan` |
| `GET /company/visit/stampcard/:id/logged-user` | `GET /businesses/:businessId/stamp-cards/:stampCardId/visits` |
| `GET /company/visit/business/logged-user` | `GET /businesses/:businessId/visits` |
| `POST /company/metric/global` | `GET /businesses/:businessId/metrics?timePeriod=...` |
| `GET /company/user-stampcard/:id` | `GET /businesses/:businessId/user-stamp-cards/:userStampCardId` |
| `GET /company/user-stampcard/pending-redeem` | `GET /businesses/:businessId/user-stamp-cards/pending-redeem` |
| `POST /company/user-stampcard/redeem` | `POST /businesses/:businessId/user-stamp-cards/:userStampCardId/redeem` |

---

## `POST /businesses/:businessId/visits/scan` — actualizado 2026-03-25
**Comportamiento:** Registra una visita. Acepta 3 payloads (prioridad en el controller):
1. `{ userStampCardRepittCode }` — QR de tarjeta específica (auto-contained, no requiere stampCardId)
2. `{ userRepittCode, stampCardId }` — QR de perfil del visitante
3. `{ phone, stampCardId }` — teléfono manual (visitante sin app abierta)

Responde `{ message, progress: { id, visitsCount, isCompleted, isRewardRedeemed, repittCode, ... } }`.

**Impacto:**
- `isCompleted: true` → mostrar pantalla de canje de premio (no éxito normal)
- `visitsCount` refleja el ciclo actual, no histórico total
- Detección por longitud: 11 chars = `userRepittCode`, 15 chars = `userStampCardRepittCode`
- `phone` debe enviarse exactamente como fue registrado (con código de país, ej. `+521234567890`)

---

## `GET /businesses/:businessId/metrics?timePeriod=` — 2026-03-21
**Comportamiento:** Acepta `timePeriod` como query param: `day | week | month | year`. Default: `month`. Retorna objeto con múltiples métricas (visits, newClients, activeStampCards, topClients, visitsByMonth).
**Impacto:** `topClients[].userId/firstName/lastName/visitsCount`. `visitsByMonth[].month/visitsCount`. `growth` puede ser `null` si no hay período anterior — usar `?? undefined` para no romper `ProgressMiniCard`.

---

## `GET /businesses/:businessId/user-stamp-cards/pending-redeem` — 2026-03-21
**Comportamiento:** Retorna tarjetas de usuario listas para canjear recompensa. Payload: `{ stampCard: { name, reward }, customer: { firstName, lastName }, completedAt, ... }`.
**Impacto:** Campos: `stampCard.reward` (puede ser `null`), `customer.firstName/lastName`, `completedAt` (ISO date).

---

## `POST /businesses/:businessId/user-stamp-cards/:userStampCardId/redeem` — 2026-03-21
**Comportamiento:** No requiere body. Responde 201 con la USC actualizada.
**Impacto:** Llamar sin payload: `authAxios.post(\`/businesses/${businessId}/user-stamp-cards/${userStampCardId}/redeem\`)`.

---

## `POST /businesses/:businessId/stamp-cards` — 2026-03-21
**Comportamiento:** Crea una stamp card. Requiere JWT (Owner). El `businessId` va en la URL. Body JSON (no multipart). El ícono se sube **por separado** con `POST /businesses/:businessId/stamp-cards/:stampCardId/icon` (multipart, acepta jpg/png/gif/webp/svg, máx 2MB).
**Impacto:** Flujo en dos pasos en `crear.vue`: 1) crear → obtener `newStampCard.id`, 2) si hay ícono → `uploadStampCardIcon(businessId, newStampCard.id, file)`. El campo del form para el ícono no va en el payload de creación.

Body esperado (camelCase, todo JSON):
```json
{
  "name": "string",
  "description": "string",
  "requiredStamps": 10,
  "requiredHours": 24,
  "reward": "string",
  "primaryColor": "#493599",
  "allowedRepeats": 5,
  "startDate": "ISO string",
  "endDate": "ISO string (opcional)"
}
```

---

## Endpoints visitante — 2026-03-21
**Comportamiento:** Todos los endpoints de visitante autenticado usan `/users/me/...` (sin pasar ID explícito, el backend infiere del JWT).

| Endpoint | Retorna |
|----------|---------|
| `GET /users/me/stamp-cards` | Lista de USCs con `business` y `stampCard` en raíz |
| `GET /users/me/stamp-cards/:id` | USC individual — `business` en raíz, `stampCard.*` anidado |
| `GET /users/me/visits` | Lista de visitas con `totalVisits` y array `visits[]` |

**Impacto:** En la lista de USCs, `business` y `stampCard` están al mismo nivel en cada item. En detalle de USC, igual. No buscar `item.stampCard.business`.

---

## `GET /users/me/visits` — nombre de campo total — 2026-03-21
**Comportamiento:** Retorna `{ totalVisits: number, visits: [...] }`.
**Impacto:** El campo se llama `totalVisits`, no `visits_count` ni `total`. Cada visita tiene `visitsCount` acumulado del usuario en esa tarjeta.

---

## `GET /users/me` — wrapper único — 2026-03-21
**Comportamiento:** Es el único endpoint que usa `{ role: "owner | visitor", data: { ...usuario } }` en lugar del wrapper `{ data }` estándar. Los demás endpoints de `/users/...` devuelven plano.
**Impacto:** `getCurrentVisitorData` usa `response.data.data` ✅. `refreshUserData` usa `response.data` (= `{ role, data }`) y lo pasa al store, que tiene guard defensivo. Al usar `refreshUserData` en componentes, extraer `.data`: `(await refreshUserData()).data`.

---

## `PATCH /users/me` — editar perfil visitante — 2026-03-21
**Comportamiento:** Acepta body parcial `{ firstName?, lastName?, phone? }`. Devuelve usuario plano (sin wrapper). Auth: Bearer token.
**Impacto:** Implementado en `visitor/users.ts` → `updateCurrentVisitorData`. Usado en `ProfileDetails.vue` (dialog de edición inline).

---

## `POST /businesses` — crear negocio — 2026-03-21
**Comportamiento:** Crea un negocio. Body JSON (no multipart). Genera `repittCode`, QR y flyer automáticamente. No crea stamp card por defecto. El logo se sube por separado con `POST /businesses/:id/logo`.
**Impacto:** `createBusinessAsCompany` envía JSON. Flujo dos pasos en `empresa/crear.vue`: 1) crear → obtener `newBusiness.id`, 2) si hay logo → `uploadBusinessLogo`.

Body esperado:
```json
{
  "name": "string (requerido)",
  "categoryId": 3,
  "description": "string (opcional)",
  "address": "string (opcional)",
  "phone": "string (opcional)",
  "openingHours": "string (opcional)"
}
```
Respuesta 201: `{ data: { id, name, businessRepittCode, logoPath, qrPath, flyerPath, isActive, category, stampCards: [] } }`

---

## Suscripciones por negocio — 2026-03-26

**Comportamiento:** La suscripción está linkeada al negocio, no al usuario. Cada negocio tiene su propia suscripción. Los endpoints de suscripción cambiaron:

| Endpoint | Cambio |
|----------|--------|
| `GET /subscriptions/me` | **ELIMINADO** |
| `GET /subscriptions/business/:businessId` | **NUEVO** — devuelve sub del negocio o `null` si no tiene |
| `POST /subscriptions/portal` | Ahora requiere body `{ businessId }` |
| `POST /subscriptions/cancel` | Requiere body `{ businessId }` |
| `POST /subscriptions/checkout` | Sin cambios — ya tenía `{ businessId }` |

Respuesta de `GET /subscriptions/business/:businessId`:
```json
{
  "status": "active",
  "planName": "Emprendedor",
  "currentPeriodEnd": "2026-04-26T22:33:00.000Z",
  "cancelAt": null,
  "cancelAtPeriodEnd": false,
  "canceledAt": null,
  "createdAt": "2026-03-26T22:33:06.000Z"
}
```
Retorna `null` si el negocio no tiene suscripción activa.

**Impacto:**
- Llamar siempre con `companyStore.selectedCompany.id`
- Multi-negocio: cada negocio se consulta individualmente
- El front carga la sub del negocio activo al entrar a `/empresa` y `/empresa/planes`

---

## `GET /users/me` — campo `subscription` eliminado — 2026-03-26
**Comportamiento:** El campo `subscription` fue removido del response de `/users/me`. Ahora devuelve `plan: "free|premium"` en lugar de los datos completos de Stripe.
**Impacto:** `authStore` ya no guarda datos de suscripción. El auth store solo maneja token, rol y datos del usuario. La suscripción vive en `companyStore.businessSubscription`.

---

## Auth separado por rol — 2026-03-23 (actualizado 2026-03-27)
**Comportamiento:** Los endpoints de auth están separados por tipo de usuario.
- Owner: `POST /auth/onboarding` (registro) y `POST /auth/login` (login con email+password)
- Visitor: `POST /auth/visitor/register` (registro, solo firstName+phone, JWT inmediato) y `POST /auth/visitor/login` (login, solo phone, JWT inmediato)

**Respuestas de login:**
- `POST /auth/login` → `{ token, role: "Owner", data: { firstName, phone, plan } }`
- `POST /auth/visitor/login` → `{ token, role: "Visitor", data: { firstName, phone, plan } }` — **siempre Visitor por diseño (seguridad)**

El campo `role` del login response es la fuente de verdad para `authRole` en el store (via `populateAuthData`). `GET /users/me` NO debe usarse para actualizar el rol — `refreshUserData` en el front fue corregido para no sobreescribir el rol del store.

**Impacto:** El campo teléfono en onboarding de owner pasó a ser requerido (antes opcional). El visitor no tiene email ni contraseña. Servicios en `auth.ts`: `loginVisitor`, `registerVisitor` son las nuevas funciones.

**Bug conocido (corregido 2026-03-27):** `POST /auth/login` devolvía `role: "Visitor"` para usuarios con negocios. Ya corregido en backend.

---

## `GET /users/me/visits` — userStampCardId no confirmado — 2026-03-23
**Comportamiento:** No se ha confirmado si el array `visits[]` incluye `userStampCardId` en el endpoint visitante. El endpoint de empresa sí lo incluye.
**Impacto:** La navegación desde `/visitante/visitas` hacia la tarjeta específica está pendiente hasta confirmar el campo. `VisitListItemFull.vue` está preparado para recibirlo cuando esté disponible.

---

## `POST /businesses/:businessId/visits/register-customer` — 2026-03-25
**Comportamiento:** Upsert de cliente + crea USC + registra visita, todo en una sola transacción. Si el teléfono ya existe, acredita visita al cliente existente.

Body: `{ firstName, lastName, phone, stampCardId }`

Responde `{ isNew: boolean, customer: { firstName, lastName, phone }, message, progress: { ... } }`

**Impacto:** `isNew` sirve para diferenciar el mensaje de éxito en la UI: "Cliente registrado" vs "Visita registrada". Usar para flujo de "cliente nuevo sin app".

---

## `GET /businesses/:businessId/customers` — 2026-03-25
**Comportamiento:** Lista todos los clientes del negocio ordenados por `lastVisitAt` desc.

Responde `{ totalCustomers: number, customers: [{ id, firstName, lastName, phone, totalVisits, lastVisitAt, joinedAt, stampCards: [...] }] }`

`stampCards` solo incluye ciclos activos (no canjeados). Si el cliente completó y canjeó todo, `stampCards: []`.
`totalVisits` es histórico completo, no del ciclo actual.
`id` es numérico — usar como `customerId` para el endpoint de detalle.

---

## `GET /businesses/:businessId/customers/:customerId` — 2026-03-25
**Comportamiento:** Detalle de un cliente. `customerId` es el ID numérico del usuario.

Retorna los mismos campos que el listado pero con `stampCards` completo (todos los ciclos, incluyendo `completedAt`, `redeemedAt`, `isRewardRedeemed`).

404 si el customer nunca visitó este negocio.

**Impacto:** Lógica de clasificación en el front:
- `activeCards`: `!isRewardRedeemed` — en progreso o completados pendientes de canje
- `historyCards`: `isRewardRedeemed === true` — ciclos completados y ya canjeados

---

## Businesses endpoints — respuesta con wrapper — 2026-03-21
**Comportamiento:** Todos los endpoints de `/businesses/...` (GET /me, GET /:repittCode, PATCH /:id, POST /:id/logo) devuelven `{ data: {...} }` manualmente. No hay interceptor global.
**Impacto:** El parse `response.data.data` es correcto para todos estos endpoints. `createBusinessAsCompany` parsea `response.data.data` (objeto único, no array).
