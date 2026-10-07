# Gotchas

Cosas que parecen simples pero tienen trampa. Errores comunes a evitar.

---

<!-- Formato sugerido:
## [Título del gotcha] — YYYY-MM-DD
**Problema:** qué pasa si no se tiene en cuenta
**Solución:** cómo manejarlo correctamente
-->

## `growth: null` rompe `ProgressMiniCard` — 2026-03-21
**Problema:** El componente `ProgressMiniCard` usa `v-if="props.growth !== undefined"` para mostrar/ocultar la sección de crecimiento. Si se le pasa `null` (que viene del backend cuando no hay dato), lo muestra igual pero vacío.
**Solución:** Usar `?? undefined` al pasar el prop:
```vue
:growth="metrics.visits.growth ?? undefined"
```

---

## `min-height` en estilos inline provoca advertencia del linter — 2026-03-21
**Problema:** Usar `style="min-height: 200px"` en algunos contextos de Vuetify/VSCode genera advertencia del linter CSS.
**Solución:** Usar la propiedad lógica equivalente `min-block-size`:
```vue
<VImg style="min-block-size: 200px" ... />
```

---

## Orden de propiedades CSS en estilos inline (stylelint-config-idiomatic-order) — 2026-03-23
**Problema:** El proyecto usa `stylelint-config-idiomatic-order` + `stylelint-use-logical-spec`. Los estilos inline en templates Vue son validados por stylelint. El orden incorrecto rompe el linting.
**Solución:** Orden confirmado por errores reales:
- Propiedades lógicas obligatorias: `block-size` (no `height`), `inline-size` (no `width`), `max-inline-size`, `min-block-size`, `padding-block`, `padding-inline`, `border-inline-start`, `border-block-start`
- Orden de grupos: `overflow` → `border-radius` → `background` → `box-shadow` → `gap` → `padding-block/inline` → `block-size/inline-size` → `color` → `font-size` → `font-weight` → `gap` (cuando coexiste con font props: después de font-weight, antes de letter-spacing) → `letter-spacing` → `text-transform`
- `gap` va ANTES de `grid-template-columns`
- Alpha en rgba: usar `%` no decimales: `rgba(0, 0, 0, 55%)` ✅ — `rgba(0, 0, 0, 0.55)` ❌

---

## Tamaños fijos en componentes rompen layouts mobile — 2026-03-22
**Problema:** `UserQrCard.vue` tenía `VAvatar size="450"` y `VImg width="950"` hardcodeados. En el layout desktop con sidebar, "cabían". Al pasar al nuevo layout `visitor.vue` con `max-inline-size: 600px`, desbordaban completamente.
**Solución:** Nunca usar tamaños fijos en px para imágenes de contenido. Usar `width="100%"` + `max-inline-size` en CSS:
```vue
<VImg :src="qrPath" :aspect-ratio="1" width="100%" />
```
```css
.qr-container { inline-size: 100%; max-inline-size: 280px; }
```

---

## `topbar-right` necesita `margin-inline-start: auto` — 2026-03-22
**Problema:** En el layout `visitor.vue`, el título central tiene `v-if="pageTitle"`. En el home (`pageTitle === ''`), no se renderiza. Sin el elemento central como spacer, los elementos de la derecha colapsan hacia la izquierda junto al logo.
**Solución:** Dar `margin-inline-start: auto` al elemento `.topbar-right` en lugar de depender de un elemento flex central:
```css
.topbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-inline-start: auto;
}
```

---

## `VAvatar` con `image=""` (string vacío) no muestra el fallback — 2026-03-21
**Problema:** Si se pasa `image=""` o `image="null"` (string), VAvatar intenta cargar la imagen y falla silenciosamente. El slot de fallback con la inicial no se muestra.
**Solución:** Pasar `undefined` explícitamente cuando no hay imagen:
```vue
:image="business.logoPath || undefined"
```

---

## ApexCharts: `borderRadius` en barras con valor 0 causa crash — 2026-03-23
**Problema:** `borderRadius` en `plotOptions.bar` lanza `TypeError: Cannot read properties of undefined (reading 'call')` cuando alguna barra tiene valor `0`. El cálculo del path SVG falla para barras de altura cero.
**Solución:** No usar `borderRadius` en bar charts. Eliminarlo completamente de `plotOptions.bar`.
```ts
// ❌ plotOptions: { bar: { borderRadius: 6 } }
// ✅ plotOptions: { bar: { columnWidth: '45%' } }
```

---

## ApexCharts: `@use apex-chart.scss` debe estar en bloque global (no scoped) — 2026-03-23
**Problema:** Si el `@use "@core/scss/template/libs/apex-chart.scss"` está en un `<style scoped>`, los estilos de ApexCharts no se aplican (quedan en scope del componente y no alcanzan el SVG del chart).
**Solución:** Usar un bloque `<style lang="scss">` separado sin `scoped`:
```vue
<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
<style lang="scss" scoped>
/* estilos locales */
</style>
```

---

## Vue 3: props booleanas omitidas se castean a `false` — 2026-03-23
**Problema:** Una prop tipada como `boolean?` que NO se pasa al componente toma el valor `false`, no `undefined`. Esto causa bugs sutiles (ej: banner "tarjeta desactivada" aparece aunque la tarjeta esté activa).
**Solución:** Siempre pasar explícitamente todas las props booleanas:
```vue
<!-- ❌ isActive será false -->
<StampCardDetailsAsVisitor :reward="..." />
<!-- ✅ -->
<StampCardDetailsAsVisitor :is-active="data?.stampCard?.isActive" :reward="..." />
```

---

## Las páginas no deben repetir lo que hacen los interceptores — 2026-10-06
**Problema:** manejar `401`, `TOKEN_EXPIRED`, `PASSWORD_REQUIRED`, `REAUTH_REQUIRED` o `409 CONFLICT retry` en una página duplica el refresh, abre dos diálogos o reintenta dos veces una escritura.
**Solución:** dejar que `src/api/client.ts` lo resuelva. La página solo recibe el error final (`ApiError`) si el usuario cancela el step-up o el reintento vuelve a fallar.

---

## Una escritura de mostrador = una clave de idempotencia — 2026-10-06
**Problema:** generar una `Idempotency-Key` nueva en un reintento puede duplicar un sello; reutilizarla con otro cuerpo da `409 IDEMPOTENCY_MISMATCH`.
**Solución:** `withIdempotency(key => loyaltyApi.stamp(businessId, body, key))` con el **mismo objeto** `body` en todos los intentos. Un nuevo intento del usuario (p. ej. «registrar sin sellar») usa una clave nueva.

---

## Exportar datos: reautenticar antes, no después — 2026-10-06
**Problema:** `GET /v1/me/export` tiene límite de 3/h y un `403 REAUTH_REQUIRED` también cuenta.
**Solución:** `await ensureReauthenticated()` y luego una sola llamada.

---

## Fechas del negocio en la zona del negocio — 2026-10-06
**Problema:** `toLocaleDateString()` usa la zona del navegador; un sello a las 23:30 en CDMX puede verse en el día siguiente.
**Solución:** `formatInstant(iso, useBusinessStore().timezone)`. Para `startsOn`/`endsOn` usar `formatLocalDate` (son fechas de calendario; `endsOn` es inclusivo).

---

## Un error de carga no es una lista vacía — 2026-10-06
**Problema:** mostrar «No hay clientes» cuando la llamada falló oculta el problema.
**Solución:** `useCursorList` expone `error` e `isEmpty` por separado; pintar `ApiErrorAlert` con el folio y un botón de reintentar.
