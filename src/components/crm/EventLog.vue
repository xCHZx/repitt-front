<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { isUuid } from './eventLabels'
import type { CardOption, EventFilterValue } from './eventLabels'
import EventFilters from './EventFilters.vue'
import { useListRetry } from './useListRetry'
import { listCards } from '@/api/endpoints/cards'
import { listEvents } from '@/api/endpoints/crm'
import type { StampCard } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import CompanyVisitListItemFull from '@/components/visits/CompanyVisitListItemFull.vue'
import { useCursorList } from '@/composables/useCursorList'
import { useBusinessStore } from '@/stores/business'

// Owner event log ("bitácora", guide §4.A.8): filters + cursor list of LoyaltyEventDto.

interface Props {

  /** Card event log: the list is always filtered by this card. */
  fixedCardId?: string
  initialCustomerId?: string
  initialCardId?: string
}

const props = defineProps<Props>()
const business = useBusinessStore()

const fixedCardId = isUuid(props.fixedCardId) ? props.fixedCardId : undefined

const filters = ref<EventFilterValue>({
  type: null,
  cardId: isUuid(props.initialCardId) ? props.initialCardId : null,
  from: '',
  to: '',
})

const customerId = ref<string | null>(isUuid(props.initialCustomerId) ? props.initialCustomerId : null)
const showFilters = ref(!!filters.value.cardId)

// Cards (current + archived) to name each event and to fill the card filter
const cards = shallowRef<StampCard[]>([])
const cardsLoading = ref(false)

const loadCards = async () => {
  const businessId = business.activeId
  if (!businessId)
    return
  cardsLoading.value = true

  const [current, archived] = await Promise.allSettled([listCards(businessId), listCards(businessId, 'archived')])

  cards.value = [
    ...(current.status === 'fulfilled' ? current.value : []),
    ...(archived.status === 'fulfilled' ? archived.value : []),
  ]
  cardsLoading.value = false
}

const cardNames = computed(() => Object.fromEntries(cards.value.map(c => [c.id, c.name])))

const cardOptions = computed<CardOption[]>(() => cards.value.map(c => ({
  value: c.id,
  title: c.status === 'archived' ? `${c.name} (archivada)` : c.name,
})))

const localErrors = computed<Record<string, string | undefined>>(() => {
  const { from, to } = filters.value

  return from && to && to < from ? { to: 'La fecha final debe ser posterior a la inicial.' } : {}
})

const list = useCursorList(cursor => listEvents(business.activeId as string, {
  type: filters.value.type ?? undefined,
  cardId: fixedCardId ?? filters.value.cardId ?? undefined,
  customerId: customerId.value ?? undefined,
  from: filters.value.from || undefined,
  to: filters.value.to || undefined,
  cursor,
  limit: 25,
}))

const { items, loading, loaded, error, hasMore, isEmpty: listEmpty } = list

const fieldErrors = computed(() => ({ ...error.value?.fieldErrors, ...localErrors.value }))

const activeFilterCount = computed(() => {
  const f = filters.value

  return [f.type, fixedCardId ? null : f.cardId, f.from, f.to].filter(Boolean).length
})

const hasFilters = computed(() => activeFilterCount.value > 0 || !!customerId.value)

const customerLabel = computed(() => {
  const match = items.value.find(e => e.customer.id === customerId.value)

  return match ? match.customer.displayName : 'un cliente'
})

const { reload: reloadList, loadMore, retry, showRows } = useListRetry(list)

const rangeInvalid = computed(() => Object.keys(localErrors.value).length > 0)

const filtersClear = () => {
  const f = filters.value

  return !f.type && !f.cardId && !f.from && !f.to && !customerId.value
}

const clearFilters = () => {
  if (filtersClear())
    return
  filters.value = { type: null, cardId: null, from: '', to: '' }
  customerId.value = null
}

const reload = () => {
  if (!rangeInvalid.value)
    reloadList()
}

watch([filters, customerId], reload, { deep: true })

// Business switch: old filters (card / customer ids) belong to the previous business.
// Clearing them fires the filters watcher, which reloads; reload here only when nothing changed.
// The fixed-card page leaves on its own (the card belongs to the previous business).
watch(() => business.activeId, (id, previous) => {
  if (!id)
    return
  loadCards()
  if (!previous) {
    reload()

    return
  }
  if (fixedCardId)
    return
  if (filtersClear())
    reload()
  else
    clearFilters()
})

onMounted(() => {
  if (!business.activeId)
    return
  loadCards()
  reload()
})
</script>

<template>
  <div>
    <!-- Filters -->
    <div class="d-flex align-center flex-wrap gap-2 mb-3">
      <VBtn
        variant="tonal"
        color="primary"
        size="small"
        rounded="xl"
        prepend-icon="tabler-filter"
        @click="showFilters = !showFilters"
      >
        Filtros
        <VBadge
          v-if="activeFilterCount"
          :content="activeFilterCount"
          color="primary"
          inline
        />
      </VBtn>
      <VChip
        v-if="customerId"
        size="small"
        color="primary"
        variant="tonal"
        closable
        @click:close="customerId = null"
      >
        Cliente: {{ customerLabel }}
      </VChip>
      <VBtn
        v-if="hasFilters"
        variant="text"
        size="small"
        @click="clearFilters"
      >
        Limpiar
      </VBtn>
    </div>

    <!-- Sin animación de despliegue: el panel aparece en su estado final (guía §7) -->
    <VCard
      v-show="showFilters"
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="pa-4">
        <EventFilters
          v-model="filters"
          :cards="cardOptions"
          :cards-loading="cardsLoading"
          :hide-card="!!fixedCardId"
          :field-errors="fieldErrors"
        />
      </VCardText>
    </VCard>

    <!-- Invalid range: nothing is queried until it is fixed -->
    <div
      v-if="rangeInvalid"
      class="d-flex flex-column align-start pa-8"
    >
      <VIcon
        icon="tabler-calendar-x"
        size="52"
        color="medium-emphasis"
        class="mb-3"
      />
      <div class="text-body-1 font-weight-bold mb-1">
        Corrige el rango de fechas
      </div>
      <div class="text-body-2 text-medium-emphasis">
        La fecha final debe ser posterior a la inicial
      </div>
    </div>

    <template v-else>
      <ApiErrorAlert
        :error="error"
        class="mb-4"
      >
        <VBtn
          size="small"
          variant="text"
          class="mt-1 px-0"
          @click="retry"
        >
          Reintentar
        </VBtn>
      </ApiErrorAlert>

      <!-- Skeleton -->
      <VSkeletonLoader
        v-if="loading && !items.length"
        type="list-item-avatar-three-line@4"
        rounded="xl"
      />

      <!-- Empty state -->
      <div
        v-else-if="listEmpty && !error"
        class="d-flex flex-column align-start pa-8"
      >
        <VIcon
          icon="tabler-history-off"
          size="52"
          color="medium-emphasis"
          class="mb-3"
        />
        <div class="text-body-1 font-weight-bold mb-1">
          {{ hasFilters ? 'Sin movimientos con estos filtros' : 'Sin movimientos registrados' }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ hasFilters ? 'Prueba con otros filtros' : 'Los sellos y canjes de tus clientes aparecerán aquí' }}
        </div>
      </div>

      <!-- List -->
      <template v-else-if="loaded && items.length && showRows">
        <VProgressLinear
          v-if="loading"
          indeterminate
          color="primary"
          rounded
          class="mb-2"
        />
        <CompanyVisitListItemFull
          :events="items"
          :card-names="cardNames"
          :timezone="business.timezone"
          :hide-customer-link="false"
        />
        <div
          v-if="hasMore"
          class="d-flex mt-4"
        >
          <VBtn
            variant="tonal"
            color="primary"
            rounded="xl"
            :loading="loading"
            @click="loadMore"
          >
            Cargar más
          </VBtn>
        </div>
      </template>
    </template>
  </div>
</template>
