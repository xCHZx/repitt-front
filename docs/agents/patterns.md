# Patrones de código

Patrones recurrentes en el proyecto que los agentes deben conocer y seguir.

---

<!-- Formato sugerido:
## [Nombre del patrón]
**Dónde se usa:** archivos o contextos
**Ejemplo:**
```vue
<!-- código -->
```
-->

## Patrón de servicio HTTP autenticado
**Dónde se usa:** todos los archivos en `src/services/company/`, `src/services/visitor/`, `src/services/auth/`

```ts
const getSomething = async (businessId: number) => {
  return await authAxios.get(`/businesses/${businessId}/resource`)
    .then(response => response.data)
    .catch(error => { throw error.response?.data?.message || error.message })
}
```

Reglas:
- Siempre usar `authAxios` (no `axios` directo) — inyecta JWT automáticamente.
- Siempre retornar `response.data` (no `response.data.data` salvo excepción documentada).
- El catch siempre relanza como string para que el componente pueda mostrar el mensaje en un Swal.

---

## Patrón nativo de feedback (reemplaza Swal por completo)
**Dónde se usa:** todas las páginas — Swal está prohibido, rompe el look nativo en móvil.

```ts
const isLoading = ref(false)
const error = ref<string | null>(null)
const snackbar = ref(false)

const onSubmit = async () => {
  error.value = null
  isLoading.value = true
  try {
    await someService()
    snackbar.value = true          // éxito → VSnackbar
    router.push('/destino')
  } catch (e: any) {
    error.value = Array.isArray(e) ? e.join('\n') : String(e)  // error → VAlert inline
  } finally {
    isLoading.value = false
  }
}
```

```vue
<!-- Error inline -->
<VAlert v-if="error" color="error" variant="tonal" rounded="lg" density="compact" icon="tabler-alert-triangle">
  {{ error }}
</VAlert>

<!-- Botón con loading -->
<VBtn :loading="isLoading" @click="onSubmit">Guardar</VBtn>

<!-- Confirmación destructiva → VDialog con botones Cancelar/Confirmar -->
<!-- Éxito toast -->
<VSnackbar v-model="snackbar" color="success" :timeout="2500" location="top" rounded="xl">
  Operación exitosa
</VSnackbar>
```

---

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

## BusinessId desde el store en endpoints de empresa
**Dónde se usa:** todos los servicios en `src/services/company/`

```ts
// En el componente/página:
import { useCompanyStore } from '@/stores/company'
const companyStore = useCompanyStore()

// Al llamar el servicio:
await getSomething(companyStore.selectedCompany.id, otroParam)
```

El `businessId` **siempre** viene de `companyStore.selectedCompany.id`. Nunca hardcodearlo ni tomarlo de la URL directamente.

---

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

## Extraer `.data` de `refreshUserData`
**Dónde se usa:** `empresa/index.vue`, cualquier componente que llame a `refreshUserData`

`refreshUserData` en `utils/utils.ts` retorna `response.data` = `{ role: "...", data: { ...usuario } }`. Para usar los campos del usuario directamente:

```ts
// ❌ Mal — user.value tendría { role, data: {...} }
user.value = await refreshUserData()

// ✅ Bien — user.value tendrá { id, firstName, repittCode, ... }
user.value = (await refreshUserData()).data
```

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

## Botón de cambio de rol en layout visitante
**Dónde se usa:** `src/layouts/visitor.vue` — topbar derecha

El botón de "Ir a mi negocio" solo se muestra cuando `authRole === 'Owner'` (usuario con ambos roles):

```vue
<VBtn
  v-if="authStore.authRole === 'Owner'"
  icon variant="text" size="small"
  to="/empresa/"
>
  <VIcon icon="tabler-building-store" size="20" />
</VBtn>
```

Ubicación: `topbar-right`, antes del `NavbarThemeSwitcher`. Invisible para visitantes puros.

---

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

## Formatter de código Repitt con computed getter/setter
**Dónde se usa:** `empresa/visitas/registrar.vue` — input manual de código de cliente o tarjeta

Formato: `XXX-XXX-XXX` (visitante, 11 chars) o `XXX-XXX-XXX-XXX` (tarjeta USC, 15 chars).

```ts
const qrCodeValue = ref('')

const formattedCode = computed({
  get: () => qrCodeValue.value,
  set: (value: string) => {
    const clean = value.replace(/[^a-z0-9]/gi, '').slice(0, 12)  // máx 4 grupos × 3
    const groups = clean.match(/.{1,3}/g) || []
    qrCodeValue.value = groups.join('-')
  },
})
```

```vue
<AppTextField v-model="formattedCode" maxlength="15" placeholder="abc-def-ghi" />
```

`maxlength="15"` bloquea el input nativo antes de que Vue procese el setter. El `codeType` computed detecta el tipo por longitud: 11 = visitante, 15 = tarjeta USC.

---

## `CambiarPerfilDialog` compartido entre empresa y visitante
**Dónde se usa:** `empresa/index.vue` y `visitante/index.vue`

El mismo dialog maneja el cambio de perfil de negocio desde ambas secciones. En visitante, solo se muestra si el usuario es Owner:

```vue
<!-- Solo visible para owners -->
<VBtn v-if="authStore.authRole === 'Owner'" @click="isProfileDialogVisible = true">
  Cambiar Perfil
</VBtn>
<CambiarPerfilDialog v-model="isProfileDialogVisible" :businesses="businesses" :user="userData" />
```

Los `businesses` se cargan condicionalmente en el `getData()` del home visitante:
```ts
if (authStore.authRole === 'Owner')
  requests.push(getAllBusinessesMe())
```

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

## `timeAgo` — tiempo relativo sin dependencias
**Dónde se usa:** `empresa/clientes/index.vue`, `empresa/clientes/[customerId].vue`

```ts
const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 2) return 'Hace un momento'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  const months = Math.floor(days / 30)
  return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`
}
```

No instalar `date-fns` ni `dayjs` — esta función cubre todos los casos de la app.

---

## Selector de país inline en campo de teléfono
**Dónde se usa:** `auth/login.vue`, `auth/registro/visitante.vue`, `empresa/visitas/registrar.vue`

`VSelect variant="plain"` dentro del slot `#prepend-inner` de `VTextField`:

```vue
<VTextField v-model="phoneNumber" type="tel" variant="outlined" class="phone-field">
  <template #prepend-inner>
    <VSelect v-model="countryCode" :items="COUNTRIES" item-value="dial"
      variant="plain" density="compact" hide-details class="country-select">
      <template #selection="{ item }">
        <span class="text-body-2">{{ item.raw.flag }} {{ item.raw.dial }}</span>
      </template>
      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps" :title="`${item.raw.flag} ${item.raw.name}`" :subtitle="item.raw.dial" />
      </template>
    </VSelect>
    <VDivider vertical class="mx-2 my-1" />
  </template>
</VTextField>
```

CSS **OBLIGATORIAMENTE** en bloque `<style>` global (no scoped) — los selectores `:deep()` no están permitidos en bloques scoped por el linter:

```css
.phone-field .v-field__prepend-inner { align-items: center; padding-inline-end: 0; }
.country-select .v-field__input { min-block-size: 0; padding-block: 0; padding-inline-start: 0; }
.country-select .v-select__selection { overflow: visible; margin-inline-end: 0; white-space: nowrap; }
```

CSS scoped solo para el tamaño: `.country-select { max-inline-size: 92px; min-inline-size: 92px; }`

Array de países: 21 países (MX, US, CO, AR, CL, PE, VE, EC, BO, PY, UY, BR, GT, HN, SV, NI, CR, PA, DO, CU, ES). Default `+52` (México).

---

## Formateo de fechas ISO
**Dónde se usa:** `UserStampCardWaitingRedeemListAsCompany.vue`, listas de visitas

```ts
const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
```

Las fechas del backend vienen en ISO 8601. Nunca mostrarlas crudas en la UI.
