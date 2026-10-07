<script setup lang="ts">
import { exportMyData } from '@/api/endpoints/me'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { ensureReauthenticated } from '@/composables/useReauth'
import { todayInZone } from '@/utils/dates'

// Data export (guide §4.C.6): reauthenticate FIRST (a 403 also counts toward the 3/hour limit),
// then GET /v1/me/export once and offer the JSON as a download (never stored).

const { error, capture, reset } = useApiError()
const exporting = ref(false)
const done = ref(false)
const truncated = ref(false)

function download(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = `repitt-mis-datos-${todayInZone()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function runExport() {
  if (exporting.value)
    return
  reset()
  done.value = false
  truncated.value = false

  if (!await ensureReauthenticated())
    return

  exporting.value = true
  try {
    const data = await exportMyData()

    truncated.value = Object.values(data.truncated).some(Boolean)
    download(data)
    done.value = true
  }
  catch (e) {
    capture(e)
  }
  finally {
    exporting.value = false
  }
}
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3 mb-2">
        <VIcon
          icon="tabler-download"
          color="primary"
        />
        <div class="text-subtitle-1 font-weight-bold">
          Descargar mis datos
        </div>
      </div>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Obtén un archivo con tu información: perfil, consentimientos, negocios, tarjetas, movimientos y sesiones.
        Por seguridad te pediremos confirmar tu identidad. Puedes descargarlo hasta 3 veces por hora.
      </p>

      <VAlert
        v-if="done && truncated"
        color="warning"
        variant="tonal"
        density="compact"
        rounded="lg"
        class="mb-4"
      >
        Tu archivo se descargó, pero no está completo porque tienes mucha información.
        Si necesitas la exportación completa, pídela a soporte.
      </VAlert>
      <VAlert
        v-else-if="done"
        color="success"
        variant="tonal"
        density="compact"
        rounded="lg"
        class="mb-4"
      >
        Listo, se descargó tu archivo.
      </VAlert>

      <ApiErrorAlert
        :error="error"
        class="mb-4"
      />

      <VBtn
        block
        variant="tonal"
        color="primary"
        prepend-icon="tabler-file-download"
        :loading="exporting"
        @click="runExport"
      >
        Descargar mis datos
      </VBtn>
    </VCardText>
  </VCard>
</template>
