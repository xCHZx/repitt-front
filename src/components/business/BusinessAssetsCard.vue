<script setup lang="ts">
import { getBusinessAssets, regenerateBusinessAssets } from '@/api/endpoints/businesses'
import type { BusinessAssets } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

// Business QR, flyer and public link (guide §4.A.3).
// QR and flyer are generated in the background: poll GET …/assets with a growing wait until
// `assetsGeneratedAt` is set (or changes after a regenerate).

const props = defineProps<{

  /** Business suspended by moderation: regenerate answers 409 businessSuspended (§3.5). */
  suspended?: boolean
}>()

const POLL_DELAYS_MS = [2000, 4000, 8000, 16000, 30000]

const business = useBusinessStore()
const { error, capture, reset } = useApiError()
const { error: regenError, capture: captureRegen, reset: resetRegen } = useApiError()

const assets = ref<BusinessAssets | null>(null)
const isLoading = ref(true)
const isPolling = ref(false)
const pollGaveUp = ref(false)
const isRegenerating = ref(false)
const regenRequested = ref(false)
const suspendedByApi = ref(false)
const copied = ref(false)

const isSuspended = computed(() => props.suspended || suspendedByApi.value)

let timer: ReturnType<typeof setTimeout> | null = null
let disposed = false

function stopPolling() {
  if (timer)
    clearTimeout(timer)
  timer = null
  isPolling.value = false
}

async function fetchAssets() {
  if (!business.activeId)
    return null
  assets.value = await getBusinessAssets(business.activeId)

  return assets.value
}

/** Poll until assetsGeneratedAt is set and different from `previous`. */
function poll(previous: string | null, attempt = 0) {
  stopPolling()
  if (attempt >= POLL_DELAYS_MS.length) {
    pollGaveUp.value = true

    return
  }
  isPolling.value = true
  pollGaveUp.value = false
  timer = setTimeout(async () => {
    if (disposed)
      return
    try {
      const a = await fetchAssets()
      if (a?.assetsGeneratedAt && a.assetsGeneratedAt !== previous) {
        stopPolling()

        return
      }
    }
    catch {
      // keep trying with the next delay
    }
    poll(previous, attempt + 1)
  }, POLL_DELAYS_MS[attempt])
}

async function load() {
  reset()
  isLoading.value = true
  try {
    const a = await fetchAssets()
    if (a && !a.assetsGeneratedAt)
      poll(null)
  }
  catch (e) {
    capture(e)
  }
  finally {
    isLoading.value = false
  }
}

async function regenerate() {
  if (!business.activeId)
    return
  resetRegen()
  isRegenerating.value = true
  try {
    const previous = assets.value?.assetsGeneratedAt ?? null

    await regenerateBusinessAssets(business.activeId)
    regenRequested.value = true
    poll(previous)
  }
  catch (e) {
    const err = captureRegen(e)
    if (err.error.code === 'CONFLICT' && err.error.detailCode === 'businessSuspended')
      suspendedByApi.value = true
  }
  finally {
    isRegenerating.value = false
  }
}

async function copyLink() {
  if (!assets.value)
    return
  try {
    await navigator.clipboard.writeText(assets.value.qrPayload)
    copied.value = true
  }
  catch {
    // Clipboard blocked: the link is visible to copy by hand
  }
}

onMounted(load)
onBeforeUnmount(() => {
  disposed = true
  stopPolling()
})
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4">
      <ApiErrorAlert :error="error">
        <VBtn
          size="small"
          variant="text"
          class="mt-1 px-0"
          @click="load"
        >
          Reintentar
        </VBtn>
      </ApiErrorAlert>

      <VSkeletonLoader
        v-if="isLoading"
        type="image, list-item-two-line"
      />

      <template v-else-if="assets">
        <!-- QR -->
        <div class="d-flex flex-column align-start mb-4">
          <div class="assets-qr mb-2">
            <VImg
              v-if="assets.qrUrl"
              :src="assets.qrUrl"
              alt="Código QR del negocio"
              width="180"
              height="180"
            />
            <div
              v-else
              class="d-flex flex-column align-center justify-center h-100 text-caption text-medium-emphasis pa-4"
            >
              <VProgressCircular
                v-if="isPolling"
                indeterminate
                size="28"
                color="primary"
                class="mb-2"
              />
              {{ pollGaveUp ? 'Tu QR sigue en preparación.' : 'Estamos generando tu QR…' }}
            </div>
          </div>
          <div class="text-caption text-medium-emphasis">
            Tus clientes escanean este QR para ver tu página.
          </div>
          <VBtn
            v-if="pollGaveUp && !assets.qrUrl"
            size="small"
            variant="text"
            color="primary"
            prepend-icon="tabler-refresh"
            @click="poll(assets.assetsGeneratedAt)"
          >
            Revisar de nuevo
          </VBtn>
        </div>

        <!-- Public link -->
        <div class="assets-link mb-3">
          <span class="text-body-2 text-truncate">{{ assets.qrPayload }}</span>
          <VBtn
            icon
            size="small"
            variant="text"
            color="primary"
            aria-label="Copiar enlace"
            @click="copyLink"
          >
            <VIcon
              icon="tabler-copy"
              size="18"
            />
          </VBtn>
        </div>

        <VBtn
          v-if="assets.flyerUrl"
          block
          variant="tonal"
          color="primary"
          prepend-icon="tabler-download"
          :href="assets.flyerUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mb-3"
        >
          Descargar flyer
        </VBtn>

        <!-- Regenerate -->
        <template v-if="!isSuspended">
          <VBtn
            block
            variant="text"
            color="secondary"
            prepend-icon="tabler-refresh"
            :loading="isRegenerating"
            :disabled="isPolling"
            @click="regenerate"
          >
            Regenerar QR y flyer
          </VBtn>
          <div class="text-caption text-medium-emphasis">
            Úsalo si cambiaste tu nombre o logo. Solo se puede regenerar una vez por hora.
          </div>
        </template>
        <VAlert
          v-else
          color="warning"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mt-2"
        >
          El negocio está suspendido: no se pueden regenerar el QR ni el flyer.
        </VAlert>

        <VAlert
          v-if="regenRequested && !isPolling && !regenError"
          color="info"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mt-3"
        >
          Pedimos regenerar tu QR y flyer. Si no ves cambios, puede que ya se haya regenerado en la última hora.
        </VAlert>
        <ApiErrorAlert
          :error="regenError"
          class="mt-3"
        />
      </template>
    </VCardText>

    <VSnackbar
      v-model="copied"
      :timeout="2500"
      color="success"
      location="bottom"
    >
      Enlace copiado
    </VSnackbar>
  </VCard>
</template>

<style lang="scss" scoped>
// El QR va siempre sobre papel blanco, también en oscuro (se tiene que poder escanear).
.assets-qr {
  overflow: hidden;
  border: 1px solid var(--linea);
  border-radius: var(--r-control);
  background: var(--papel);
  block-size: 180px;
  inline-size: 180px;
}

.assets-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--linea);
  border-radius: var(--r-control);
  gap: var(--s-2);
  padding-block: var(--s-1);
  padding-inline: var(--s-3) var(--s-1);
}
</style>
