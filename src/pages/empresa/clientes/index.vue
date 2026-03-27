<script setup lang="ts">
import { getCustomersAsCompany } from '@/services/company/customers'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const companyStore = useCompanyStore()

const customers = ref<any[]>([])
const totalCustomers = ref(0)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return customers.value

  return customers.value.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
    || c.phone.includes(q),
  )
})

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

const initials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

const getData = async () => {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await getCustomersAsCompany(companyStore.selectedCompany.id ?? 0)
    customers.value = response.customers
    totalCustomers.value = response.totalCustomers
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
    <!-- Search + summary -->
    <div class="mb-4">
      <VTextField
        v-model="search"
        placeholder="Buscar por nombre o teléfono..."
        variant="outlined"
        rounded="xl"
        density="comfortable"
        prepend-inner-icon="tabler-search"
        clearable
        hide-details
      />
      <div
        v-if="!isLoading && !loadError"
        class="text-caption text-medium-emphasis mt-2 px-1"
      >
        {{ filtered.length }} de {{ totalCustomers }} clientes
      </div>
    </div>

    <!-- Error -->
    <VAlert
      v-if="loadError"
      color="error"
      variant="tonal"
      rounded="lg"
      density="compact"
      icon="tabler-alert-triangle"
      class="mb-4"
    >
      {{ loadError }}
    </VAlert>

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

    <!-- Empty state -->
    <VCard
      v-else-if="!loadError && filtered.length === 0"
      rounded="xl"
    >
      <VCardText class="pa-8 text-center">
        <VIcon
          :icon="search ? 'tabler-search-off' : 'tabler-users'"
          size="48"
          color="secondary"
          style="opacity: 0.4;"
          class="mb-3"
        />
        <div class="text-body-1 font-weight-medium text-medium-emphasis">
          {{ search ? 'Sin resultados' : 'Aún no hay clientes' }}
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          {{ search ? 'Prueba con otro nombre o teléfono' : 'Los clientes aparecerán aquí una vez que registres visitas' }}
        </div>
      </VCardText>
    </VCard>

    <!-- Customer list -->
    <div
      v-else
      class="customer-list"
    >
      <VCard
        v-for="customer in filtered"
        :key="customer.phone"
        rounded="xl"
        class="customer-card"
        :ripple="true"
        style="cursor: pointer;"
        @click="$router.push(`/empresa/clientes/${customer.id}`)"
      >
        <VCardText class="pa-4">
          <!-- Header row -->
          <div class="d-flex align-center gap-3 mb-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="44"
            >
              <span class="text-body-1 font-weight-bold">
                {{ initials(customer.firstName, customer.lastName) }}
              </span>
            </VAvatar>

            <div class="flex-grow-1 min-width-0">
              <div class="text-body-1 font-weight-bold text-truncate">
                {{ customer.firstName }} {{ customer.lastName }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ customer.phone }}
              </div>
            </div>

            <div class="text-right">
              <div class="text-h6 font-weight-black text-primary">
                {{ customer.totalVisits }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ customer.totalVisits === 1 ? 'visita' : 'visitas' }}
              </div>
            </div>
          </div>

          <!-- Last visit -->
          <div class="d-flex align-center gap-1 mb-3">
            <VIcon
              icon="tabler-clock"
              size="13"
              color="secondary"
            />
            <span class="text-caption text-medium-emphasis">
              {{ customer.lastVisitAt ? timeAgo(customer.lastVisitAt) : 'Sin visitas registradas' }}
            </span>
          </div>

          <!-- Active stamp cards -->
          <div
            v-if="customer.stampCards?.length"
            class="stamp-chips"
          >
            <div
              v-for="usc in customer.stampCards"
              :key="usc.id"
              class="stamp-chip"
            >
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption font-weight-medium text-truncate">
                  {{ usc.stampCard.name }}
                </span>
                <span class="text-caption text-medium-emphasis ms-2 text-no-wrap">
                  {{ usc.visitsCount }}/{{ usc.stampCard.requiredStamps }}
                </span>
              </div>
              <VProgressLinear
                :model-value="(usc.visitsCount / usc.stampCard.requiredStamps) * 100"
                color="primary"
                bg-color="primary"
                bg-opacity="0.12"
                rounded
                height="5"
              />
              <div
                v-if="usc.isCompleted"
                class="text-caption text-warning font-weight-medium mt-1"
              >
                Premio pendiente de canje
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-caption text-medium-emphasis"
          >
            Sin tarjetas activas
          </div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.customer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-card {
  transition: box-shadow 0.2s ease;
}

.stamp-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stamp-chip {
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 5%);
  padding-block: 8px;
  padding-inline: 10px;
}
</style>
