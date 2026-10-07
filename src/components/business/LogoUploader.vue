<script setup lang="ts">
import { LOGO_MAX_BYTES, LOGO_TYPES } from './businessForm'
import { uploadBusinessLogo } from '@/api/endpoints/businesses'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

// Business logo upload (guide §4.A.3). Validates type and size BEFORE uploading (a 413 may arrive
// as a network error). The response is BusinessAssetsDto: re-read the business to get logoUrl.

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  uploaded: []
}>()

const business = useBusinessStore()
const { error, capture, reset } = useApiError()

const inputValue = ref<File[]>([])
const file = ref<File | null>(null)
const preview = ref<string | null>(null)
const localError = ref<string | null>(null)
const isUploading = ref(false)
const done = ref(false)
const refreshFailed = ref(false)

const logoSrc = computed(() => preview.value ?? business.active?.logoUrl ?? null)
const initial = computed(() => String(business.active?.name || 'R').charAt(0).toUpperCase())

function clearPreview() {
  if (preview.value)
    URL.revokeObjectURL(preview.value)
  preview.value = null
}

function onFile(value: File | File[] | null | undefined) {
  const f = Array.isArray(value) ? value[0] : value

  reset()
  done.value = false
  refreshFailed.value = false
  localError.value = null
  clearPreview()
  file.value = null
  if (!f)
    return
  if (!LOGO_TYPES.includes(f.type)) {
    localError.value = 'Usa una imagen PNG, JPG o WebP.'

    return
  }
  if (f.size > LOGO_MAX_BYTES) {
    localError.value = 'La imagen pesa más de 2 MB.'

    return
  }
  file.value = f
  preview.value = URL.createObjectURL(f)
}

async function upload() {
  if (!file.value || !business.activeId)
    return
  reset()
  isUploading.value = true
  try {
    await uploadBusinessLogo(business.activeId, file.value)
  }
  catch (e) {
    capture(e)
    isUploading.value = false

    return
  }

  // Uploaded: clear the selection so the same file can be picked again
  inputValue.value = []
  file.value = null
  done.value = true
  refreshFailed.value = false
  emit('uploaded')

  // Re-read the business for logoUrl. A failure here is not an upload error.
  try {
    await business.refreshActive()
    clearPreview()
  }
  catch {
    // Keep the local preview so the new logo still shows
    refreshFailed.value = true
  }
  finally {
    isUploading.value = false
  }
}

onBeforeUnmount(clearPreview)
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-4 mb-4">
        <VAvatar
          rounded="lg"
          size="72"
          color="primary"
          variant="tonal"
        >
          <VImg
            v-if="logoSrc"
            :src="logoSrc"
            cover
          />
          <span
            v-else
            class="text-h4 font-weight-bold"
          >{{ initial }}</span>
        </VAvatar>
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ preview ? 'Nueva imagen seleccionada' : business.active?.logoUrl ? 'Logo actual' : 'Sin logo' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            PNG, JPG o WebP · máx. 2 MB
          </div>
        </div>
      </div>

      <VFileInput
        v-model="inputValue"
        variant="outlined"
        density="compact"
        accept="image/png,image/jpeg,image/webp"
        label="Seleccionar imagen"
        prepend-icon=""
        prepend-inner-icon="tabler-photo-up"
        :disabled="props.disabled || isUploading"
        :error-messages="localError ?? undefined"
        hide-details="auto"
        @update:model-value="onFile"
      />

      <ApiErrorAlert
        :error="error"
        class="mt-3"
      />

      <VAlert
        v-if="done"
        color="success"
        variant="tonal"
        density="compact"
        rounded="lg"
        class="mt-3"
      >
        Logo actualizado.
        <template v-if="refreshFailed">
          Puede tardar en verse en el resto de la app; recarga la página si no aparece.
        </template>
      </VAlert>

      <VBtn
        v-if="file"
        block
        color="primary"
        variant="tonal"
        class="mt-3"
        prepend-icon="tabler-upload"
        :loading="isUploading"
        @click="upload"
      >
        Subir logo
      </VBtn>
    </VCardText>
  </VCard>
</template>
