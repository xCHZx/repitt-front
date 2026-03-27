<script lang="ts" setup>
import { getUserStampCardReadyToRedeemAsCurrentCompany } from '@/services/company/userStampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const router = useRouter()

const data: any = ref([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const companyStore = useCompanyStore()
const businessId = companyStore.selectedCompany.id

const getData = async () => {
  if (!businessId)
    return
  isLoading.value = true
  error.value = null
  try {
    data.value = await getUserStampCardReadyToRedeemAsCurrentCompany(businessId)
  }
  catch (e: any) {
    error.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isLoading.value = false
  }
}

const goToCard = (stampCardId: string, userStampCardId: string) => {
  router.push(`/empresa/tarjetas/${stampCardId}/tarjetas-de-usuario/${userStampCardId}`)
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
    class="mb-4"
    icon="tabler-alert-triangle"
  >
    {{ error }}
  </VAlert>

  <!-- Skeleton -->
  <template v-if="isLoading">
    <VSkeletonLoader
      v-for="n in 3"
      :key="n"
      type="list-item-avatar"
      rounded="xl"
      class="mb-3"
    />
  </template>

  <!-- Empty state -->
  <div
    v-else-if="!error && data.length === 0"
    class="d-flex flex-column align-center justify-center text-center pa-8"
  >
    <VIcon
      icon="tabler-gift-off"
      size="52"
      color="medium-emphasis"
      class="mb-3"
    />
    <div class="text-body-1 font-weight-bold mb-1">
      Sin recompensas pendientes
    </div>
    <div class="text-body-2 text-medium-emphasis">
      Aquí aparecerán los visitantes con tarjetas completas listas para canjear
    </div>
  </div>

  <!-- List -->
  <template v-else-if="!isLoading">
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-gift"
        size="15"
      />
      Listas para canjear
      <VChip
        size="x-small"
        color="success"
        variant="flat"
        class="ms-1"
      >
        {{ data.length }}
      </VChip>
    </div>

    <UserStampCardWaitingRedeemListAsCompany
      v-for="item in data"
      :key="item.id"
      :reward="item.stampCard.reward"
      :stamp-card-name="item.stampCard.name"
      :customer-name="`${item.customer.firstName} ${item.customer.lastName}`"
      :completed-date="item.completedAt"
      :primary-color="item.stampCard.primaryColor"
      :stamp-icon="item.stampCard.stampIcon"
      class="mb-3"
      style="cursor: pointer;"
      @click="goToCard(item.stampCard.id, item.id)"
    />
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
</style>
