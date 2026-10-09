# Plan: estilo de la landing en repitt-front (versión pragmática)

| | |
|---|---|
| Fecha | 2026-10-08 |
| Fuente de verdad | `repitt-web/docs/diseno/guia-de-estilo.md` («la guía», §N) y `repitt-web/src/styles/tokens.css` (HEAD `90884dc`, tokens de `48b2611`) |
| Plan de referencia | `repitt-web/docs/diseno/plan-webapp.md` (versión completa para un equipo; este archivo lo recorta) |
| Enfoque | **A: re-tematizar Vuetify/Vuexy desde los tokens de la guía.** Sin bandera, sin despliegue por porcentajes. QA ligero con capturas |

## Decisiones tomadas (2026-10-08, con el dueño)

| # | Decisión |
|---|---|
| D1 | Camino pragmático: valores exactos de la guía, aplicados directo en la rama `feat/api-v1`. Sin bandera ni capa puente temporal |
| D2 | Textos: solo lo que es estilo — sin mayúsculas forzadas ni `letter-spacing`, progreso «N de M» (no «N/M»). **El glosario (recompensa → premio, etc.) NO se toca en esta pasada** |
| D3 | Tarjeta de sellos completa (con sombra, muescas, talón, sellos con tinta) en vistas de detalle y en la vista previa del editor; **filas planas** (mismos sellos, sin sombra) en listas. Como mucho una tarjeta con sombra por vista |
| D4 | Ícono dentro del sello lleno: **blanco**, obtenido del PNG de `iconUrl` con `filter: brightness(0) invert(1)` (no requiere CORS). Si `iconUrl` no termina en `.png` (foto o JPG/WebP propio), el sello cae a estilo tonal: imagen tal cual sobre `color-mix(--c 16%)`. En el editor, con un ícono predefinido elegido, se dibuja el SVG de `PRESET_ICONS` con `stroke="currentColor"` |
| D5 | Mostrador: se queda en el tema normal; **solo la pantalla de éxito tras sellar** pasa a contexto noche (`.section--night`) con la tarjeta de sellos y el golpe de tinta en el sello nuevo |
| D6 | Tokens con nombres en español (copia literal de `tokens.css`). No chocan con `--v-*` de Vuetify |
| D7 | Fuentes desde Google Fonts (`<link>` en `index.html`), sin dependencias nuevas: `Anybody:wdth,wght@50..150,100..900` y `Plus Jakarta Sans:wght@200..800`. Desviación aprobada del «autohospedar» del plan |
| D8 | Densidad «aplicación» de la guía §15.1 (la app es móvil primero, `main` de 600px) |
| D9 | Se mantiene la anatomía de campo de Vuetify (etiqueta flotante). La anatomía de la guía (etiqueta fija arriba, sin placeholder) queda como deuda documentada |
| D10 | `VSnackbar` se conserva (la guía no tiene toasts) pero plano: superficie, borde `--linea`, check `--acento`. Desviación documentada |
| D11 | Favicon: isotipo «R» de la landing (`repitt-web/public/favicon.svg`) |
| D12 | (2026-10-09) El ícono y el anillo del sello lleno van en **papel o tinta, la de más contraste** con el color de la tarjeta (`stampInk` en `stampCard.ts`, la misma regla que `checkInk` de la landing para el check de la muestra). Con blanco fijo, el amarillo daba 1.40:1. Quedan en tinta naranja, amarillo, verde y azul; el PNG de `iconUrl` pasa a silueta oscura con `filter: brightness(0)`. **Desviación de la guía §2.5** («ícono `#fff`»): conviene llevarla también a la landing |
| D13 | (2026-10-09) Los indicadores indeterminados (spinner y barra) siguen animándose; con movimiento reducido quedan estáticos y visibles (un cuarto de anillo y un tramo de barra). Cambiar los ~54 botones de carga por texto («Guardando») queda como deuda (guía §15, decisión #17 del plan de la landing) |

## Fase 1 — Cimientos (secuencial, antes que todo)

### 1.1 Tokens y base
- `src/styles/tokens.css`: **copia literal** de `repitt-web/src/styles/tokens.css`, con un comentario de cabecera que diga de dónde y de qué HEAD sale. Es la única fuente de color, tipo, espacio, radio, sombra y curva.
- `src/styles/fuentes.css`: `--font-anybody: 'Anybody', 'Anybody fallback'` y `--font-jakarta: 'Plus Jakarta Sans', 'Plus Jakarta Sans fallback'` en `:root`, más los dos `@font-face` de respaldo sobre `local("Arial")` con las métricas de plan-webapp §18.2.
- `src/styles/base.scss`: lo de `repitt-web/src/styles/base.css` que aplica a la app, **sin selectores genéricos que choquen con Vuexy** (no `.container`, `.section`, `.button`, ni `p { max-inline-size }` global):
  - foco global `:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible` 3px `--foco` a 3px;
  - movimiento reducido global (§7.3);
  - `@keyframes stamp-ink`;
  - utilidades: `.section--night`, `.section--tono`, `.dots`, `.lead`, `.note`, `.sr-only`, `.medida` (`max-inline-size: 32em`), `.cifra` (Anybody 800 72% `tabular-nums`), `.titulo-display` (Anybody 800 72%), `.panel` (§8.5, densidad §15.1), `.chip-premio` (§8.8);
  - **`.section-label` global** (reemplaza las ~25 copias locales): `display:flex; align-items:center; gap: var(--s-2); color: var(--texto-2); font-size: var(--t-small); font-weight: 700;` sin mayúsculas ni tracking.
- `src/styles/vuetify.scss`: la capa que pone a Vuetify/Vuexy en la guía (ver 1.3). Importada después de los estilos de la plantilla.
- Importar en `src/main.ts` en este orden, después de `@styles/styles.scss`: `tokens.css`, `fuentes.css`, `base.scss`, `vuetify.scss`. Si la cascada lo exige, mover la capa de overrides a donde gane (por ejemplo `src/plugins/vuetify/index.ts` después de `vuetify/styles`).

### 1.2 Tema
- `src/plugins/vuetify/theme.ts` (Vuetify no acepta `var()`; van los hex de la guía):
  - claro: `primary #6C3CE1`, `primary-darken-1 #5328B8`, `background #F7F6FE`, `surface #FFFFFF`, `on-background/on-surface #2F2B3D`, `secondary #6D6880`, `info #5328B8`, `warning #FF9F43` (solo premios), `success #28C76F` (sin uso genérico nuevo), `error #B42318`; `border-color #2F2B3D` con `border-opacity .12`; todas las `shadow-*-opacity` a `0`.
  - oscuro: `primary #6C3CE1`, `background #25293C`, `surface #2F3349`, `on-* #E1DEF5`, `secondary #ABA7C2`, `info #A58BFF`, `error #FF8A80`; `border-color #E1DEF5` con `.14`; sombras a `0`.
- Sincronizar `<html data-theme>` con el tema **resuelto** de Vuexy (`configStore.theme` light/dark/system → `vuetifyTheme.global.name`), con un `watch` en `App.vue`, y actualizar `meta[name=theme-color]` (`#f7f6fe` / `#25293c`).
- Script previo al pintado en `index.html` (dentro de `try/catch`): lee la cookie `repitt-theme` (`light`/`dark`/`system`) y `matchMedia`, y pone `data-theme` antes del primer pintado. Arreglar el script del loader (las claves correctas son `repitt-initial-loader-*`) y que `public/loader.css` use `#f7f6fe`/`#6c3ce1`.
- `index.html`: `lang="es-MX"`, `meta color-scheme light dark`, metas `theme-color`, favicon `/favicon.svg` (copiar de `repitt-web/public/favicon.svg`), `<link rel="preconnect">` + `<link>` de Google Fonts (D7). Borrar `src/plugins/webfontloader.ts`.
- Quitar el `* { font-family … !important }` de `src/layouts/visitor.vue`.
- `src/assets/styles/styles.scss`: quitar la re-emisión de `@use "vuetify/styles" with (Inter)` y los `.text-hN … !important`, que pisan a Vuexy y duplican todo el CSS de Vuetify.

### 1.3 Vuetify / Vuexy en la guía
Primero por variables (`src/assets/styles/variables/_vuetify.scss` y `_template.scss` con `@forward … with (…)`), luego por defaults (`src/plugins/vuetify/defaults.ts`), y solo lo que no alcance, por CSS en `src/styles/vuetify.scss`. **No tocar `src/@core` ni `src/@layouts`.**

| Pieza | Regla |
|---|---|
| Radios | `$border-radius-root: 12px` (`--r-control`); `$rounded`: `sm 8px`, `lg 12px`, `xl 24px` (`--r-superficie`). Así `rounded="xl"` = superficie y `rounded="lg"` = control sin tocar las páginas |
| Sombras | `$card-elevation`, `$menu-elevation`, `$dialog-elevation`, `$snackbar-elevation`, `$navigation-drawer-temporary-elevation`, `$switch-thumb-elevation` a 0 (o lo que acepte la plantilla), sombras de foco/botón de Vuexy apagadas, y en CSS `box-shadow: none` en `.v-card`, `.v-btn`, `.v-field`, `.v-menu`, `.v-overlay__content`, `.v-snackbar__wrapper`, `.v-switch` |
| Tipografía | `$body-font-family` = Jakarta; `text-transform: none` y `letter-spacing: 0` en botones, overline y todo nivel. `body` a `--t-body`, `--lh-body` (gana a `body{font-size:15px!important}` de `@core`). Mapa: `.text-h1/.text-h2` Anybody 800 72% `--t-h2`; `.text-h3/.text-h4` Anybody 800 72% `--t-h2-compacto`; `.text-h5` Jakarta 700 `--t-h3`; `.text-h6` Jakarta 700 `--t-body`; `.text-body-1` `--t-body`; `.text-body-2`, `.text-caption`, `.text-overline` `--t-small`; `.text-subtitle-*` `--t-body` 600; `font-weight-black` → 800 + `tabular-nums`. `.text-medium-emphasis` → `color: var(--texto-2)` (sin opacidad) |
| Ripple y movimiento | `ripple: false` global; sin `transform: scale` en `:active`; transiciones de 160ms `--ease-out` en fondo y color |
| VCard | default `variant: 'flat'`, `rounded: 'xl'`; CSS: `--superficie`, `1px solid var(--linea)`, sin sombra |
| VBtn | default `variant: 'flat'`, `rounded: 'lg'`. Alto 48px (default), `small` 44px (compacto, `--t-small`, padding 16px), peso 700, `line-height 1.2`. `flat` primary: `--violeta` + `#fff`, hover `--violeta-tinta`. `tonal` y `outlined` → **botón de marco** (§8.1): `--superficie`, `1px solid var(--linea)`, texto en `--texto` (o `--error` si es color error), peso 600. `text` sin ícono → **discreto** (§8.1): `--enlace`, subrayado 1px a 0.2em, 2px en hover. Botones de ícono: sin subrayado, 44×44 |
| Campos | `.v-field` outlined: borde 1px `--borde-control`, radio 12px, mínimo 48px, fondo `--superficie`; enfocado: borde no se engrosa, anillo 3px `--foco` a 3px sobre `.v-field`; error: borde y mensaje `--error` |
| VAlert | `--superficie`, `1px solid var(--linea)`, `--r-control`, padding `--s-4`, texto `--texto`, ícono `--acento`; color error → borde y ícono `--error`. Sin rellenos de color (§15) |
| VChip | neutro (§15): `1px solid var(--linea)`, `--texto-2`, `--t-small` 700, `--r-control`, sin relleno. Excepción: `.chip-premio` (§8.8) para «a canjear / premio listo» |
| VAvatar tonal | fondo `--violeta-suave`, texto `--texto` 800, radio 12px |
| VDialog | `--superficie`, `1px solid var(--linea)`, `--r-superficie`, sin sombra, velo `--velo` |
| VSnackbar | D10 |
| VSkeletonLoader | estático (sin brillo animado), huesos en `--linea` |
| VProgressLinear | pista `--linea`, relleno `--acento` (o el color de la tarjeta si se pasa) |
| VSwitch / VCheckbox | `accent-color`/color `--acento`; sin sombra en el pulgar |
| VTabs / VBtnToggle | control segmentado (§8.4): marco `1px --linea`, padding 4px, fondo `--superficie`; ficha elegida en sólido `--violeta` + `#fff` |
| VList | separadores `--linea`, sin sombra |

### 1.4 Lógica de la tarjeta (pura)
- `src/components/stampCard/stampCard.ts`: portar de `repitt-web/src/components/islands/stampCard.ts` (estado, columnas, ángulos `STAMP_ANGLES`, «N de M», plural, inicial), adaptado a `cycle.status` (`open | completed | redeemed`). Más `progressLabel` para todo «N de M» de la app.
- `src/components/stampCard/stampCard.spec.ts`: portar las pruebas puras (vitest).

### 1.5 Catálogo
- `src/pages/estilo.vue`, **solo en desarrollo** (`definePage({ meta: { public: true } })` y redirige a `/` si `!import.meta.env.DEV`), layout `blank`. Muestra: tipografía, botones (todas las variantes y tamaños), campos (reposo, error, deshabilitado), alertas, chips, avatar, diálogo abierto, snackbar, skeleton, progreso, pestañas/toggle, `.section-label`, panel, banda tonal y noche, y la tarjeta de sellos (fase 2). Datos de ejemplo de la guía §10.5: «Café Luna», «Café gratis», «Un americano», 8 sellos, violeta, ícono Café.

## Fase 2 — En paralelo (archivos disjuntos)

### 2A Tarjeta de sellos completa
- `src/components/stampCard/StampCard.vue`: portar `repitt-web/src/components/islands/StampCard.vue` **sin la demo** (sin `interactive`, intro, CTA, botón de sellar, `astro-island`). Props: `businessName`, `cardName`, `reward`, `requiredStamps`, `stamps`, `color`, `status` (`open|completed|redeemed`), `iconUrl?`, `iconName?` (preset), `logoUrl?` (avatar con logo, si no inicial), `newStamp?` (índice que entra con `stamp-ink`), `flat?` (sin sombra). Estados: en curso, completa (chip «Premio listo» + anillo `--canje`, pulso solo si `newStamp` completa) y **canjeada estática** (talón con «Canjeado» en chip neutro). Más de 12 sellos: barra de 8px. Íconos según D4.
- Usarla en: `MeCardDetailView.vue` (detalle del ciclo del visitante, reemplaza la cabecera + card de sellos), `CardDetails.vue` (dueño; sellos de muestra con `previewStamps`), `CardForm.vue` (vista previa del editor en lugar de `CardListItem`, con el preset/archivo/url elegido), `pages/empresa/ciclos/[cycleId].vue` y `CounterSuccessScreen.vue` (D5: `.section--night` a pantalla completa, sin degradado ni pulso infinito, botón inverso).
- Agregar la sección de la tarjeta al catálogo `/estilo`: los 3 estados, >12 sellos, los 10 colores, claro/oscuro.

### 2B Filas planas de tarjeta
- `StampProgress.vue`: sellos con máscara de tinta, ángulos de `stampCard.ts`, ícono por D4, vacíos `2px dotted color-mix(--c 35%)`, barra de 8px desde 13.
- `StampCardListItem.vue`, `CardListItem.vue`, `PublicCardItem.vue`, `CustomerCardCycles.vue`, `UserStampCardWaitingRedeemListAsCompany.vue`: sin degradados ni halos; separador `--linea`; el color de la tarjeta solo en sellos, filete `3px` del lado inicial y avatar; «N de M»; chip `.chip-premio` cuando hay premio listo.

### 2C Layouts y pantallas sin sesión
- `layouts/company.vue` y `layouts/visitor.vue`: barra inferior sin sombra (solo borde `--linea`), etiquetas sin `letter-spacing`, FAB violeta plano sin degradado ni brillo (puede seguir sobresaliendo; sin animación de elevación). Barra superior con `--cabecera-fondo` + blur + borde `--linea`.
- `components/auth/**`, `components/general/**`, `ErrorHeader.vue`, `AppLoadingIndicator.vue`, `pages/auth/**`, `pages/[...error].vue`, `privacidad.vue`, `reset-password.vue`, `verify-email.vue`, `cuenta-suspendida.vue`, `pages/empresa/seleccionar.vue`, `pages/empresa/crear.vue`: fondos planos (`--fondo`), sin degradados; el héroe de `AuthHeroLayout` como contexto noche plano o banda tonal; titulares en Anybody (`.titulo-display`) y alineados a la izquierda.

### 2D Pantallas del negocio
- `pages/empresa/**` (salvo `seleccionar`, `crear`, `ciclos/[cycleId]`) y `components/{business,businesses,billing,cards,counter,crm,visits}/**` (salvo los archivos de 2A/2B).
- Borrar las reglas locales `.section-label` (y variantes `.card-form-label`, `.counter-section-label`, `.sel-section-label`, `.section-label-sm`) y usar la global. Quitar degradados, sombras, `uppercase`, `letter-spacing`, `monospace`, hex sueltos (usar tokens o `rgb(var(--v-theme-*))`). «N/M» → `progressLabel`. Cifras protagonistas con `.cifra`. Gráfica: una serie en `--enlace` (leer el valor resuelto del token; ApexCharts necesita literal).

### 2E Pantallas del cliente
- `pages/visitante/**` (salvo `MeCardDetailView` que es 2A) y `components/{visitor,users,stampCards,common}/**` (salvo archivos de 2A/2B). Mismas reglas que 2D. `UserQrCard`: cabecera violeta plana (`--violeta` + `#fff`), sin degradado ni sombra; el QR sobre `#fff` fijo. Página pública del negocio: héroe en banda tonal con tapete de puntos, sin degradado del color de la tarjeta.

### Reglas para todas las tareas
- Ningún color, tamaño de letra, radio, sombra ni curva suelto: tokens (`var(--…)`) o props de Vuetify ya re-tematizadas. Geometría de pieza permitida (guía §1).
- `box-shadow` solo `none`, `var(--tarjeta-sombra)` o `var(--tarjeta-brillo)` (y solo en la tarjeta de sellos). Sin `linear-gradient`, `text-transform: uppercase`, `letter-spacing`, `font-style: italic` ni `monospace`.
- Hover solo cambia color o grosor. Nada se anima solo (salvo el golpe de tinta y el anillo de la tarjeta al sellar).
- Alineación a la izquierda; no cambiar flujos, datos, rutas ni textos (salvo D2).
- CSS con propiedades lógicas y orden idiomático (stylelint del repo).

## Fase 3 — Verificación
- `pnpm lint`, `pnpm typecheck` (los errores de `src/@core` y `src/@layouts` son de la plantilla), `pnpm test`, `pnpm build`.
- Búsqueda en `src/` (sin `@core`/`@layouts`): 0 `linear-gradient`, 0 `uppercase`, 0 `letter-spacing`, `box-shadow` solo los permitidos.
- **QA ligero con capturas** (Chrome por CDP con `repitt-web/scripts/lib/chrome.mjs`): `/estilo`, `/auth/login`, `/auth/registro`, `/privacidad` y la 404, a 375 y 1280, en claro y oscuro. Revisar a ojo y corregir lo evidente.

## Deuda que queda documentada
- Glosario y CTAs de la guía §10 (D2).
- Anatomía de campos de la guía §8.3 (D9).
- Fuentes autohospedadas y precarga (D7).
- Prueba automática de igualdad de tokens contra §13.1 y lint de literales.
- Matriz completa de capturas, axe y Lighthouse.
