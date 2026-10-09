<!-- Stamp icon picker: predefined icons or a custom PNG/JPEG/WebP ≤ 2 MiB. -->
<script setup lang="ts">
import { ICON_ACCEPT, PRESET_ICONS, validateIconFile } from './cardIcons'
import type { IconChoice } from './cardIcons'

const props = defineProps<{
  selected: IconChoice | null
}>()

const emit = defineEmits<{
  (e: 'select', choice: IconChoice): void
}>()

const open = defineModel<boolean>({ required: true })

const fileError = ref<string | null>(null)
const fileInput = ref<File[]>()

watch(open, isOpen => {
  if (isOpen) {
    fileError.value = null
    fileInput.value = undefined
  }
})

function pickPreset(name: typeof PRESET_ICONS[number]['name']) {
  emit('select', { kind: 'preset', name })
  open.value = false
}

function onFile(value: File | File[] | null | undefined) {
  const file = Array.isArray(value) ? value[0] : value
  if (!file)
    return

  const error = validateIconFile(file)

  fileError.value = error
  if (error)
    return

  emit('select', { kind: 'file', file, previewUrl: URL.createObjectURL(file) })
  open.value = false
}
</script>

<template>
  <VDialog
    v-model="open"
    max-width="480"
  >
    <VCard rounded="xl">
      <VCardItem>
        <VCardTitle>Ícono del sello</VCardTitle>
        <template #append>
          <VBtn
            icon
            variant="plain"
            aria-label="Cerrar"
            @click="open = false"
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
              variant="outlined"
              :class="{ 'icon-option--selected': props.selected?.kind === 'preset' && props.selected.name === preset.name }"
              class="icon-option d-flex flex-column align-center justify-center pa-2 cursor-pointer"
              height="72"
              rounded="lg"
              @click="pickPreset(preset.name)"
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
          v-model="fileInput"
          variant="outlined"
          density="compact"
          :accept="ICON_ACCEPT"
          label="PNG, JPG o WebP (máx. 2 MB)"
          prepend-icon="tabler-upload"
          :error-messages="fileError ?? undefined"
          :hide-details="!fileError"
          @update:model-value="onFile"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
// Opción de ícono: el hover solo cambia el color del borde (guía §7); la elegida va en lenguaje
// tonal (guía §8.4): borde --enlace + fondo --violeta-suave. `.v-card` delante para ganar a
// `:root body .v-card` de src/styles/vuetify.scss.
.v-card.icon-option {
  border: 1px solid var(--linea);
  transition: border-color 160ms var(--ease-out), background-color 160ms var(--ease-out);

  &:hover {
    border-color: var(--borde-control);
  }

  &.icon-option--selected,
  &.icon-option--selected:hover {
    border: 2px solid var(--enlace);
    background-color: var(--violeta-suave);
  }
}
</style>
