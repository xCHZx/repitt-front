<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getCard } from '@/api/endpoints/cards'
import { getCycle } from '@/api/endpoints/loyalty'
import { isApiError } from '@/api/errors'
import type { CycleDetail, LoyaltyEvent, StampCard as StampCardDto } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import CounterCycleEvents from '@/components/counter/CounterCycleEvents.vue'
import CounterRedeemDialog from '@/components/counter/CounterRedeemDialog.vue'
import CounterVoidDialog from '@/components/counter/CounterVoidDialog.vue'
import StampCard from '@/components/stampCard/StampCard.vue'
import { CYCLE_STATUS, DEFAULT_CARD_COLOR, EVENT_LABELS, redeemSummaryOf } from '@/components/counter/counter'
import { useApiError } from '@/composables/useApiError'
import { useCounterRecents } from '@/composables/useCounterRecents'
import { useBusinessStore } from '@/stores/business'
import { formatDateTime } from '@/utils/dates'

// Cycle detail (§4.B.6): progress, status and events of one customer's cycle on one card.
// Redeem when completed (no code) and "Deshacer" on own recent events (§4.B.7).

definePage({
  meta: {
    layout: 'company',
    area: 'business',
  },
})

const route = useRoute()
const business = useBusinessStore()
const { now } = useCounterRecents()
const { error, capture, reset } = useApiError()

const cycleId = computed(() => {
  const v = (route.params as Record<string, string | string[] | undefined>).cycleId

  return Array.isArray(v) ? v[0] : v
})

const detail = ref<CycleDetail | null>(null)
const card = ref<StampCardDto | null>(null)
const loading = ref(false)
const notFound = ref(false)

async function loadCardStyle(businessId: string, cardId: string) {
  if (card.value?.id === cardId)
    return
  try {
    card.value = await getCard(businessId, cardId)
  }
  catch {
    // A cashier gets 404 for drafts / archived cards: default style
    card.value = null
  }
}

async function load() {
  const businessId = business.activeId
  const id = cycleId.value
  if (!businessId || !id)
    return
  loading.value = true
  reset()
  try {
    detail.value = await getCycle(businessId, id)
    notFound.value = false
    loadCardStyle(businessId, detail.value.card.id)
  }
  catch (e) {
    if (isApiError(e) && e.status === 404) {
      notFound.value = true
      detail.value = null

      // §3.3: a child 404 may also mean we are no longer a member
      business.refreshActive().catch(() => {})
    }
    else {
      capture(e)
    }
  }
  finally {
    loading.value = false
  }
}

watch([() => business.activeId, cycleId], load, { immediate: true })

const accent = computed(() => card.value?.primaryColor || DEFAULT_CARD_COLOR)
const status = computed(() => detail.value ? CYCLE_STATUS[detail.value.cycle.status] : null)

// Redeem
const redeemOpen = ref(false)

const summary = computed(() => (detail.value ? redeemSummaryOf(detail.value) : null))

// Undo
const voidOpen = ref(false)
const voidTarget = ref<LoyaltyEvent | null>(null)
const snackbar = ref(false)

function undo(e: LoyaltyEvent) {
  voidTarget.value = e
  voidOpen.value = true
}

function onVoided() {
  snackbar.value = true
  load()
}
</script>

<template>
  <div>
    <ApiErrorAlert
      :error="error"
      class="mb-4"
    >
      <VBtn
        size="small"
        variant="tonal"
        color="error"
        class="mt-2"
        :loading="loading"
        @click="load"
      >
        Reintentar
      </VBtn>
    </ApiErrorAlert>

    <!-- Not available -->
    <div
      v-if="notFound"
      class="d-flex flex-column align-center justify-center text-center pa-8"
    >
      <VIcon
        icon="tabler-cards-off"
        size="52"
        color="medium-emphasis"
        class="mb-3"
      />
      <div class="text-body-1 font-weight-bold mb-1">
        Este ciclo ya no está disponible
      </div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        El cliente pudo haber eliminado sus datos o dejado de participar en tu negocio.
      </div>
      <VBtn
        variant="tonal"
        rounded="xl"
        to="/empresa/recompensas"
      >
        Ver recompensas pendientes
      </VBtn>
    </div>

    <!-- Skeleton -->
    <template v-else-if="loading && !detail">
      <VSkeletonLoader
        type="card"
        rounded="xl"
        class="mb-4"
      />
      <VSkeletonLoader
        type="list-item-two-line@3"
        rounded="xl"
      />
    </template>

    <template v-else-if="detail">
      <!-- Summary -->
      <div class="cycle-head mb-4">
        <div class="flex-grow-1 overflow-hidden">
          <div class="text-h5 text-truncate">
            {{ detail.customer.displayName }}
          </div>
          <div class="text-body-2 text-medium-emphasis text-truncate">
            {{ detail.card.name }} · Ciclo {{ detail.cycle.cycleNumber }}
          </div>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <VChip
            v-if="detail.cycle.isTest"
            size="x-small"
          >
            Prueba
          </VChip>
          <VChip
            v-if="status"
            size="small"
          >
            {{ status.label }}
          </VChip>
        </div>
      </div>

      <StampCard
        :business-name="business.active?.name ?? ''"
        :logo-url="business.active?.logoUrl"
        :card-name="detail.card.name"
        :reward="detail.card.reward"
        :required-stamps="detail.cycle.requiredStamps"
        :stamps="detail.cycle.stampsCount"
        :color="accent"
        :status="detail.cycle.status"
        :icon-url="card?.iconUrl"
        class="mb-3"
      />

      <div class="note mb-4">
        <template v-if="detail.cycle.redeemedAt">
          Canjeado el {{ formatDateTime(detail.cycle.redeemedAt, business.timezone) }}
        </template>
        <template v-else-if="detail.cycle.completedAt">
          Completado el {{ formatDateTime(detail.cycle.completedAt, business.timezone) }}
        </template>
        <template v-else>
          Iniciado el {{ formatDateTime(detail.cycle.openedAt, business.timezone) }}
        </template>
      </div>

      <VBtn
        v-if="detail.cycle.status === 'completed'"
        block
        prepend-icon="tabler-gift"
        class="mb-6"
        @click="redeemOpen = true"
      >
        Canjear recompensa
      </VBtn>

      <!-- Events -->
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-history"
          size="15"
        />
        Movimientos
      </div>
      <CounterCycleEvents
        v-if="detail.events.length"
        :events="detail.events"
        :time-zone="business.timezone"
        :now="now"
        @undo="undo"
      />
      <div
        v-else
        class="text-body-2 text-medium-emphasis text-center pa-4"
      >
        Sin movimientos.
      </div>
    </template>

    <CounterRedeemDialog
      v-model="redeemOpen"
      :cycle-id="detail?.cycle.id ?? null"
      :summary="summary"
      headline="list"
      @redeemed="load"
      @changed="load"
    />

    <CounterVoidDialog
      v-model="voidOpen"
      :event-id="voidTarget?.id ?? null"
      :type="voidTarget?.type === 'redeem' ? 'redeem' : 'stamp'"
      :description="voidTarget ? `${EVENT_LABELS[voidTarget.type]} · ${formatDateTime(voidTarget.occurredAt, business.timezone)}` : undefined"
      @voided="onVoided"
      @changed="load"
    />

    <VSnackbar
      v-model="snackbar"
      color="success"
      :timeout="3000"
    >
      Movimiento deshecho
    </VSnackbar>
  </div>
</template>

<style scoped>
.cycle-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-3);
}
</style>
