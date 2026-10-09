<script setup lang="ts">
import { publishBusiness, unpublishBusiness } from '@/api/endpoints/businesses'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

// Publish / unpublish the active business (guide §4.A.2). This is the owner's voluntary pause:
// it says nothing about payment (access is decided by `entitlement`).

const business = useBusinessStore()
const { error, capture, reset } = useApiError()

const isPublished = computed(() => !!business.active?.isPublished)
const dialog = ref(false)
const isSaving = ref(false)

function onToggle() {
  reset()
  dialog.value = true
}

async function confirm() {
  if (!business.activeId)
    return
  reset()
  isSaving.value = true
  try {
    const updated = isPublished.value
      ? await unpublishBusiness(business.activeId)
      : await publishBusiness(business.activeId)

    business.upsert(updated)
    dialog.value = false
  }
  catch (e) {
    capture(e)
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <VIcon
          :icon="isPublished ? 'tabler-world' : 'tabler-world-off'"
          :class="isPublished ? 'publish-icon--on' : 'publish-icon--off'"
          size="24"
        />
        <div class="flex-grow-1">
          <div class="text-body-1 font-weight-bold">
            {{ isPublished ? 'Negocio publicado' : 'Negocio en pausa' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ isPublished
              ? 'Tu página pública está visible y puedes registrar visitas.'
              : 'Tu página pública está oculta y no se pueden registrar clientes ni sellos.' }}
          </div>
        </div>
        <VSwitch
          :model-value="isPublished"
          color="primary"
          hide-details
          inset
          density="compact"
          aria-label="Publicar negocio"
          @update:model-value="onToggle"
        />
      </div>
    </VCardText>

    <VDialog
      v-model="dialog"
      max-width="360"
    >
      <VCard rounded="xl">
        <VCardText class="pa-6">
          <VIcon
            :icon="isPublished ? 'tabler-world-off' : 'tabler-world'"
            size="48"
            class="publish-icon--on mb-3"
          />
          <div class="text-h6 font-weight-bold mb-2">
            {{ isPublished ? '¿Pausar tu negocio?' : '¿Publicar tu negocio?' }}
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            {{ isPublished
              ? 'Se ocultará tu página pública y no podrás registrar clientes ni sellar hasta que lo vuelvas a publicar. Tu plan no cambia.'
              : 'Tu página pública volverá a estar visible y podrás registrar clientes y sellar.' }}
          </div>
          <ApiErrorAlert
            :error="error"
            class="mb-4"
          />
          <div class="d-flex gap-3">
            <VBtn
              block
              variant="tonal"
              color="secondary"
              :disabled="isSaving"
              @click="dialog = false"
            >
              Cancelar
            </VBtn>
            <VBtn
              block
              :loading="isSaving"
              @click="confirm"
            >
              {{ isPublished ? 'Pausar' : 'Publicar' }}
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </VCard>
</template>

<style lang="scss" scoped>
// El estado lo dice el texto; el ícono solo acompaña: --acento publicado, --texto-2 en pausa.
.publish-icon--on {
  color: var(--acento);
}

.publish-icon--off {
  color: var(--texto-2);
}
</style>
