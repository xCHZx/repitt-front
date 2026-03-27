<script setup lang="ts">
import { getAllStampCardsByBusinessIdAsCurrentCompany } from '@/services/company/stampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const companyStore = useCompanyStore()
const stampCards = ref<any[]>([])
const isLoading = ref(false)

const getData = async () => {
  if (!companyStore.selectedCompany.id)
    return
  isLoading.value = true
  try {
    stampCards.value = await getAllStampCardsByBusinessIdAsCurrentCompany(companyStore.selectedCompany.id)
  }
  catch {
    // silently ignore
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => getData())

const activeCards = computed(() => stampCards.value.filter(c => c.isActive))
const inactiveCards = computed(() => stampCards.value.filter(c => !c.isActive))
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-5">
      <div
        v-if="!isLoading"
        class="text-body-2 text-medium-emphasis"
      >
        {{ stampCards.length }} tarjeta{{ stampCards.length !== 1 ? 's' : '' }}
      </div>
      <div v-else />
      <VBtn
        size="small"
        color="primary"
        rounded="xl"
        prepend-icon="tabler-plus"
        to="/empresa/tarjetas/crear"
      >
        Nueva
      </VBtn>
    </div>

    <!-- Loading skeletons -->
    <div
      v-if="isLoading"
      class="d-flex flex-column gap-3"
    >
      <VSkeletonLoader
        v-for="i in 3"
        :key="i"
        type="list-item-avatar"
        rounded="xl"
      />
    </div>

    <!-- Cards list -->
    <template v-else-if="stampCards.length > 0">
      <!-- Active -->
      <template v-if="activeCards.length > 0">
        <div class="section-label mb-3">
          <VIcon
            icon="tabler-circle-check"
            size="15"
          />
          Activas
        </div>
        <div class="d-flex flex-column gap-3 mb-5">
          <StampCardListItemAsBusiness
            v-for="card in activeCards"
            :key="card.id"
            :name="card.name"
            :reward="card.reward"
            :required-stamps="card.requiredStamps"
            :stamp-icon="card.stampIconPath"
            :primary-color="card.primaryColor"
            :is-active="card.isActive"
            :to="`/empresa/tarjetas/${card.id}`"
          />
        </div>
      </template>

      <!-- Inactive -->
      <template v-if="inactiveCards.length > 0">
        <div class="section-label mb-3">
          <VIcon
            icon="tabler-circle-x"
            size="15"
          />
          Inactivas
        </div>
        <div class="d-flex flex-column gap-3">
          <StampCardListItemAsBusiness
            v-for="card in inactiveCards"
            :key="card.id"
            :name="card.name"
            :reward="card.reward"
            :required-stamps="card.requiredStamps"
            :stamp-icon="card.stampIconPath"
            :primary-color="card.primaryColor"
            :is-active="card.isActive"
            :to="`/empresa/tarjetas/${card.id}`"
          />
        </div>
      </template>
    </template>

    <!-- Empty state -->
    <div
      v-else
      class="text-center py-12"
    >
      <VIcon
        icon="tabler-cards"
        size="72"
        class="mb-4"
        style="opacity: 0.3;"
      />
      <div class="text-h6 font-weight-bold mb-1">
        Sin tarjetas de lealtad
      </div>
      <div class="text-body-2 text-medium-emphasis mb-5">
        Crea tu primera tarjeta para empezar a fidelizar clientes
      </div>
      <VBtn
        color="primary"
        rounded="xl"
        prepend-icon="tabler-plus"
        to="/empresa/tarjetas/crear"
      >
        Crear primera tarjeta
      </VBtn>
    </div>
  </div>
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
