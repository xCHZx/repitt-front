<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

// QR scanner for the counter. The camera library is loaded and mounted only when the cashier
// opens the camera (lazy chunk + v-if). Emits the raw text of the first code detected.

const props = defineProps<{

  /** Stop detecting (request in flight, result or error on screen). */
  paused?: boolean
}>()

const emit = defineEmits<{
  detect: [raw: string]
}>()

const QrcodeStream = defineAsyncComponent(() => import('vue-qrcode-reader').then(m => m.QrcodeStream))

const cameraActive = ref(false)
const cameraReady = ref(false)
const cameraError = ref<string | null>(null)

const CAMERA_ERRORS: Record<string, string> = {
  NotAllowedError: 'Debes permitir el acceso a la cámara.',
  NotFoundError: 'No se encontró una cámara en este dispositivo.',
  NotSupportedError: 'Se requiere una conexión segura (HTTPS).',
  NotReadableError: 'La cámara ya está en uso por otra app.',
  OverconstrainedError: 'La cámara no es compatible.',
  InsecureContextError: 'Se requiere una conexión segura (HTTPS).',
  StreamApiNotSupportedError: 'Este navegador no permite usar la cámara.',
}

function activate() {
  cameraError.value = null
  cameraReady.value = false
  cameraActive.value = true
}

function deactivate() {
  cameraActive.value = false
  cameraReady.value = false
}

function onCameraOn() {
  cameraReady.value = true
}

function onCameraError(err: { name?: string; message?: string }) {
  cameraError.value = (err?.name && CAMERA_ERRORS[err.name]) || 'No pudimos abrir la cámara.'
  deactivate()
}

function onDetect(codes: { rawValue?: string }[]) {
  const raw = codes?.[0]?.rawValue
  if (raw && !props.paused)
    emit('detect', raw)
}

defineExpose({ activate, deactivate })
</script>

<template>
  <VCard
    rounded="xl"
    class="overflow-hidden"
  >
    <template v-if="!cameraActive">
      <VCardText class="pa-6">
        <div
          class="counter-camera-placeholder mb-4"
          role="button"
          tabindex="0"
          @click="activate"
          @keydown.enter="activate"
        >
          <VIcon
            icon="tabler-qrcode"
            size="56"
            class="counter-camera-placeholder__icon"
          />
          <div class="text-body-2 text-medium-emphasis mt-2">
            Toca para abrir la cámara
          </div>
        </div>
        <VBtn
          color="primary"
          rounded="xl"
          size="large"
          prepend-icon="tabler-camera"
          @click="activate"
        >
          Escanear QR
        </VBtn>
      </VCardText>
    </template>

    <template v-else>
      <div class="counter-camera-wrap">
        <QrcodeStream
          :paused="props.paused"
          @detect="onDetect"
          @camera-on="onCameraOn"
          @error="onCameraError"
        >
          <div
            v-if="!cameraReady"
            class="counter-camera-overlay"
          >
            <VProgressCircular
              indeterminate
              size="40"
            />
            <div class="text-body-2 mt-2">
              Iniciando cámara…
            </div>
          </div>

          <div
            v-else-if="props.paused"
            class="counter-camera-overlay counter-camera-overlay--paused"
          >
            <VIcon
              icon="tabler-scan"
              size="56"
            />
          </div>

          <div
            v-else
            class="counter-viewfinder"
          />
        </QrcodeStream>
      </div>

      <div class="d-flex align-center justify-space-between px-4 py-2">
        <span class="text-caption text-medium-emphasis">
          Apunta al código QR del cliente
        </span>
        <VBtn
          variant="text"
          size="small"
          color="error"
          prepend-icon="tabler-camera-off"
          @click="deactivate"
        >
          Cerrar
        </VBtn>
      </div>
    </template>

    <VAlert
      v-if="cameraError"
      color="warning"
      variant="tonal"
      rounded="0"
      density="compact"
      icon="tabler-alert-triangle"
    >
      {{ cameraError }}
    </VAlert>
  </VCard>
</template>

<style lang="scss" scoped>
.counter-camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dotted var(--borde-control);
  border-radius: var(--r-control);
  block-size: 160px;
  cursor: pointer;
  transition: border-color 160ms var(--ease-out);

  // Hover solo cambia el color del borde (guía §7)
  &:hover {
    border-color: var(--acento);
  }
}

.counter-camera-placeholder__icon {
  color: var(--acento);
}

.counter-camera-wrap {
  position: relative;
  overflow: hidden;
  block-size: 280px;
}

.counter-camera-overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--velo);
  color: var(--texto-noche);
  inset: 0;
}

.counter-viewfinder {
  position: absolute;
  border: 2px solid var(--papel);
  border-radius: var(--r-control);
  block-size: 180px;
  inline-size: 180px;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}
</style>
