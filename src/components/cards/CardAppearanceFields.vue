<!-- Card color (preset swatches) and stamp icon. The icon can always change, even with locked rules. -->
<script setup lang="ts">
import CardIconDialog from './CardIconDialog.vue'
import { iconChoicePreview, presetLabel } from './cardIcons'
import type { IconChoice } from './cardIcons'
import { PRESET_COLORS, tint } from './cardMeta'

const props = defineProps<{
  existingIconUrl?: string | null
  colorError?: string
}>()

const color = defineModel<string>('color', { required: true })
const icon = defineModel<IconChoice | null>('icon', { required: true })

const dialogOpen = ref(false)

const isPreset = (hex: string) => PRESET_COLORS.some(p => p.hex === hex.toUpperCase())

// A card saved with a color outside the palette (e.g. the V2 default #493599) keeps it as an
// extra swatch, so it can be chosen again after tapping another color.
const customColor = ref<string | null>(null)

watch(color, value => {
  if (value && !isPreset(value))
    customColor.value = value
}, { immediate: true })

const swatches = computed(() => customColor.value
  ? [...PRESET_COLORS, { hex: customColor.value, label: 'Color actual' }]
  : PRESET_COLORS)

// Release the blob URL of a custom icon when it is replaced, undone or the form goes away.
function revokePreview(choice: IconChoice | null | undefined) {
  if (choice?.kind === 'file')
    URL.revokeObjectURL(choice.previewUrl)
}

watch(icon, (_, old) => revokePreview(old))
onBeforeUnmount(() => revokePreview(icon.value))

const previewSrc = computed(() => iconChoicePreview(icon.value, color.value) ?? props.existingIconUrl ?? null)

const iconLabel = computed(() => {
  if (icon.value?.kind === 'preset')
    return presetLabel(icon.value.name)
  if (icon.value?.kind === 'file')
    return 'Archivo personalizado'

  return props.existingIconUrl ? 'Ícono actual' : 'Sin ícono seleccionado'
})
</script>

<template>
  <div>
    <VCard rounded="xl">
      <VCardText class="pa-4">
        <div class="text-body-2 font-weight-medium mb-3">
          Color de la tarjeta
        </div>
        <div class="d-flex flex-wrap gap-3 mb-2">
          <button
            v-for="preset in swatches"
            :key="preset.hex"
            type="button"
            class="color-swatch"
            :aria-label="preset.label"
            :aria-pressed="color.toUpperCase() === preset.hex.toUpperCase()"
            :style="{
              background: preset.hex,
              outline: color.toUpperCase() === preset.hex.toUpperCase() ? `3px solid ${preset.hex}` : '3px solid transparent',
              outlineOffset: '2px',
            }"
            @click="color = preset.hex"
          />
        </div>
        <div
          v-if="props.colorError"
          class="text-caption text-error mb-2"
        >
          {{ props.colorError }}
        </div>

        <VDivider class="my-4" />

        <div class="text-body-2 font-weight-medium mb-3">
          Ícono del sello
        </div>
        <div class="d-flex align-center gap-4">
          <VAvatar
            rounded="lg"
            size="56"
            :style="{ background: tint(color, '20') }"
          >
            <VImg
              v-if="previewSrc"
              :src="previewSrc"
              :width="32"
              :height="32"
            />
            <VIcon
              v-else
              icon="tabler-sticker"
              size="28"
              :style="{ color: tint(color, '') }"
            />
          </VAvatar>
          <div>
            <div class="text-caption text-medium-emphasis mb-1">
              {{ iconLabel }}
            </div>
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                variant="tonal"
                size="small"
                rounded="xl"
                prepend-icon="tabler-edit"
                @click="dialogOpen = true"
              >
                Elegir ícono
              </VBtn>
              <VBtn
                v-if="icon"
                variant="text"
                size="small"
                rounded="xl"
                @click="icon = null"
              >
                Deshacer
              </VBtn>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <CardIconDialog
      v-model="dialogOpen"
      :selected="icon"
      @select="icon = $event"
    />
  </div>
</template>

<style scoped>
.color-swatch {
  border: none;
  border-radius: 50%;
  block-size: 36px;
  cursor: pointer;
  inline-size: 36px;
  transition: outline 0.15s ease;
}
</style>
