<script setup lang="ts">
import { getBusinessByRepittCodeAsCurrentCompany, updateBusinessAsCurrentCompany } from '@/services/company/businesses'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const companyStore = useCompanyStore()
const router = useRouter()

const data: any = ref(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const businessRepittCode = companyStore.selectedCompany.businessRepittCode

const getData = async () => {
  isLoading.value = true
  error.value = null
  try {
    data.value = await getBusinessByRepittCodeAsCurrentCompany(businessRepittCode ?? '')
  }
  catch (e: any) {
    error.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isLoading.value = false
  }
}

// --- Toggle activo ---
const toggleDialog = ref(false)
const toggleTarget = ref(false)
const isToggling = ref(false)
const toggleError = ref<string | null>(null)

const confirmToggle = (activate: boolean) => {
  toggleTarget.value = activate
  toggleError.value = null
  toggleDialog.value = true
}

const doToggle = async () => {
  isToggling.value = true
  toggleError.value = null
  try {
    await updateBusinessAsCurrentCompany(data.value.id, { isActive: toggleTarget.value })
    await companyStore.refreshCompany(businessRepittCode ?? '')
    await getData()
    toggleDialog.value = false
  }
  catch (e: any) {
    toggleError.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isToggling.value = false
  }
}

// --- Acciones ---
const snackbar = ref(false)
const snackbarText = ref('')

const copyPublicLink = () => {
  const url = `${window.location.origin}/visitante/negocios/${data.value?.businessRepittCode}`
  navigator.clipboard.writeText(url).then(() => {
    snackbarText.value = 'Link copiado al portapapeles'
    snackbar.value = true
  })
}

const goToPublicPage = () => {
  window.open(`/visitante/negocios/${data.value?.businessRepittCode}`, '_blank')
}

const goToDownloadFlyer = () => {
  if (data.value?.flyerPath)
    window.open(data.value.flyerPath, '_blank')
}

onMounted(() => {
  getData()
})
</script>

<template>
  <!-- Error -->
  <VAlert
    v-if="error"
    color="error"
    variant="tonal"
    rounded="xl"
    icon="tabler-alert-triangle"
    class="mb-4"
  >
    {{ error }}
  </VAlert>

  <!-- Skeleton -->
  <template v-if="isLoading">
    <VSkeletonLoader
      type="card"
      rounded="xl"
      class="mb-4"
    />
    <VSkeletonLoader
      type="list-item-three-line"
      rounded="xl"
      class="mb-4"
    />
  </template>

  <template v-else-if="data">
    <!-- Info del negocio -->
    <BusinessDetails
      :name="data.name"
      :description="data.description"
      :address="data.address"
      :phone="data.phone"
      :segment="data.category?.name"
      :business-repitt-code="data.businessRepittCode"
      :opening-hours="data.openingHours"
      :logo-path="data.logoPath"
      :created-at="data.createdAt"
      :is-active="data.isActive"
    />

    <!-- Acciones principales -->
    <VBtn
      block
      size="large"
      prepend-icon="tabler-edit"
      color="primary"
      class="mb-3"
      @click="router.push('/empresa/editar')"
    >
      Editar información
    </VBtn>

    <!-- Compartir -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-share"
        size="15"
      />
      Compartir
    </div>
    <VCard
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="pa-4 d-flex flex-column gap-3">
        <VBtn
          block
          variant="tonal"
          color="primary"
          prepend-icon="tabler-world"
          @click="goToPublicPage"
        >
          Ver página pública
        </VBtn>
        <VBtn
          block
          variant="tonal"
          color="primary"
          prepend-icon="tabler-copy"
          @click="copyPublicLink"
        >
          Copiar link
        </VBtn>
        <VBtn
          v-if="data.flyerPath"
          block
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-download"
          @click="goToDownloadFlyer"
        >
          Descargar flyer promocional
        </VBtn>
      </VCardText>
    </VCard>

    <!-- Zona de peligro -->
    <VDivider class="mb-4" />
    <VBtn
      block
      variant="outlined"
      :color="data.isActive ? 'error' : 'success'"
      :prepend-icon="data.isActive ? 'tabler-circle-x' : 'tabler-circle-check'"
      @click="confirmToggle(!data.isActive)"
    >
      {{ data.isActive ? 'Desactivar negocio' : 'Activar negocio' }}
    </VBtn>
  </template>

  <!-- Dialog confirmación toggle -->
  <VDialog
    v-model="toggleDialog"
    max-width="340"
  >
    <VCard rounded="xl">
      <VCardText class="pa-6 text-center">
        <VIcon
          :icon="toggleTarget ? 'tabler-circle-check' : 'tabler-circle-x'"
          :color="toggleTarget ? 'success' : 'error'"
          size="48"
          class="mb-3"
        />
        <div class="text-h6 font-weight-bold mb-2">
          {{ toggleTarget ? '¿Activar negocio?' : '¿Desactivar negocio?' }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ toggleTarget
            ? 'Tu negocio será visible para los visitantes.'
            : 'Tu negocio dejará de ser visible para los visitantes.' }}
        </div>
        <VAlert
          v-if="toggleError"
          color="error"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mb-4 text-start"
        >
          {{ toggleError }}
        </VAlert>
        <div class="d-flex gap-3">
          <VBtn
            block
            variant="tonal"
            color="secondary"
            :disabled="isToggling"
            @click="toggleDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            block
            :color="toggleTarget ? 'success' : 'error'"
            :loading="isToggling"
            @click="doToggle"
          >
            {{ toggleTarget ? 'Activar' : 'Desactivar' }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Snackbar -->
  <VSnackbar
    v-model="snackbar"
    :timeout="2500"
    color="success"
    location="bottom"
  >
    {{ snackbarText }}
  </VSnackbar>
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
</style>
