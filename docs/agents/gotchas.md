# Gotchas

Cosas que parecen simples pero tienen trampa. Errores comunes a evitar.

---

<!-- Formato sugerido:
## [Título del gotcha] — YYYY-MM-DD
**Problema:** qué pasa si no se tiene en cuenta
**Solución:** cómo manejarlo correctamente
-->

## `business` está en la raíz del payload de visitante, no dentro de `stampCard` — 2026-03-21
**Problema:** Al leer datos de `/users/me/stamp-cards/:id`, es tentador asumir que el negocio viene anidado como `data.stampCard.business`. Pero la respuesta real tiene `business` en la raíz del objeto.
**Solución:** Acceder siempre como `data.business.name`, `data.business.logoPath`, etc. La tarjeta en sí viene en `data.stampCard.*`.

Estructura real del payload:
```json
{
  "id": 1,
  "visitsCount": 3,
  "isCompleted": false,
  "isRewardRedeemed": false,
  "business": { "name": "...", "logoPath": "..." },
  "stampCard": { "name": "...", "stampsRequired": 10, "reward": "..." }
}
```

---

## Props booleanas vs numéricas en componentes de stamp cards — 2026-03-21
**Problema:** `StampCardListItem` y similares tienen props como `isCompleted` e `isRedeemed` definidas como `Number`. El backend nuevo devuelve booleanos (`true/false`). Vue lanza warnings de tipo en consola.
**Solución:** Definir las props como `boolean | number` para aceptar ambos formatos:
```ts
const props = defineProps<{
  isCompleted: boolean | number
  isRedeemed: boolean | number
}>()
```

---

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

## `response.data.data` vs `response.data` — RESUELTO — 2026-03-21
**Resumen confirmado:**
- Endpoints `/businesses/...` → todos devuelven `{ data: {...} }` manualmente → `response.data.data` ✅
- `GET /users/me` → devuelve `{ role, data: {...} }` → `response.data.data` para el usuario ✅
- `PATCH /users/me` y otros de `/users/...` → devuelven plano → `response.data` ✅
- `refreshUserData` retorna `response.data` = `{ role, data }`. Extraer `.data` al usar en componentes: `(await refreshUserData()).data`

---

## Orden de propiedades CSS en estilos inline (stylelint-config-idiomatic-order) — 2026-03-23
**Problema:** El proyecto usa `stylelint-config-idiomatic-order` + `stylelint-use-logical-spec`. Los estilos inline en templates Vue son validados por stylelint. El orden incorrecto rompe el linting.
**Solución:** Orden confirmado por errores reales:
- Propiedades lógicas obligatorias: `block-size` (no `height`), `inline-size` (no `width`), `max-inline-size`, `min-block-size`, `padding-block`, `padding-inline`, `border-inline-start`, `border-block-start`
- Orden de grupos: `overflow` → `border-radius` → `background` → `box-shadow` → `gap` → `padding-block/inline` → `block-size/inline-size` → `color` → `font-size` → `font-weight` → `gap` (cuando coexiste con font props: después de font-weight, antes de letter-spacing) → `letter-spacing` → `text-transform`
- `gap` va ANTES de `grid-template-columns`
- Alpha en rgba: usar `%` no decimales: `rgba(0, 0, 0, 55%)` ✅ — `rgba(0, 0, 0, 0.55)` ❌

---

## Variables `baseUrl` muertas en servicios — LIMPIADAS — 2026-03-21
Las 4 variables `baseUrl` con rutas viejas y la función duplicada `registerVisitByUserStampCardAsCompany` fueron eliminadas en sesión 2. No quedan referencias a rutas legacy.

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

## `GET /users/me` no debe usarse para actualizar `authRole` — 2026-03-27
**Problema:** `GET /users/me` devuelve un campo `role` pero no es la fuente de verdad del rol de sesión. Si se usa para sobreescribir `authStore.authRole`, puede degradar un Owner a Visitor (o viceversa) porque el rol del JWT y el de users/me pueden diferir en ciertos casos edge.
**Solución:** `authStore.refreshUserData` fue modificado para NO actualizar `authRole`. El rol solo se establece en `populateAuthData` al momento del login. Si necesitas datos del usuario (nombre, etc.), usa `refreshUserData` para los datos del perfil únicamente.

---

## Router guard: `isActive === false` no `!isActive` — 2026-03-27
**Problema:** El guard de `/empresa` usa `companyStore.selectedCompany.isActive` para decidir si redirigir a `/empresa/planes`. Al hacer login, el company store se limpia y `isActive` queda `null`. `!null` es `true`, así que redirigía a `/empresa/planes` aunque el negocio tuviera suscripción activa.
**Solución:** Comparar con `=== false` explícito para distinguir "no cargado aún" (`null`) de "inactivo" (`false`):
```ts
if (isBusinessActive === false)
  next({ path: '/empresa/planes' })
```

---

## `POST /auth/visitor/login` siempre devuelve `role: "Visitor"` — por diseño — 2026-03-27
**Problema:** Un usuario que tiene negocios (Owner) también puede tener cuenta de visitante. Si intenta entrar desde el tab "Soy visitante" (teléfono), el endpoint `/auth/visitor/login` le devuelve `role: "Visitor"` y no verá su panel de negocio.
**Solución:** Es comportamiento esperado por seguridad. Para acceder al panel de negocio, el usuario DEBE usar el tab "Tengo un negocio" (email + contraseña), que llama a `POST /auth/login` y devuelve `role: "Owner"`.

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
