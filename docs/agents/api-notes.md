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
**Impacto:** asignar el error al campo de teléfono por `code`, no por `fieldErrors`. El backend propone (próximo lote, aditivo) `details: [{ field, code: 'invalidPhone', message }]`: cuando llegue, preferir `fieldErrors[field]`.

## Errores de validación anidados usan la ruta completa — 2026-10-06
**Comportamiento:** en horarios el campo llega como `openingHours.mon.0.open` (`matches`) y `openingHours.mon` (`arrayMaxSize`). La guía lo abrevia como `mon.0.open`.
**Impacto:** buscar `fieldErrors['openingHours.<día>...']`.

## `409 CONFLICT` trae un `message` genérico — 2026-10-06
**Comportamiento:** el `message` del envelope es «El recurso entra en conflicto con el estado actual»; el texto útil viene en `details[0].message` (p. ej. `ownerPhone`: «Ese teléfono es el del dueño del negocio», con `field: 'phone'`).
**Impacto:** el catálogo (`src/api/messages.ts`) prefiere el texto del detalle.

## Cliente dado de baja y correcciones de soporte usan el uuid cero — 2026-10-06
**Comportamiento:** en `LoyaltyEventDto`, `customer.id` y `cycleId` valen `00000000-0000-0000-0000-000000000000`, **nunca** `null` (confirmado por backend 2026-10-06; la guía §4.A.8 decía «nulo» y se corrige). En `ActorRefDto` el soporte llega con `role: 'admin'` y el uuid cero.
**Impacto:** comparar contra el uuid cero; no enlazar a ficha ni ciclo.

## Reusar un código OTP ya gastado responde `410 OTP_EXPIRED` — 2026-10-06
**Comportamiento:** tras un `owner/register/verify` exitoso, el mismo `challengeId` responde `410`.
**Impacto:** ante `409 PHONE_TAKEN` / `EMAIL_TAKEN` / `CONFLICT retry` en el paso 2, volver al paso 1 y pedir un código nuevo.

## Checkout de Stripe en local requiere `STRIPE_PRICE_ID` — 2026-10-06
**Comportamiento:** con `STRIPE_PRICE_ID` vacío en el `.env` del backend, `POST …/billing/checkout` responde `500 INTERNAL_ERROR` aun con Stripe simulado. `.env.example` trae `price_devfake` (corregido en el `.env` local el 2026-10-06).
**Impacto:** configuración del backend. `pnpm test:integration` omite ese caso salvo `CHECKOUT=1`.

## Imágenes en local — 2026-10-06
**Comportamiento:** con `STORAGE_PROVIDER=fake`, `logoUrl`, `qrUrl`, `flyerUrl` e `iconUrl` apuntan a una base ficticia; en QA/prod son URLs públicas de Supabase Storage.
**Impacto:** en local las imágenes no cargan; probarlas en QA.

## Límites que el contrato no expone — 2026-10-06
**Comportamiento:** `MAX_PUBLISHED_CARDS` (5) y `VOID_WINDOW_MINUTES` (15) se configuran por entorno (no por negocio); el máximo de 20 tarjetas sin archivar es constante del código. Prueba (30 días) y gracia (7 días) también son configurables. El backend propone exponer los límites en un lote aditivo.
**Impacto:** el front usa 5 / 20 / 15 min solo para avisos y para mostrar «Deshacer»; el backend sigue siendo la autoridad (`409` / `403 VOID_WINDOW_EXPIRED`). Prueba y gracia se leen siempre de `until`.

## Reset de contraseña por teléfono: qué se valida antes del código — 2026-10-06
**Comportamiento:** `minLength`, `maxUtf8Bytes`, `passwordTooCommon` y una contraseña que contiene «repitt» (`passwordContainsPersonalData`) se rechazan **antes** de verificar el código: el código sigue sirviendo. El correo o el teléfono dentro de la contraseña se revisan **después**: el código ya se gastó.
**Impacto:** `PasswordResetPhone.vue` distingue los dos casos de `passwordContainsPersonalData` por si la contraseña enviada contiene «repitt»; el formulario además rechaza «repitt» antes de enviar.

## Alta en mostrador con `cardId` es una sola transacción — 2026-10-06
**Comportamiento:** cualquier error (incluidos `404` y `BUSINESS_NOT_PUBLISHED`) revierte el alta completa.
**Impacto:** «Registrar sin sellar» solo ante errores de reglas de la tarjeta (`CARD_*`, `COOLDOWN_ACTIVE`, `MIN_INTERVAL`, `REWARD_PENDING`, `MAX_CYCLES_REACHED`); nunca ante `BUSINESS_NOT_PUBLISHED` (el alta sin tarjeta también lo exige). `404` → recargar tarjetas.

## Íconos de tarjeta de más de 256 px se reescalan — 2026-10-06
**Comportamiento:** se ajustan dentro de 256×256 conservando proporción (sin agrandar) y se recodifican en su formato. Solo se rechaza tipo no admitido, > 2 MiB o > 25 MP.

## QR del negocio en el escáner — 2026-10-06
**Comportamiento:** el backend no necesita recibir códigos que no empiecen con `repitt:`. El QR del negocio (`<APP_URL>/n/<código>`) cabe en 64 caracteres y respondería `INVALID_QR businessQr`.
**Impacto:** el front los rechaza localmente y detecta `/n/` para el mensaje específico.

## Progreso del ciclo usa `cycle.requiredStamps` — 2026-10-06
**Comportamiento:** se copia de la tarjeta al abrir el ciclo y el ciclo se completa con ese valor; `card.requiredStamps` solo aplica a ciclos nuevos. `MeCardBusinessDto` aún no trae `timezone` (propuesto en el próximo lote aditivo).
