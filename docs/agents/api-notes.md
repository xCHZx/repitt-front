# Notas de API (v1)

Comportamientos del backend v1 descubiertos al integrar, que no son obvios en la guía o el contrato.
Referencias: `src/api/openapi.json` (manda) y `repitt-backend/docs/api/front-guide-v1.md`.
Las notas sobre la API V2 (`/businesses/:id/...`, `/users/me/...`, `response.data.data`) se eliminaron el 2026-10-06: ese contrato ya no existe.

---

<!-- Formato:
## [Endpoint o módulo] — YYYY-MM-DD
**Comportamiento:** qué hace o retorna de forma no obvia
**Impacto:** cómo afecta al frontend
-->

## Rutas `/v1/auth/*` sin cuerpo no deben llevar `Content-Type` — 2026-10-06
**Comportamiento:** un `POST` sin cuerpo con `Content-Type: application/x-www-form-urlencoded` responde `400 VALIDATION_FAILED` con `details[0].code === 'jsonRequired'`. Axios pone ese tipo por defecto en algunos adaptadores (Node).
**Impacto:** `request()` elimina el `Content-Type` cuando no hay cuerpo (y lo mismo hace el refresh). No llamar a `axios` directo.

## `INVALID_PHONE` llega sin `details` — 2026-10-06
**Comportamiento:** `PATCH /v1/businesses/{id}` (`publicPhone`) y `POST …/members` (`phone`) responden `400 INVALID_PHONE` sin `details[]`.
**Impacto:** asignar el error al campo de teléfono por `code`, no por `fieldErrors`.

## Errores de validación anidados usan la ruta completa — 2026-10-06
**Comportamiento:** en horarios el campo llega como `openingHours.mon.0.open` (`matches`) y `openingHours.mon` (`arrayMaxSize`). La guía lo abrevia como `mon.0.open`.
**Impacto:** buscar `fieldErrors['openingHours.<día>...']`.

## `409 CONFLICT` trae un `message` genérico — 2026-10-06
**Comportamiento:** el `message` del envelope es «El recurso entra en conflicto con el estado actual»; el texto útil viene en `details[0].message` (p. ej. `ownerPhone`: «Ese teléfono es el del dueño del negocio», con `field: 'phone'`).
**Impacto:** el catálogo (`src/api/messages.ts`) prefiere el texto del detalle.

## Cliente dado de baja y correcciones de soporte usan el uuid cero — 2026-10-06
**Comportamiento:** en `LoyaltyEventDto`, `customer.id` y `cycleId` valen `00000000-0000-0000-0000-000000000000` (no `null`, aunque la guía §4.A.8 diga «nulo»). En `ActorRefDto` el soporte llega con `role: 'admin'` y el uuid cero.
**Impacto:** comparar contra el uuid cero; no enlazar a ficha ni ciclo.

## Reusar un código OTP ya gastado responde `410 OTP_EXPIRED` — 2026-10-06
**Comportamiento:** tras un `owner/register/verify` exitoso, el mismo `challengeId` responde `410`.
**Impacto:** ante `409 PHONE_TAKEN` / `EMAIL_TAKEN` / `CONFLICT retry` en el paso 2, volver al paso 1 y pedir un código nuevo.

## Checkout de Stripe en local requiere `STRIPE_PRICE_ID` — 2026-10-06
**Comportamiento:** sin esa variable en el `.env` del backend, `POST …/billing/checkout` responde `500 INTERNAL_ERROR` aun con Stripe simulado.
**Impacto:** configuración del backend, no del front. `pnpm test:integration` omite ese caso salvo `CHECKOUT=1`.

## Imágenes en local — 2026-10-06
**Comportamiento:** con `STORAGE_PROVIDER=fake`, `logoUrl`, `qrUrl`, `flyerUrl` e `iconUrl` apuntan a una base ficticia; en QA/prod son URLs públicas de Supabase Storage.
**Impacto:** en local las imágenes no cargan; probarlas en QA.

## Límites que el contrato no expone — 2026-10-06
**Comportamiento:** máximo de tarjetas publicadas (5), no archivadas (20), ventana para anular (15 min), prueba (30 días) y gracia (7 días) son valores por defecto del backend, configurables.
**Impacto:** el front usa 5 / 20 / 15 min solo para avisos y para mostrar «Deshacer»; el backend sigue siendo la autoridad (`409` / `403 VOID_WINDOW_EXPIRED`). Prueba y gracia se leen siempre de `until`.
