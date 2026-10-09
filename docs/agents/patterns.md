# Patrones de código

Patrones recurrentes en el proyecto que los agentes deben conocer y seguir.

> **Estilo visual (2026-10-08):** la app sigue la guía de estilo de la landing (ver «Tema visual» en `AGENTS.md`). Los patrones visuales que aparecen abajo **ya no aplican**: degradados, sombras de color, pantallas de éxito con degradado, etiquetas en mayúsculas y `letter-spacing`. Usa los tokens de `src/styles/tokens.css` y las utilidades de `src/styles/base.scss`.

---

<!-- Formato sugerido:
## [Nombre del patrón]
**Dónde se usa:** archivos o contextos
**Ejemplo:**
```vue
<!-- código -->
```
-->

## Llamada a la API v1
**Dónde se usa:** toda la app. Las funciones viven en `src/api/endpoints/*` y están tipadas desde el contrato.

```ts
import { cardsApi } from '@/api'
import { useBusinessStore } from '@/stores/business'

const business = useBusinessStore()
const cards = await cardsApi.listCards(business.activeId!, 'published') // StampCardDto[]
```

Reglas:
- Nunca `axios` directo ni tipos de API escritos a mano (`@/api/types`).
- Las funciones ya devuelven `data`; las listas paginadas devuelven `{ data, page }` (usar `useCursorList`).
- Una operación nueva: agregar una función en `src/api/endpoints/` con `request('get', '/v1/...')`; el tipo de retorno se infiere solo.

## Patrón nativo de feedback con `useApiError`
**Dónde se usa:** todas las páginas (Swal está prohibido).

```ts
const { error, fieldErrors, capture, reset } = useApiError()
const isLoading = ref(false)

async function onSubmit() {
  reset()
  isLoading.value = true
  try {
    await businessesApi.updateBusiness(business.activeId!, form)
    snackbar.value = true
  }
  catch (e) {
    const { error: err } = capture(e)
    if (err.code === 'RULES_LOCKED') lockRules()
  }
  finally {
    isLoading.value = false
  }
}
```

```vue
<ApiErrorAlert :error="error" />
<AppTextField v-model="form.name" :error-messages="fieldErrors.name" />
<VBtn :loading="isLoading" @click="onSubmit">Guardar</VBtn>
```

## Placeholder de imagen con VProgressCircular
**Dónde se usa:** QR codes en `UserQrCard.vue`, `visitante/tarjetas/[id].vue`

```vue
<VImg :src="qrUrl" :min-block-size="200">
  <template #placeholder>
    <div class="d-flex align-center justify-center fill-height">
      <VProgressCircular indeterminate color="primary" />
    </div>
  </template>
</VImg>
```

No se necesita estado `loading` manual — el slot `#placeholder` de VImg maneja el estado de carga automáticamente.

---

## VAvatar con fallback de inicial
**Dónde se usa:** `empresa/seleccionar.vue`, `visits/VisitListItemFull.vue`, cualquier lugar con logo de negocio

```vue
<VAvatar size="40" :image="business.logoPath || undefined">
  <span v-if="!business.logoPath">
    {{ business.name?.charAt(0)?.toUpperCase() }}
  </span>
</VAvatar>
```

Pasar `undefined` (no string vacío `""`) cuando no hay imagen, para que VAvatar muestre el slot por defecto.

---

## BusinessId desde el store del negocio activo
**Dónde se usa:** toda llamada `/v1/businesses/{businessId}/**`.

```ts
const business = useBusinessStore()
await crmApi.listCustomers(business.activeId!, { q })
```

Nunca tomarlo de la URL ni guardar `repittCode` como clave. Al cambiar de negocio (`business.select(id)`) las páginas deben recargar sus datos.

## Optional chaining en templates
**Dónde se usa:** todos los templates que consumen datos de API

```vue
{{ data?.business?.name ?? 'Sin nombre' }}
{{ visit?.customer?.firstName }} {{ visit?.customer?.lastName }}
```

Usar `?.` en toda cadena de acceso a propiedades de datos externos. Usar `?? 'fallback'` con texto significativo, no `'...'`.

---

## Selector de colores predefinidos (no color picker nativo)
**Dónde se usa:** `empresa/tarjetas/crear.vue` — campo `primaryColor`

El usuario no técnico se asusta con un color picker nativo (`<input type="color">`). En su lugar, usar una paleta de círculos clickeables con colores predefinidos.

```vue
<script setup>
const primaryColor = ref('#493599')
const PRESET_COLORS = [
  { hex: '#493599', label: 'Violeta' },
  { hex: '#E53935', label: 'Rojo' },
  // ... más colores
]
</script>

<template>
  <div class="d-flex flex-wrap gap-3">
    <div
      v-for="color in PRESET_COLORS"
      :key="color.hex"
      class="d-flex flex-column align-center gap-1"
      style="cursor: pointer;"
      @click="primaryColor = color.hex"
    >
      <div
        :style="{
          backgroundColor: color.hex,
          outline: primaryColor === color.hex ? `3px solid ${color.hex}` : '3px solid transparent',
          outlineOffset: '2px',
        }"
        style="border-radius: 50%; block-size: 36px; inline-size: 36px;"
      />
      <span class="text-xs text-medium-emphasis">{{ color.label }}</span>
    </div>
  </div>
</template>
```

El círculo seleccionado muestra un `outline` del mismo color (efecto "resaltado"). No usar `border` para el estado activo — evita el layout shift.

---

## Hero CTA card como acción principal (`HeroCTACard`)
**Dónde se usa:** `empresa/index.vue` (Registrar Visita). Componente en `src/components/general/HeroCTACard.vue`

La acción más frecuente del UX se presenta como card prominente de color `primary`, ancho completo, con ícono y descripción.

```vue
<HeroCTACard
  icon="tabler-qrcode"
  title="Registrar Visita"
  :subtitle="isActive ? 'Escanea el código QR de tu cliente' : 'Negocio inactivo'"
  to="/empresa/visitas/registrar"
  :disabled="!isActive"
/>
```

Props: `icon`, `title`, `subtitle`, `to` (ruta destino), `disabled` (opacity + cursor not-allowed, bloquea navegación).

---

## Quick Action Card en grid (`QuickActionCard`)
**Dónde se usa:** `empresa/index.vue`, `visitante/index.vue`. Componente en `src/components/general/QuickActionCard.vue`

Acciones secundarias en grid 2 columnas. El patrón canónico es definir el array en `<script setup>` y usar `v-for`:

```ts
const quickActions = [
  { icon: 'tabler-cards', label: 'Tarjetas', caption: 'De lealtad', to: '/empresa/tarjetas' },
  { icon: 'tabler-walk',  label: 'Visitas',  caption: 'Historial',  to: '/empresa/visitas'  },
]
```

```vue
<VRow dense>
  <VCol v-for="action in quickActions" :key="action.to" cols="6">
    <QuickActionCard v-bind="action" />
  </VCol>
</VRow>
```

Props: `icon`, `label`, `caption?`, `to`, `iconSize?` (default 32). Usa prop `to` de VCard → cursor pointer automático, sin `style="cursor: pointer"`.

---

## Layout custom en Vuexy (sin VerticalNavLayout)
**Dónde se usa:** `src/layouts/visitor.vue`

Para crear un layout que NO use el sidebar de Vuexy, modelarlo sobre `blank.vue` pero agregar top bar y bottom nav propios:

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const { injectSkinClasses } = useSkins()  // OBLIGATORIO para theming Vuexy
injectSkinClasses()

const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref<any>(null)
watch([isFallbackStateActive, refLoadingIndicator], () => { /* loading indicator */ }, { immediate: true })
</script>

<template>
  <div class="custom-layout">
    <AppLoadingIndicator ref="refLoadingIndicator" />
    <header class="custom-topbar">...</header>
    <main class="custom-main">
      <RouterView v-slot="{ Component }">
        <Suspense @fallback="isFallbackStateActive = true" @resolve="isFallbackStateActive = false">
          <Component :is="Component" />
        </Suspense>
      </RouterView>
    </main>
    <nav class="custom-bottom-nav">...</nav>
  </div>
</template>
```

Páginas usan el layout con: `definePage({ meta: { layout: 'visitor' } })`.

`injectSkinClasses()` y `AppLoadingIndicator` son obligatorios — sin ellos el theming y los loaders de Vuexy no funcionan.

---

## Bottom nav con FAB central elevado
**Dónde se usa:** `src/layouts/visitor.vue`

Patrón de 5 tabs donde el centro es un botón circular elevado (FAB):

```scss
.nav-fab-btn {
  inline-size: 54px;
  block-size: 54px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  transform: translateY(-14px);  // eleva sobre el nav bar
  box-shadow: 0 4px 18px rgba(var(--v-global-theme-primary), 0.45);

  &--active {
    transform: translateY(-18px);
    box-shadow: 0 6px 24px rgba(var(--v-global-theme-primary), 0.6);
  }
}
```

El `topbar-right` necesita `margin-inline-start: auto` para mantenerse siempre a la derecha, especialmente cuando el título central tiene `v-if` y puede no renderizarse.

---

## Gamificación en home visitante (nearestCard)
**Dónde se usa:** `src/pages/visitante/index.vue`

Muestra la tarjeta de sellos con mayor progreso (no completada, no canjeada):

```ts
const nearestCard = computed(() => {
  const active = stampCards.value.filter(
    (c: any) => c.isActive && !c.isCompleted && !c.isRewardRedeemed && c.stampCard?.requiredStamps,
  )
  if (!active.length) return null
  return active.sort(
    (a: any, b: any) =>
      (b.visitsCount / b.stampCard.requiredStamps) -
      (a.visitsCount / a.stampCard.requiredStamps),
  )[0]
})
```

Requiere llamar `getAllUserStampCardsByCurrentVisitor()` en el `onMounted` del home. Usar `Promise.allSettled` para no bloquear si una de las dos llamadas falla.

---

## Acceso al negocio desde el layout de visitante
**Dónde se usa:** `src/layouts/visitor.vue`

El botón «Ir a mi negocio» aparece cuando `useSessionStore().hasMemberships`; navega a `/empresa` y el guard decide si hace falta elegir negocio.

## Cámara lazy con QrcodeStream
**Dónde se usa:** `empresa/visitas/registrar.vue`

`QrcodeStream` inicializa la cámara al montarse, lo que bloquea la navegación y hace la página "pesada". La solución es montar el componente solo cuando el usuario lo pide explícitamente.

```ts
const cameraActive = ref(false)  // NO inicializar en true
const cameraReady = ref(false)

const activateCamera = () => {
  cameraReady.value = false
  cameraActive.value = true
}
```

```vue
<!-- Placeholder mientras la cámara está cerrada -->
<div v-if="!cameraActive" @click="activateCamera">...</div>

<!-- Cámara solo se monta al activar -->
<QrcodeStream v-else :paused="paused" @camera-on="onCameraOn" @detect="onDetect" @error="onError" />
```

La página carga instantáneamente. Nunca usar `location.reload()` para reiniciar — toggling `cameraActive` false → true reinicializa el componente.

---

## Pantalla de éxito fullscreen animada (reemplaza VSnackbar para acciones principales)
**Dónde se usa:** `empresa/visitas/registrar.vue` — después de registrar una visita

Cuando el resultado de una acción es muy importante para el usuario (cajero registrando una visita), un VSnackbar es demasiado discreto. Usar un VDialog fullscreen con gradiente y animaciones CSS puras:

```vue
<VDialog v-model="successDialog" fullscreen transition="dialog-bottom-transition" persistent>
  <div class="success-screen">
    <div class="success-icon-wrap">
      <div class="success-ring" />
      <VIcon icon="tabler-circle-check-filled" size="96" color="white" class="success-icon" />
    </div>
    <div class="text-h4 font-weight-black text-white">¡Visita registrada!</div>
    <div class="success-counter">
      <div class="text-h2 font-weight-black text-white">{{ progress.visitsCount }}</div>
      <div class="text-body-2 text-white" style="opacity: 0.8;">visitas acumuladas</div>
    </div>
    <VBtn block color="white" rounded="xl" size="x-large" @click="router.push('/empresa/')">
      <span class="text-primary font-weight-bold">¡Listo!</span>
    </VBtn>
  </div>
</VDialog>
```

Animaciones clave (en `<style lang="scss" scoped>`):
- `.success-icon-wrap`: `animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both`
- `.success-ring`: `animation: pulse-ring 1.8s ease-out 0.4s infinite` (aro pulsante)
- Textos/counter/btn: `animation: fade-up 0.5s ease Xs both` (staggered con delay)

---

## Fechas y tiempo relativo
**Dónde se usa:** listas de clientes, movimientos, actividad.

`@/utils/dates`: `formatInstant`, `formatDateTime`, `formatTime`, `formatLocalDate`, `todayInZone`, `timeAgo`. No instalar `date-fns` ni `dayjs`.

## Formateo de fechas ISO
Ver «Fechas y tiempo relativo». Las fechas del backend nunca se muestran crudas.
