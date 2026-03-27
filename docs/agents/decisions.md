# Decisiones de arquitectura

Decisiones técnicas tomadas durante el desarrollo y su justificación.

---

<!-- Formato sugerido:
## [Título de la decisión] — YYYY-MM-DD
**Contexto:** por qué surgió la necesidad
**Decisión:** qué se decidió hacer
**Por qué:** razón o trade-off
-->

## Migración a patrón REST `/businesses/:businessId/...` — 2026-03-21
**Contexto:** Los endpoints originales usaban rutas planas como `/company/visit`, `/company/stampcard/business/:id/active/logged-user`, `/company/metric/global`, etc. El backend NestJS fue refactorizado.
**Decisión:** Todos los endpoints autenticados de empresa ahora siguen el patrón `/businesses/:businessId/[recurso]`. El `businessId` se obtiene siempre de `companyStore.selectedCompany.id`.
**Por qué:** Patrón REST estándar, permite multi-tenant (empresa seleccionada como contexto), y es consistente con el backend nuevo.

---

## Separación AGENTS.md / CLAUDE.md / docs/agents/ — 2026-03-21
**Contexto:** Se necesitaba un sistema de contexto para múltiples agentes de IA (Claude, Cursor, Gemini, etc.) sin duplicar información.
**Decisión:** `AGENTS.md` contiene todo el contexto compartido. `CLAUDE.md` solo referencia a `AGENTS.md` y agrega instrucciones específicas de Claude Code si las hay. `docs/agents/` almacena conocimiento dinámico acumulado durante el desarrollo.
**Por qué:** Un solo source of truth para todos los agentes. El conocimiento acumulado en `docs/agents/` no contamina el contexto estático de `AGENTS.md`.

---

## `CompanyVisitListItemFull` con contexto dual — 2026-03-21
**Contexto:** El componente se usa en dos vistas: lista global de visitas de empresa (`/empresa/visitas`) y lista de visitas por tarjeta (`/empresa/tarjetas/:id/visitas`). En el primer caso no se conoce el `stampCardId` de antemano; en el segundo sí.
**Decisión:** Se agregó una prop opcional `stampCardId`. La navegación a la USC usa `const scId = props.stampCardId ?? visit?.stampCard?.id`.
**Por qué:** Evita duplicar el componente. El fallback `visit?.stampCard?.id` cubre el caso de vista global donde el stampCard viene en el payload de la visita.

---

## Extracción de componentes en páginas índice — 2026-03-22
**Contexto:** `empresa/index.vue` y `visitante/index.vue` tenían ~100 líneas de markup duplicado (4 action cards idénticas), dialogs inline de 80+ líneas, `goToPage` wrappers innecesarios, `<p>` dentro de VCardText, y `style="cursor: pointer"` esparcidos.
**Decisión:** Extraer a componentes reutilizables: `QuickActionCard.vue` y `HeroCTACard.vue` en `general/`, `CambiarPerfilDialog.vue` en `empresa/`. Usar prop `to` de Vuetify en lugar de `@click + router.push`. Inline styles decorativos → `<style scoped>`. Consolidar `onBeforeMount` + `onMounted` en un solo `onMounted` con return guard.
**Por qué:** Reducción de duplicación, mejor mantenibilidad, y alineación con los patrones Vuetify (prop `to` activa `.v-card--link` con cursor y ripple automáticos).

---

## Layout separado para visitantes (`visitor.vue`) — 2026-03-22
**Contexto:** Vuexy usa un sidebar de navegación diseñado para desktop/admin. Para la sección `/visitante`, que es consumer-facing y mobile-first, ese patrón es incorrecto en UX.
**Decisión:** Crear `src/layouts/visitor.vue` — layout completamente custom sin usar `VerticalNavLayout` de Vuexy. Tiene top bar fijo, contenedor de contenido con padding para el nav, y bottom navigation bar con FAB central para el QR. Todas las páginas `/visitante/*` usan `meta: { layout: 'visitor' }`.
**Por qué:** Bottom nav es el patrón nativo de apps consumer en móvil (Instagram, Rappi, etc.). El sidebar admin no comunica "app de recompensas". La sección `/empresa` mantiene el sidebar porque es una herramienta de gestión donde el patrón admin sí aplica.

---

## Rediseño visual: tipografía y color primario — 2026-03-22
**Contexto:** Vuexy por defecto usa Inter + primary `#493599`. El proyecto necesita personalidad más cálida y accesible para un app de fidelización de negocios de barrio.
**Decisión:** Font global cambiado a **Plus Jakarta Sans** (webfontloader.ts + override CSS `* { font-family }`). Primary cambiado a `#6C3CE1` (más vívido y saturado). `primary-darken-1` → `#5328B8`. Background light → `#F7F6FE` (tinte lavanda sutil).
**Por qué:** Plus Jakarta Sans tiene pesos bold más expresivos que Inter, se lee bien en pantallas pequeñas, y tiene carácter más cálido. El morado más saturado comunica más energía sin perder la identidad de marca.

---

## Layout `company.vue` para sección empresa — 2026-03-23
**Contexto:** La sección `/empresa/*` usaba el layout default de Vuexy (sidebar admin). Con el rediseño mobile-first, el sidebar es incorrecto para una app de gestión de negocio en móvil.
**Decisión:** Crear `src/layouts/company.vue` con top bar fija + bottom nav con FAB central "Registrar visita". Todas las páginas empresa usan `meta: { layout: 'company' }` excepto `seleccionar.vue` (usa `blank`).
**Por qué:** Coherencia con el patrón mobile-first. El FAB central como acción principal (registrar visita) es el núcleo del flujo de negocio.

---

## Eliminar SweetAlert2 — 2026-03-23
**Contexto:** Toda la app usaba Swal para loading, errores, confirmaciones y éxito. En móvil, los popups de Swal rompen el feel nativo de la app.
**Decisión:** Prohibir Swal en todo código nuevo y migrar páginas existentes. Reemplazos: `isLoading` ref en VBtn (loading), VAlert inline (errores), VDialog (confirmaciones), VSnackbar (éxito toast).
**Por qué:** La UX nativa con componentes Vuetify es más consistente, más rápida (no importa librería externa) y visualmente integrada con el tema.

---

## Cámara lazy en `/empresa/visitas/registrar` — 2026-03-23
**Contexto:** La página de registrar visita tardaba en responder al navegar hacia ella, y a veces no registraba el tap desde el menú anterior.
**Decisión:** `QrcodeStream` se monta con `v-if="cameraActive"` en lugar de siempre. La cámara solo inicializa cuando el usuario toca "Escanear QR" explícitamente.
**Por qué:** La inicialización del hardware de cámara es bloqueante. Al hacerla lazy, la página carga instantáneamente y la percepción de rendimiento mejora drásticamente.

---

## Suscripción movida a `companyStore` (per-business) — 2026-03-26
**Contexto:** El backend cambió el modelo de suscripción de user-level a business-level. Cada negocio tiene su propia suscripción en Stripe. El endpoint `/subscriptions/me` fue eliminado y reemplazado por `/subscriptions/business/:businessId`.
**Decisión:**
- `SubscriptionData` interface + estado `businessSubscription` movidos a `companyStore`
- Getters `isSubscribed` e `isPastDue` viven en `companyStore` (no en `authStore`)
- `authStore` queda solo con token, rol y datos de usuario — sin subscription
- `setBusinessSubscription(data)` es la única forma de actualizar la sub en el store
- Al entrar a `/empresa` y `/empresa/planes`, se llama `getSubscriptionStatus(businessId)` y se guarda en `companyStore`
- `afterRestore` del `authStore` limpia el campo `authSubscription` del localStorage si existe (migración de sesiones viejas)
**Por qué:** La sub está atada al negocio, no al usuario. Si un owner tiene múltiples negocios, cada uno tiene su propia sub. Guardarla en `companyStore` es el lugar natural dado que ese store ya maneja el contexto del negocio activo.

---

## Eliminación de `getAllSegments` — 2026-03-21
**Contexto:** `src/services/utils/utils.ts` exportaba `getAllSegments` (GET `/utils/segments`) pero ningún componente la importaba.
**Decisión:** Función eliminada. El archivo solo exporta `refreshUserData`.
**Por qué:** Código muerto. El endpoint de segmentos no está en uso en la UI actual.
