<script setup lang="ts">
import { getCustomerAsCompany } from '@/services/company/customers'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const companyStore = useCompanyStore()
const route = useRoute()

const customerId = Number(route.params.customerId)

const customer = ref<any>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 2) return 'Hace un momento'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  const months = Math.floor(days / 30)
  return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

const initials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

// Active: in progress OR completed but prize not yet redeemed
const activeCards = computed(() =>
  customer.value?.stampCards.filter((c: any) => !c.isRewardRedeemed) ?? [],
)

// History: fully completed and redeemed
const historyCards = computed(() =>
  customer.value?.stampCards.filter((c: any) => c.isRewardRedeemed) ?? [],
)

const getData = async () => {
  isLoading.value = true
  loadError.value = null
  try {
    customer.value = await getCustomerAsCompany(companyStore.selectedCompany.id ?? 0, customerId)
  }
  catch (e: any) {
    loadError.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => { getData() })
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="isLoading"
      class="d-flex justify-center py-12"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="40"
      />
    </div>

    <!-- Error -->
    <VAlert
      v-else-if="loadError"
      color="error"
      variant="tonal"
      rounded="lg"
      density="compact"
      icon="tabler-alert-triangle"
    >
      {{ loadError }}
    </VAlert>

    <template v-else-if="customer">
      <!-- Profile card -->
      <VCard
        rounded="xl"
        class="profile-card mb-4"
      >
        <VCardText class="pa-5">
          <div class="d-flex align-center gap-4">
            <VAvatar
              color="primary"
              variant="tonal"
              size="64"
            >
              <span class="text-h6 font-weight-black">
                {{ initials(customer.firstName, customer.lastName) }}
              </span>
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-black">
                {{ customer.firstName }} {{ customer.lastName }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ customer.phone }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                Cliente desde {{ formatDate(customer.joinedAt) }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Stats row -->
      <div class="stats-row mb-4">
        <VCard rounded="xl">
          <VCardText class="pa-4 text-center">
            <div class="text-h4 font-weight-black text-primary">
              {{ customer.totalVisits }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ customer.totalVisits === 1 ? 'visita total' : 'visitas totales' }}
            </div>
          </VCardText>
        </VCard>
        <VCard rounded="xl">
          <VCardText class="pa-4 text-center">
            <div class="text-body-1 font-weight-bold">
              {{ customer.lastVisitAt ? timeAgo(customer.lastVisitAt) : '—' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              última visita
            </div>
          </VCardText>
        </VCard>
      </div>

      <!-- Active stamp cards -->
      <template v-if="activeCards.length">
        <div class="section-label mb-3">
          <VIcon
            icon="tabler-cards"
            size="13"
            color="primary"
          />
          Tarjetas activas
        </div>

        <div class="d-flex flex-column gap-3 mb-4">
          <VCard
            v-for="usc in activeCards"
            :key="usc.id"
            rounded="xl"
            :color="usc.isCompleted ? 'warning' : undefined"
            :variant="usc.isCompleted ? 'tonal' : 'elevated'"
          >
            <VCardText class="pa-4">
              <div class="d-flex align-center justify-space-between mb-1">
                <div class="text-body-2 font-weight-bold">
                  {{ usc.stampCard.name }}
                </div>
                <VChip
                  v-if="usc.isCompleted"
                  size="x-small"
                  color="warning"
                  variant="tonal"
                >
                  Premio pendiente
                </VChip>
              </div>
              <div class="text-caption text-medium-emphasis mb-3">
                Recompensa: {{ usc.stampCard.reward }}
              </div>

              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption font-weight-medium">Progreso</span>
                <span class="text-caption font-weight-bold text-primary">
                  {{ usc.visitsCount }} / {{ usc.stampCard.requiredStamps }} sellos
                </span>
              </div>
              <VProgressLinear
                :model-value="(usc.visitsCount / usc.stampCard.requiredStamps) * 100"
                color="primary"
                bg-color="primary"
                bg-opacity="0.12"
                rounded
                height="8"
              />

              <div class="text-caption text-medium-emphasis mt-2">
                Ciclo iniciado {{ formatDate(usc.createdAt) }}
              </div>
            </VCardText>
          </VCard>
        </div>
      </template>

      <!-- History -->
      <template v-if="historyCards.length">
        <div class="section-label mb-3">
          <VIcon
            icon="tabler-history"
            size="13"
            color="primary"
          />
          Historial de ciclos
        </div>

        <VCard rounded="xl">
          <VList lines="two">
            <template
              v-for="(usc, idx) in historyCards"
              :key="usc.id"
            >
              <VListItem class="py-3">
                <template #prepend>
                  <VAvatar
                    :color="usc.isRewardRedeemed ? 'success' : 'warning'"
                    variant="tonal"
                    size="36"
                  >
                    <VIcon
                      :icon="usc.isRewardRedeemed ? 'tabler-gift' : 'tabler-clock'"
                      size="18"
                    />
                  </VAvatar>
                </template>

                <VListItemTitle class="text-body-2 font-weight-bold">
                  {{ usc.stampCard.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-caption">
                  {{ usc.stampCard.reward }} · {{ usc.stampCard.requiredStamps }} sellos
                </VListItemSubtitle>

                <template #append>
                  <div class="text-right">
                    <VChip
                      :color="usc.isRewardRedeemed ? 'success' : 'warning'"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ usc.isRewardRedeemed ? 'Canjeado' : 'Pendiente' }}
                    </VChip>
                    <div class="text-caption text-medium-emphasis mt-1">
                      {{ usc.completedAt ? formatDate(usc.completedAt) : '' }}
                    </div>
                  </div>
                </template>
              </VListItem>
              <VDivider v-if="idx < historyCards.length - 1" />
            </template>
          </VList>
        </VCard>
      </template>

      <!-- No cards at all -->
      <VCard
        v-if="!activeCards.length && !historyCards.length"
        rounded="xl"
      >
        <VCardText class="pa-6 text-center">
          <VIcon
            icon="tabler-cards"
            size="40"
            color="secondary"
            style="opacity: 0.4;"
            class="mb-2"
          />
          <div class="text-body-2 text-medium-emphasis">
            Sin tarjetas registradas
          </div>
        </VCardText>
      </VCard>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.stats-row {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 600;
  gap: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
