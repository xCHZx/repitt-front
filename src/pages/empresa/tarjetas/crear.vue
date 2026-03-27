<script lang="ts" setup>
import { createStampCardAsCompany, uploadStampCardIcon } from '@/services/company/stampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const router = useRouter()
const companyStore = useCompanyStore()

const name = ref('')
const description = ref('')
const requiredStamps = ref(5)
const requiredHours = ref(1)
const startDate = ref(new Date().toISOString())
const endDate = ref('')
const reward = ref('')
const allowedRepeats = ref(1)
const primaryColor = ref('#493599')

const PRESET_COLORS = [
  { hex: '#493599', label: 'Violeta' },
  { hex: '#E53935', label: 'Rojo' },
  { hex: '#F57C00', label: 'Naranja' },
  { hex: '#FDD835', label: 'Amarillo' },
  { hex: '#43A047', label: 'Verde' },
  { hex: '#00897B', label: 'Teal' },
  { hex: '#1E88E5', label: 'Azul' },
  { hex: '#8E24AA', label: 'Púrpura' },
  { hex: '#D81B60', label: 'Rosa' },
  { hex: '#6D4C41', label: 'Café' },
]

// --- Selector de ícono ---
const iconDialogOpen = ref(false)
const stampIcon = ref<File[]>()
const selectedIconName = ref<string | null>(null)
const customFilePreview = ref<string | null>(null)

const SVG_WRAPPER = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#493599" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`

const PRESET_ICONS = [
  { name: 'star', label: 'Estrella', icon: 'tabler-star', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>' },
  { name: 'heart', label: 'Corazón', icon: 'tabler-heart', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566"/>' },
  { name: 'crown', label: 'Corona', icon: 'tabler-crown', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"/>' },
  { name: 'trophy', label: 'Trofeo', icon: 'tabler-trophy', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 21l8 0"/><path d="M12 17l0 4"/><path d="M7 4l10 0"/><path d="M17 4v8a5 5 0 0 1 -10 0v-8"/><path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>' },
  { name: 'gift', label: 'Regalo', icon: 'tabler-gift', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"/><path d="M12 8l0 13"/><path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"/>' },
  { name: 'bolt', label: 'Rayo', icon: 'tabler-bolt', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"/>' },
  { name: 'flame', label: 'Llama', icon: 'tabler-flame', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z"/>' },
  { name: 'diamond', label: 'Diamante', icon: 'tabler-diamond', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5"/>' },
  { name: 'coffee', label: 'Café', icon: 'tabler-coffee', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1"/><path d="M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2"/><path d="M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2"/><path d="M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z"/><path d="M16.746 16.726a3 3 0 1 0 .252 -5.555"/>' },
  { name: 'pizza', label: 'Pizza', icon: 'tabler-pizza', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 21.5c-3.04 0 -5.952 -1.657 -7.75 -4.5h15.5c-1.798 2.843 -4.71 4.5 -7.75 4.5z"/><path d="M12 3l9 17.1h-18z"/><path d="M9 12l1.5 1.5"/><path d="M13.5 10l1.5 1.5"/>' },
  { name: 'mood-smile', label: 'Sonrisa', icon: 'tabler-mood-smile', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 10l.01 0"/><path d="M15 10l.01 0"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/>' },
  { name: 'thumb-up', label: 'Me gusta', icon: 'tabler-thumb-up', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"/>' },
]

const selectPresetIcon = (preset: typeof PRESET_ICONS[0]) => {
  const svg = SVG_WRAPPER(preset.body)
  const blob = new Blob([svg], { type: 'image/svg+xml' })

  stampIcon.value = [new File([blob], `${preset.name}.svg`, { type: 'image/svg+xml' })]
  selectedIconName.value = preset.name
  customFilePreview.value = null
  iconDialogOpen.value = false
}

const onCustomFileChange = (files: File[]) => {
  if (!files?.length)
    return

  selectedIconName.value = null
  customFilePreview.value = URL.createObjectURL(files[0])
  iconDialogOpen.value = false
}

const iconPreviewSrc = computed(() => {
  if (customFilePreview.value) return customFilePreview.value
  if (selectedIconName.value) {
    const preset = PRESET_ICONS.find(i => i.name === selectedIconName.value)
    if (preset) {
      const svg = SVG_WRAPPER(preset.body)
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    }
  }
  return null
})
// -------------------------

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const submit = async () => {
  const businessId = companyStore.selectedCompany.id

  const payload = {
    name: name.value,
    description: description.value,
    requiredStamps: requiredStamps.value,
    requiredHours: requiredHours.value,
    startDate: startDate.value,
    endDate: endDate.value || undefined,
    reward: reward.value,
    allowedRepeats: allowedRepeats.value,
    primaryColor: primaryColor.value,
  }

  submitError.value = null
  isSubmitting.value = true
  try {
    const newStampCard = await createStampCardAsCompany(businessId, payload)

    if (stampIcon.value && stampIcon.value.length > 0)
      await uploadStampCardIcon(businessId, newStampCard.id, stampIcon.value[0])

    router.push('/empresa/tarjetas')
  }
  catch (e: any) {
    submitError.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <VForm @submit.prevent="submit">
    <!-- Live preview -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-eye"
        size="15"
      />
      Vista previa
    </div>
    <StampCardListItemAsBusiness
      :name="name || 'Nombre de la tarjeta'"
      :reward="reward || 'Tu recompensa aquí'"
      :required-stamps="requiredStamps"
      :stamp-icon="iconPreviewSrc"
      :primary-color="primaryColor"
      :is-active="true"
      class="mb-6"
    />

    <!-- Básico -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-forms"
        size="15"
      />
      Básico
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VCardText class="pa-4 d-flex flex-column gap-4">
        <VTextField
          v-model="name"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-cards"
          label="Nombre de la tarjeta"
          placeholder="Ej: Café Fidelidad"
          hide-details
        />
        <VTextField
          v-model="reward"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-gift"
          label="Recompensa"
          placeholder="Ej: Café gratis"
          hide-details
        />
        <VTextField
          v-model="description"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-text-plus"
          label="Descripción"
          placeholder="Ej: Acumulá 10 cafés y el 11 es gratis"
          hide-details
        />
      </VCardText>
    </VCard>

    <!-- Configuración -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-settings"
        size="15"
      />
      Configuración
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VCardText class="pa-4">
        <!-- Visitas requeridas -->
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-body-2 font-weight-medium">Visitas para completar</span>
          <VChip
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ requiredStamps }} sellos
          </VChip>
        </div>
        <!-- Dots preview -->
        <div
          v-if="requiredStamps <= 12"
          class="dots-preview mb-2"
        >
          <div
            v-for="i in requiredStamps"
            :key="i"
            class="dot-mini"
            :style="{ background: `${primaryColor}25`, borderColor: primaryColor }"
          />
        </div>
        <VSlider
          v-model="requiredStamps"
          min="3"
          max="20"
          step="1"
          thumb-label
          thumb-size="20"
          :color="primaryColor"
          hide-details
          class="mb-5"
        />

        <VDivider class="mb-5" />

        <!-- Horas entre visitas -->
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-body-2 font-weight-medium">Horas mínimas entre visitas</span>
          <VChip
            size="small"
            color="info"
            variant="tonal"
          >
            {{ requiredHours }}h
          </VChip>
        </div>
        <div class="text-caption text-medium-emphasis mb-2">
          Evita que el mismo cliente acumule dos visitas seguidas
        </div>
        <VSlider
          v-model="requiredHours"
          min="1"
          max="24"
          step="1"
          thumb-label
          thumb-size="20"
          color="info"
          hide-details
          class="mb-5"
        />

        <VDivider class="mb-5" />

        <!-- Canjes -->
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-body-2 font-weight-medium">Canjes por cliente</span>
          <VChip
            size="small"
            color="success"
            variant="tonal"
          >
            {{ allowedRepeats === 1 ? '1 vez' : `${allowedRepeats} veces` }}
          </VChip>
        </div>
        <div class="text-caption text-medium-emphasis mb-2">
          Cuántas veces puede completar y canjear esta tarjeta cada cliente
        </div>
        <VSlider
          v-model="allowedRepeats"
          min="1"
          max="10"
          step="1"
          thumb-label
          thumb-size="20"
          color="success"
          hide-details
        />

      </VCardText>
    </VCard>

    <!-- Apariencia -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-palette"
        size="15"
      />
      Apariencia
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VCardText class="pa-4">
        <!-- Color -->
        <div class="text-body-2 font-weight-medium mb-3">
          Color de la tarjeta
        </div>
        <div class="d-flex flex-wrap gap-3 mb-5">
          <div
            v-for="color in PRESET_COLORS"
            :key="color.hex"
            class="color-swatch"
            :style="{
              background: color.hex,
              outline: primaryColor === color.hex ? `3px solid ${color.hex}` : '3px solid transparent',
              outlineOffset: '2px',
            }"
            @click="primaryColor = color.hex"
          />
        </div>

        <VDivider class="mb-4" />

        <!-- Ícono -->
        <div class="text-body-2 font-weight-medium mb-3">
          Ícono del sello
        </div>
        <div class="d-flex align-center gap-4">
          <VAvatar
            rounded="lg"
            size="56"
            :style="{ background: `${primaryColor}20` }"
          >
            <VImg
              v-if="iconPreviewSrc"
              :src="iconPreviewSrc"
              :width="32"
              :height="32"
            />
            <VIcon
              v-else
              icon="tabler-sticker"
              size="28"
              :style="{ color: primaryColor }"
            />
          </VAvatar>
          <div>
            <div class="text-caption text-medium-emphasis mb-1">
              {{ selectedIconName
                ? PRESET_ICONS.find(i => i.name === selectedIconName)?.label
                : customFilePreview ? 'Archivo personalizado' : 'Sin ícono seleccionado' }}
            </div>
            <VBtn
              variant="tonal"
              size="small"
              rounded="xl"
              prepend-icon="tabler-edit"
              @click="iconDialogOpen = true"
            >
              Elegir ícono
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Vigencia -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-calendar"
        size="15"
      />
      Vigencia
    </div>
    <VCard
      rounded="xl"
      class="mb-6"
    >
      <VCardText class="pa-4 d-flex flex-column gap-4">
        <AppDateTimePicker
          v-model="startDate"
          label="Fecha de inicio"
          placeholder="Fecha de inicio"
          prepend-inner-icon="tabler-calendar"
        />
        <AppDateTimePicker
          v-model="endDate"
          label="Fecha de fin (opcional)"
          placeholder="Sin fecha de fin"
          prepend-inner-icon="tabler-calendar-off"
        />
      </VCardText>
    </VCard>

    <!-- Error -->
    <VAlert
      v-if="submitError"
      color="error"
      variant="tonal"
      rounded="xl"
      density="compact"
      icon="tabler-alert-triangle"
      class="mb-4"
    >
      {{ submitError }}
    </VAlert>

    <!-- Submit -->
    <VBtn
      type="submit"
      block
      size="large"
      :loading="isSubmitting"
      :style="{ background: primaryColor }"
    >
      Crear tarjeta
    </VBtn>
  </VForm>

  <!-- Dialog selector de ícono -->
  <VDialog
    v-model="iconDialogOpen"
    max-width="480"
  >
    <VCard rounded="xl">
      <VCardItem>
        <VCardTitle>Ícono del sello</VCardTitle>
        <template #append>
          <VBtn
            icon
            variant="plain"
            @click="iconDialogOpen = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </template>
      </VCardItem>
      <VCardText>
        <div class="text-caption text-medium-emphasis mb-3">
          Íconos predefinidos
        </div>
        <VRow>
          <VCol
            v-for="preset in PRESET_ICONS"
            :key="preset.name"
            cols="3"
            class="pa-1"
          >
            <VCard
              :variant="selectedIconName === preset.name ? 'tonal' : 'outlined'"
              :color="selectedIconName === preset.name ? 'primary' : undefined"
              class="d-flex flex-column align-center justify-center pa-2 cursor-pointer"
              height="72"
              rounded="lg"
              @click="selectPresetIcon(preset)"
            >
              <VIcon
                :icon="preset.icon"
                size="28"
              />
              <span class="text-xs mt-1">{{ preset.label }}</span>
            </VCard>
          </VCol>
        </VRow>
        <VDivider class="my-4" />
        <div class="text-caption text-medium-emphasis mb-2">
          O sube tu propio ícono
        </div>
        <VFileInput
          v-model="stampIcon"
          variant="outlined"
          density="compact"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
          label="PNG, JPG, GIF, WebP o SVG (máx. 2MB)"
          prepend-icon="tabler-upload"
          hide-details
          @update:model-value="onCustomFileChange"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.color-swatch {
  border-radius: 50%;
  block-size: 36px;
  cursor: pointer;
  inline-size: 36px;
  transition: outline 0.15s ease;
}

.dots-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-block-end: 4px;
}

.dot-mini {
  border: 2px solid;
  border-radius: 50%;
  block-size: 20px;
  inline-size: 20px;
}
</style>
