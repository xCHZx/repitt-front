<!-- Card color (preset swatches) and stamp icon. The icon can always change, even with locked rules. -->
<script setup lang="ts">
import CardIconDialog from './CardIconDialog.vue'
import { iconChoicePreview, presetLabel } from './cardIcons'
import type { IconChoice } from './cardIcons'
import { PRESET_COLORS, tint } from './cardMeta'
import { stampInk } from '@/components/stampCard/stampCard'

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
            :class="{ 'color-swatch--selected': color.toUpperCase() === preset.hex.toUpperCase() }"
            :aria-label="preset.label"
            :aria-pressed="color.toUpperCase() === preset.hex.toUpperCase()"
            :style="{ '--c': preset.hex }"
            @click="color = preset.hex"
          >
            <svg
              v-if="color.toUpperCase() === preset.hex.toUpperCase()"
              class="color-swatch__check"
              :class="`color-swatch__check--${stampInk(preset.hex)}`"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12l5 5l10 -10" />
            </svg>
          </button>
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
            class="icon-preview"
            :style="{ '--c': tint(color, '') }"
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

<style lang="scss" scoped>
// Muestra de color: el color de la tarjeta (--c) es dato, no decoración. La elegida lleva un anillo
// de 3px de su color y un check; el foco de teclado lo pinta en --foco.
.color-swatch {
  display: grid;
  border: none;
  border-radius: 50%;
  background: var(--c);
  block-size: 36px;
  cursor: pointer;
  inline-size: 36px;
  outline: 3px solid transparent;
  outline-offset: 2px;
  place-items: center;
  transition: outline-color 160ms var(--ease-out);

  &--selected {
    outline-color: var(--c);
  }

  &:focus-visible {
    border-radius: 50%;
    outline-color: var(--foco);
  }
}

// El check es la señal de selección (guía §2.5): el outline del mismo color no llega a 3:1 con
// todos los colores. Va en papel o tinta, la de más contraste con la muestra (stampInk).
.color-swatch__check {
  block-size: 20px;
  inline-size: 20px;

  &--papel {
    color: var(--papel);
  }

  &--tinta {
    color: var(--tinta);
  }
}

// Vista previa del ícono: sello tonal del color de la tarjeta (guía §8.9, D4). El ícono se mezcla
// con --texto para que se lea también con colores claros (amarillo) y en oscuro.
.icon-preview {
  background: color-mix(in srgb, var(--c) 16%, transparent);
  color: color-mix(in srgb, var(--c) 50%, var(--texto));
}
</style>
