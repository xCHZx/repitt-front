<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CounterErrorAlert from './CounterErrorAlert.vue'
import { redeemSummaryOf } from './counter'
import type { RedeemSummary } from './counter'
import { useCounterError } from './useCounterError'
import { isSameKeyRetriable, useRetriableAttempt } from './useRetriableAttempt'
import { getCycle, redeemCycle } from '@/api/endpoints/loyalty'
import { withIdempotency } from '@/api/idempotency'
import type { Cycle, RedeemResult } from '@/api/types'
import { addCounterRecent } from '@/composables/useCounterRecents'
import { useBusinessStore } from '@/stores/business'

// Redeem a completed cycle (§4.B.4). Paths:
//  - 'completed': right after a stamp with justCompleted, with the scanned code (none after a phone stamp)
//  - 'pending':   409 REWARD_PENDING while stamping, with the scanned code; offers "sellar esta visita"
//  - 'list':      pending list / cycle detail, without body
// One Idempotency-Key per tap of "Canjear"; retries of that tap reuse key and body.

const props = withDefaults(defineProps<{
  cycleId: string | null
  code?: string | null
  summary?: RedeemSummary | null
  headline?: 'completed' | 'pending' | 'list'
  offerStampAfter?: boolean
}>(), {
  code: null,
  summary: null,
  headline: 'list',
  offerStampAfter: false,
})

const emit = defineEmits<{
  redeemed: [result: RedeemResult]
  stampAgain: []

  /** The cycle changed elsewhere (already redeemed, gone…): reload lists. */
  changed: []
}>()

const open = defineModel<boolean>({ default: false })

const business = useBusinessStore()
const { error, capture, reset } = useCounterError('redeem')

const info = ref<RedeemSummary | null>(null)
const status = ref<Cycle['status'] | null>(null)
const loading = ref(false)
const redeeming = ref(false)
const result = ref<RedeemResult | null>(null)

/** Redeem that failed with a retriable error: tapping again reuses its key and body (§1.8). */
const attempts = useRetriableAttempt<{ code: string } | undefined>()

const canRetry = computed(() =>
  !!attempts.pending.value && !!error.value && isSameKeyRetriable(error.value.error),
)

const canRedeem = computed(() => !!info.value && status.value === 'completed' && !result.value)

const statusNotice = computed(() => {
  if (status.value === 'redeemed')
    return 'Esta recompensa ya se canjeó.'
  if (status.value === 'open')
    return 'Este ciclo todavía no está completo.'

  return null
})

const TITLES = {
  completed: { title: '¡Tarjeta completada!', text: 'Entrega la recompensa ahora o déjala pendiente para otra visita.' },
  pending: { title: 'Recompensa pendiente', text: 'El cliente tiene una recompensa de esta tarjeta. Canjéala antes de seguir sellando.' },
  list: { title: 'Canjear recompensa', text: 'Confirma que vas a entregar la recompensa.' },
} as const

const heading = computed(() => TITLES[props.headline])

async function loadCycle() {
  if (!props.cycleId || !business.activeId)
    return
  loading.value = true
  try {
    const detail = await getCycle(business.activeId, props.cycleId)

    info.value = redeemSummaryOf(detail)
    status.value = detail.cycle.status
  }
  catch (e) {
    // §3.3: a child 404 may also mean we are no longer a member
    if (capture(e).error.code === 'NOT_FOUND')
      business.refreshActive().catch(() => {})
  }
  finally {
    loading.value = false
  }
}

watch(open, isOpen => {
  if (!isOpen)
    return
  reset()
  result.value = null
  info.value = props.summary
  status.value = props.summary ? 'completed' : null
  if (!props.summary)
    loadCycle()
}, { immediate: true })

async function redeem() {
  const businessId = business.activeId
  const cycleId = props.cycleId
  if (!businessId || !cycleId || redeeming.value)
    return

  reset()
  redeeming.value = true

  // One key per tap; tapping again after a network error / 429 / CONFLICT retry repeats the
  // same attempt (same key, same body object — §1.8), so the reward is never redeemed twice.
  const attempt = attempts.begin(cycleId, props.code ? { code: props.code } : undefined)
  const body = attempt.body

  try {
    const res = await withIdempotency(key => redeemCycle(businessId, cycleId, key, body), { key: attempt.key })

    attempts.clear()
    result.value = res
    status.value = res.cycle.status
    addCounterRecent({
      businessId,
      eventId: res.event.id,
      cycleId: res.cycle.id,
      type: 'redeem',
      customerName: res.customer.displayName,
      cardName: res.card.name,
    })
    emit('redeemed', res)
  }
  catch (e) {
    const { error: err } = capture(e)

    attempts.fail(attempt, err)

    if (err.code === 'ALREADY_REDEEMED' || err.code === 'NOT_COMPLETED') {
      emit('changed')
      await loadCycle()
      capture(e)
    }
    else if (err.code === 'NOT_FOUND') {
      // The cycle is gone, or we are no longer a member (§3.3)
      emit('changed')
      business.refreshActive().catch(() => {})
    }
  }
  finally {
    redeeming.value = false
  }
}

function close() {
  open.value = false
}

function stampAgain() {
  open.value = false
  emit('stampAgain')
}
</script>

<template>
  <VDialog
    v-model="open"
    max-width="440"
    :persistent="redeeming"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <!-- Done -->
        <template v-if="result">
          <div class="text-center">
            <VAvatar
              color="success"
              variant="tonal"
              size="72"
              class="mb-4"
            >
              <VIcon
                icon="tabler-gift"
                size="40"
              />
            </VAvatar>
            <div class="text-h6 font-weight-bold mb-1">
              ¡Recompensa canjeada!
            </div>
            <div class="text-body-1 font-weight-medium mb-1">
              {{ result.card.reward }}
            </div>
            <div class="text-body-2 text-medium-emphasis mb-5">
              {{ result.customer.displayName }} · {{ result.card.name }}
            </div>
          </div>

          <div class="d-flex flex-column gap-2">
            <VBtn
              v-if="props.offerStampAfter"
              block
              color="primary"
              rounded="xl"
              prepend-icon="tabler-rosette-discount-check"
              @click="stampAgain"
            >
              Sellar esta visita
            </VBtn>
            <VBtn
              block
              :variant="props.offerStampAfter ? 'tonal' : 'flat'"
              :color="props.offerStampAfter ? 'secondary' : 'primary'"
              rounded="xl"
              @click="close"
            >
              Listo
            </VBtn>
          </div>
        </template>

        <!-- Confirm -->
        <template v-else>
          <div class="text-center mb-4">
            <VAvatar
              color="warning"
              variant="tonal"
              size="64"
              class="mb-3"
            >
              <VIcon
                icon="tabler-trophy"
                size="34"
              />
            </VAvatar>
            <div class="text-h6 font-weight-bold mb-1">
              {{ heading.title }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ heading.text }}
            </div>
          </div>

          <VSkeletonLoader
            v-if="loading"
            type="list-item-two-line"
            class="mb-4"
          />

          <div
            v-else-if="info"
            class="counter-reward-box mb-4"
          >
            <div class="text-caption text-medium-emphasis">
              Recompensa
            </div>
            <div class="text-body-1 font-weight-bold mb-2">
              {{ info.reward }}
            </div>
            <div class="d-flex align-center gap-2 text-body-2">
              <VIcon
                icon="tabler-user"
                size="16"
              />
              <span class="text-truncate">{{ info.customerName }}</span>
              <VChip
                v-if="info.isTest"
                size="x-small"
                color="info"
                variant="tonal"
              >
                Prueba
              </VChip>
            </div>
            <div class="d-flex align-center gap-2 text-body-2 text-medium-emphasis mt-1">
              <VIcon
                icon="tabler-cards"
                size="16"
              />
              <span class="text-truncate">{{ info.cardName }}</span>
            </div>
          </div>

          <VAlert
            v-if="statusNotice && !error"
            color="info"
            variant="tonal"
            rounded="lg"
            density="compact"
            class="mb-4"
          >
            {{ statusNotice }}
          </VAlert>

          <CounterErrorAlert
            :error="error"
            class="mb-4"
          />

          <div class="d-flex gap-2">
            <VBtn
              variant="tonal"
              color="secondary"
              rounded="xl"
              class="flex-1-1"
              :disabled="redeeming"
              @click="close"
            >
              {{ props.headline === 'list' ? 'Cancelar' : 'Más tarde' }}
            </VBtn>
            <VBtn
              v-if="canRedeem"
              color="success"
              rounded="xl"
              class="flex-1-1"
              :prepend-icon="canRetry ? 'tabler-refresh' : 'tabler-gift'"
              :loading="redeeming"
              @click="redeem"
            >
              {{ canRetry ? 'Reintentar' : 'Canjear' }}
            </VBtn>
          </div>
        </template>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.counter-reward-box {
  border: 1px solid rgba(var(--v-theme-warning), 0.35);
  border-radius: 12px;
  background: rgba(var(--v-theme-warning), 0.06);
  padding-block: 12px;
  padding-inline: 16px;
}
</style>
