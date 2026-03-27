<script setup lang="ts">
import { getAllVisitsByBusinessIdAsCurrentCompany } from '@/services/company/visits'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const companyStore = useCompanyStore()

const data: any = ref(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const getData = async () => {
  if (!companyStore.selectedCompany?.id)
    return
  isLoading.value = true
  error.value = null
  try {
    data.value = await getAllVisitsByBusinessIdAsCurrentCompany(companyStore.selectedCompany.id)
  }
  catch (e: any) {
    error.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isLoading.value = false
  }
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
      type="list-item-avatar-three-line@4"
      rounded="xl"
    />
  </template>

  <template v-else-if="!error">
    <!-- Stat -->
    <VCard
      rounded="xl"
      class="mb-5"
      color="primary"
      variant="tonal"
    >
      <VCardText class="pa-4 d-flex align-center gap-3">
        <div
          class="stat-icon"
          style="background: rgba(var(--v-theme-primary), 0.15);"
        >
          <VIcon
            icon="tabler-walk"
            size="24"
            color="primary"
          />
        </div>
        <div>
          <div class="text-caption text-medium-emphasis">
            Total de visitas
          </div>
          <div class="text-h4 font-weight-bold">
            {{ data?.totalVisits ?? 0 }}
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Empty state -->
    <div
      v-if="!data?.totalVisits"
      class="d-flex flex-column align-center justify-center text-center pa-8"
    >
      <VIcon
        icon="tabler-walk-off"
        size="52"
        color="medium-emphasis"
        class="mb-3"
      />
      <div class="text-body-1 font-weight-bold mb-1">
        Sin visitas registradas
      </div>
      <div class="text-body-2 text-medium-emphasis">
        Las visitas de tus clientes aparecerán aquí
      </div>
    </div>

    <!-- List -->
    <template v-else>
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-history"
          size="15"
        />
        Historial
      </div>
      <CompanyVisitListItemFull :visits="data.visits" />
    </template>
  </template>
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

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  block-size: 48px;
  inline-size: 48px;
}
</style>
