<script setup lang="ts">
import { getCustomer } from '@/api/endpoints/crm'
import { isApiError } from '@/api/errors'
import type { CustomerDetail, CustomerSummary } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import CustomerCardCycles from '@/components/crm/CustomerCardCycles.vue'
import RenameCustomerDialog from '@/components/crm/RenameCustomerDialog.vue'
import { isUuid } from '@/components/crm/eventLabels'
import CompanyVisitListItemFull from '@/components/visits/CompanyVisitListItemFull.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { formatInstant, timeAgo } from '@/utils/dates'

// Customer detail (guide §4.A.7): summary, cards with their cycles and the latest events.

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const business = useBusinessStore()
const route = useRoute()
const router = useRouter()

const customerId = computed(() => {
  const id = (route.params as Record<string, string | string[] | undefined>).customerId

  return typeof id === 'string' ? id : ''
})

const customer = ref<CustomerDetail | null>(null)
const isLoading = ref(false)
const notFound = ref(false)
const showRename = ref(false)
const renamed = ref(false)
const { error, capture, reset } = useApiError()

const initials = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part.charAt(0))
  .join('')
  .toUpperCase() || '?'

const cardNames = computed(() => Object.fromEntries((customer.value?.cards ?? []).map(c => [c.card.id, c.card.name])))

// Each request gets a number; responses of an older request are ignored
let requestSeq = 0

const getData = async () => {
  const businessId = business.activeId
  if (!businessId)
    return

  const seq = ++requestSeq

  customer.value = null
  notFound.value = false
  isLoading.value = false
  reset()

  if (!isUuid(customerId.value)) {
    notFound.value = true

    return
  }

  isLoading.value = true
  try {
    const result = await getCustomer(businessId, customerId.value)
    if (seq === requestSeq)
      customer.value = result
  }
  catch (e) {
    if (seq !== requestSeq)
      return
    if (isApiError(e) && e.status === 404) {
      notFound.value = true

      // The 404 may also mean we are no longer a member of the business (§3.3)
      business.refreshActive().catch(() => {})
    }
    else {
      capture(e)
    }
  }
  finally {
    if (seq === requestSeq)
      isLoading.value = false
  }
}

const onRenamed = (summary: CustomerSummary) => {
  if (customer.value)
    customer.value = { ...customer.value, ...summary }
  renamed.value = true
}

watch(customerId, id => {
  // Empty while leaving to another route
  if (id)
    getData()
})

// The customer belongs to the business that was active: on a switch, go back to the list
watch(() => business.activeId, (id, previous) => {
  if (previous && id !== previous)
    router.replace('/empresa/clientes')
  else
    getData()
})
onMounted(getData)
</script>

<template>
  <div>
    <!-- Loading -->
    <template v-if="isLoading">
      <VSkeletonLoader
        type="list-item-avatar-three-line"
        rounded="xl"
        class="mb-4"
      />
      <VSkeletonLoader
        type="card"
        rounded="xl"
      />
    </template>

    <!-- Not available -->
    <VCard
      v-else-if="notFound"
      rounded="xl"
    >
      <VCardText class="pa-8 text-center">
        <VIcon
          icon="tabler-user-off"
          size="48"
          color="secondary"
          class="muted-icon mb-3"
        />
        <div class="text-body-1 font-weight-medium mb-1">
          Cliente no disponible
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Es posible que el cliente haya eliminado sus datos de tu negocio.
        </div>
        <VBtn
          variant="tonal"
          color="primary"
          rounded="xl"
          to="/empresa/clientes"
        >
          Ver clientes
        </VBtn>
      </VCardText>
    </VCard>

    <!-- Error -->
    <ApiErrorAlert
      v-else-if="error"
      :error="error"
    >
      <VBtn
        size="small"
        variant="text"
        class="mt-1 px-0"
        @click="getData"
      >
        Reintentar
      </VBtn>
    </ApiErrorAlert>

    <template v-else-if="customer">
      <!-- Profile card -->
      <VCard
        rounded="xl"
        class="mb-4"
      >
        <VCardText class="pa-5">
          <div class="d-flex align-center gap-4">
            <VAvatar
              color="primary"
              variant="tonal"
              size="64"
            >
              <span class="text-h6 font-weight-black">
                {{ initials(customer.displayName) }}
              </span>
            </VAvatar>
            <div class="flex-grow-1 min-width-0">
              <div class="d-flex align-center gap-2">
                <span class="text-h6 font-weight-black text-truncate">
                  {{ customer.displayName }}
                </span>
                <VChip
                  v-if="customer.isTest"
                  size="x-small"
                  color="info"
                  variant="tonal"
                >
                  Prueba
                </VChip>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ customer.phoneMasked }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                Cliente desde {{ formatInstant(customer.firstSeenAt, business.timezone) }}
                · {{ customer.source === 'counter' ? 'Alta en mostrador' : 'Se registró por su cuenta' }}
              </div>
            </div>
            <VBtn
              icon="tabler-edit"
              variant="text"
              size="small"
              aria-label="Cambiar nombre"
              @click="showRename = true"
            />
          </div>
        </VCardText>
      </VCard>

      <!-- Stats row -->
      <div class="stats-row mb-4">
        <VCard rounded="xl">
          <VCardText class="pa-4 text-center">
            <div class="text-h4 font-weight-black text-primary">
              {{ customer.totalStamps }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ customer.totalStamps === 1 ? 'sello' : 'sellos' }}
            </div>
          </VCardText>
        </VCard>
        <VCard rounded="xl">
          <VCardText class="pa-4 text-center">
            <div class="text-h4 font-weight-black text-success">
              {{ customer.totalRedemptions }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ customer.totalRedemptions === 1 ? 'canje' : 'canjes' }}
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

      <!-- Cards and cycles -->
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-cards"
          size="13"
          color="primary"
        />
        Tarjetas
      </div>

      <div
        v-if="customer.cards.length"
        class="d-flex flex-column gap-3 mb-5"
      >
        <CustomerCardCycles
          v-for="entry in customer.cards"
          :key="entry.card.id"
          :entry="entry"
          :timezone="business.timezone"
        />
      </div>
      <VCard
        v-else
        rounded="xl"
        class="mb-5"
      >
        <VCardText class="pa-6 text-center text-body-2 text-medium-emphasis">
          Sin tarjetas registradas
        </VCardText>
      </VCard>

      <!-- Recent events -->
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-history"
          size="13"
          color="primary"
        />
        Movimientos recientes
      </div>

      <CompanyVisitListItemFull
        v-if="customer.events.length"
        :events="customer.events"
        :card-names="cardNames"
        :timezone="business.timezone"
        hide-customer-link
      />
      <VCard
        v-else
        rounded="xl"
      >
        <VCardText class="pa-6 text-center text-body-2 text-medium-emphasis">
          Sin movimientos registrados
        </VCardText>
      </VCard>

      <div class="d-flex justify-center mt-4">
        <VBtn
          variant="tonal"
          color="primary"
          rounded="xl"
          append-icon="tabler-chevron-right"
          :to="`/empresa/visitas?customerId=${customer.id}`"
        >
          Ver todos los movimientos
        </VBtn>
      </div>

      <RenameCustomerDialog
        v-model="showRename"
        :business-id="business.activeId ?? ''"
        :customer-id="customer.id"
        :current-name="customer.displayName"
        @saved="onRenamed"
      />
    </template>

    <VSnackbar
      v-model="renamed"
      color="success"
      :timeout="2500"
    >
      Nombre actualizado
    </VSnackbar>
  </div>
</template>

<style lang="scss" scoped>
.stats-row {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
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

.muted-icon {
  opacity: 0.4;
}
</style>
