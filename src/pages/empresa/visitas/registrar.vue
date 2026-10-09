<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { listCards } from '@/api/endpoints/cards'
import { stamp as stampApi } from '@/api/endpoints/loyalty'
import { withIdempotency } from '@/api/idempotency'
import type { CounterEnrollResult, StampCard, StampRequest, StampResult } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import CounterCardPicker from '@/components/counter/CounterCardPicker.vue'
import CounterChooseCardDialog from '@/components/counter/CounterChooseCardDialog.vue'
import CounterEnrollDialog from '@/components/counter/CounterEnrollDialog.vue'
import CounterErrorAlert from '@/components/counter/CounterErrorAlert.vue'
import CounterManualInput from '@/components/counter/CounterManualInput.vue'
import CounterRecentsList from '@/components/counter/CounterRecentsList.vue'
import CounterRedeemDialog from '@/components/counter/CounterRedeemDialog.vue'
import CounterScanner from '@/components/counter/CounterScanner.vue'
import CounterSuccessScreen from '@/components/counter/CounterSuccessScreen.vue'
import { cardAvailability, parseCounterCode, redeemSummaryOf } from '@/components/counter/counter'
import type { CounterSuccessInfo, RedeemSummary } from '@/components/counter/counter'
import { useCounterError } from '@/components/counter/useCounterError'
import { isSameKeyRetriable, useRetriableAttempt } from '@/components/counter/useRetriableAttempt'
import type { IdempotentAttempt } from '@/components/counter/useRetriableAttempt'
import { useApiError } from '@/composables/useApiError'
import { addCounterRecent } from '@/composables/useCounterRecents'
import { useBusinessStore } from '@/stores/business'

// Counter ("mostrador", §4.B) for owners and cashiers: stamp by QR, customer code or phone,
// counter enroll, redeem and undo of recent movements.

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    requiresEntitlement: true,
  },
})

const business = useBusinessStore()

// ── Cards (§4.B.1) ─────────────────────────────────────────────
const cards = ref<StampCard[]>([])
const cardsLoading = ref(false)
const { error: cardsError, capture: captureCards, reset: resetCardsError } = useApiError()
const selectedCardId = ref<string | null>(null)

const stampableIds = computed(() => new Set(
  cards.value.filter(c => cardAvailability(c, business.timezone).stampable).map(c => c.id),
))

const selectedStampable = computed(() => !!selectedCardId.value && stampableIds.value.has(selectedCardId.value))

async function loadCards() {
  const businessId = business.activeId
  if (!businessId)
    return
  cardsLoading.value = true
  resetCardsError()
  try {
    cards.value = await listCards(businessId, 'published')
    if (selectedCardId.value && !stampableIds.value.has(selectedCardId.value))
      selectedCardId.value = null
    if (!selectedCardId.value && stampableIds.value.size === 1)
      selectedCardId.value = [...stampableIds.value][0]
  }
  catch (e) {
    // §3.3: a 404 on a business route means we are no longer a member (or it is gone)
    if (captureCards(e).error.status === 404)
      business.refreshActive().catch(() => {})
  }
  finally {
    cardsLoading.value = false
  }
}

watch(() => business.activeId, () => {
  selectedCardId.value = null
  loadCards()
}, { immediate: true })

// ── Stamp (§4.B.2) ─────────────────────────────────────────────
const CARD_ERRORS: string[] = ['CARD_NOT_ACTIVE', 'CARD_EXPIRED', 'CARD_NOT_STARTED']

const stamping = ref(false)
const { error: stampError, capture: captureStamp, reset: resetStamp } = useCounterError('stamp')

/** Stamp attempt that failed with a retriable error: "Reintentar" reuses its key and body (§1.8). */
const stampAttempt = useRetriableAttempt<StampRequest>()

watch(() => business.activeId, () => stampAttempt.clear())

const success = ref<CounterSuccessInfo | null>(null)
const manualInput = ref<InstanceType<typeof CounterManualInput> | null>(null)

/** Body of the last stamp attempt that hit REWARD_PENDING ("sellar esta visita" after the redeem). */
const pendingStampBody = ref<StampRequest | null>(null)

/** Phone of the last stamp that answered CUSTOMER_NOT_FOUND (prefills the enroll). */
const notFoundPhone = ref('')

const redeem = reactive({
  open: false,
  cycleId: null as string | null,
  code: null as string | null,
  summary: null as RedeemSummary | null,
  headline: 'completed' as 'completed' | 'pending' | 'list',
  offerStampAfter: false,
})

const chooseCard = reactive({ open: false, code: '' })

const enroll = reactive({ open: false, phone: '' })

const scanPaused = computed(() =>
  stamping.value || !!stampError.value || !!success.value || redeem.open || chooseCard.open || enroll.open,
)

function openRedeem(opts: { cycleId: string; code: string | null; summary: RedeemSummary | null; headline: 'completed' | 'pending'; offerStampAfter: boolean }) {
  Object.assign(redeem, opts, { open: true })
}

// Reward from the stamp response; color and icon from the published cards already loaded.
function cardLookOf(card: { id: string; reward: string }) {
  const full = cards.value.find(c => c.id === card.id)

  return { reward: card.reward, primaryColor: full?.primaryColor, iconUrl: full?.iconUrl }
}

function onStamped(res: StampResult, redeemCode: string | null) {
  if (business.activeId) {
    addCounterRecent({
      businessId: business.activeId,
      eventId: res.event.id,
      cycleId: res.cycle.id,
      type: 'stamp',
      customerName: res.customer.displayName,
      cardName: res.card.name,
    })
  }

  if (res.justCompleted) {
    openRedeem({
      cycleId: res.cycle.id,
      code: redeemCode,
      summary: redeemSummaryOf(res),
      headline: 'completed',
      offerStampAfter: false,
    })

    return
  }

  success.value = {
    title: '¡Sello registrado!',
    customerName: res.customer.displayName,
    cardName: res.card.name,
    stampsCount: res.cycle.stampsCount,
    requiredStamps: res.cycle.requiredStamps,
    isTest: res.cycle.isTest,
    ...cardLookOf(res.card),
  }
}

async function stamp(request: StampRequest, retrying?: IdempotentAttempt<StampRequest>) {
  const businessId = business.activeId
  if (!businessId || stamping.value)
    return

  resetStamp()
  stamping.value = true

  // One key per logical attempt. "Reintentar" — or re-sending the same request shortly after a
  // network error / 429 / CONFLICT retry — reuses the pending key and body object (§1.8), so it
  // is never stamped twice.
  const attempt = retrying?.target === businessId ? retrying : stampAttempt.begin(businessId, request)
  const body = attempt.body

  try {
    const res = await withIdempotency(key => stampApi(businessId, body, key), { key: attempt.key })

    stampAttempt.clear()
    manualInput.value?.reset()
    onStamped(res, body.code ?? null)
  }
  catch (e) {
    const { error: err } = captureStamp(e)
    const pendingCycleId = err.detailObj?.cycleId

    stampAttempt.fail(attempt, err)

    if (err.code === 'REWARD_PENDING' && pendingCycleId) {
      // Redeem first (with the scanned code), then offer stamping this visit
      resetStamp()
      pendingStampBody.value = body
      openRedeem({ cycleId: pendingCycleId, code: body.code ?? null, summary: null, headline: 'pending', offerStampAfter: true })
    }
    else if (err.code === 'CUSTOMER_NOT_FOUND') {
      notFoundPhone.value = body.phone ?? ''
    }
    else if (err.code === 'NOT_FOUND') {
      // The card is not of this business anymore, or we are no longer a member (§3.3)
      loadCards()
      business.refreshActive().catch(() => {})
    }
    else if (CARD_ERRORS.includes(err.code)) {
      loadCards()
    }
  }
  finally {
    stamping.value = false
  }
}

/** Retry the failed attempt with the same key and body. */
function retryStamp() {
  const attempt = stampAttempt.pending.value
  if (attempt)
    stamp(attempt.body, attempt)
}

/** "Cerrar" / "Escanear otro": the cashier gave up on the attempt, the next stamp gets a new key (§1.8). */
function dismissStampError() {
  resetStamp()
  stampAttempt.clear()
}

const canRetryStamp = computed(() =>
  !!stampAttempt.pending.value && !!stampError.value && isSameKeyRetriable(stampError.value.error),
)

// The scanner restarts detection when it resumes, so a QR still in front of the camera after
// closing a result would be read again: ignore the same text for a moment after a read / resume.
const SAME_CODE_GRACE_MS = 3000
let lastRaw = ''
let lastRawAt = 0

watch(scanPaused, paused => {
  if (!paused)
    lastRawAt = Date.now()
})

function onDetect(raw: string) {
  if (scanPaused.value)
    return

  const now = Date.now()
  if (raw === lastRaw && now - lastRawAt < SAME_CODE_GRACE_MS) {
    lastRawAt = now

    return
  }
  lastRaw = raw
  lastRawAt = now

  const parsed = parseCounterCode(raw)

  if (parsed.kind === 'invalid') {
    captureStamp(parsed.error)

    return
  }
  if (parsed.kind === 'card') {
    stamp({ code: parsed.code })

    return
  }
  if (selectedStampable.value && selectedCardId.value) {
    stamp({ code: parsed.code, cardId: selectedCardId.value })

    return
  }
  chooseCard.code = parsed.code
  chooseCard.open = true
}

function onChooseCard(cardId: string) {
  selectedCardId.value = cardId
  stamp({ code: chooseCard.code, cardId })
}

function onManual(input: { kind: 'code'; code: string } | { kind: 'phone'; phone: string }) {
  const cardId = selectedCardId.value
  if (!cardId || !selectedStampable.value)
    return
  stamp(input.kind === 'code' ? { code: input.code, cardId } : { phone: input.phone, cardId })
}

function onStampAgain() {
  const body = pendingStampBody.value

  pendingStampBody.value = null

  // New logical attempt: new key (withIdempotency) and a fresh body object
  if (body)
    stamp({ ...body })
}

const isCardError = computed(() => !!stampError.value && CARD_ERRORS.includes(stampError.value.error.code))

// ── Enroll (§4.B.3) ────────────────────────────────────────────
function openEnroll(phone = '') {
  resetStamp()
  enroll.phone = phone
  enroll.open = true
}

function onEnrolled(res: CounterEnrollResult) {
  const s = res.stamp
  if (s) {
    onStamped(s, null)
    if (s.justCompleted)
      return
  }

  success.value = {
    title: res.isNew ? 'Cliente registrado en tu negocio' : 'Cliente ya registrado',
    subtitle: s ? 'Sello acreditado' : res.isNew ? 'Ya puede acumular sellos en tus tarjetas.' : 'No se acreditó sello en esta visita.',
    customerName: res.customer.displayName,
    cardName: s?.card.name,
    stampsCount: s?.cycle.stampsCount,
    requiredStamps: s?.cycle.requiredStamps,
    isTest: res.customer.isTest,
    ...(s ? cardLookOf(s.card) : {}),
  }
}

function onEnrollRedeemPending(cycleId: string) {
  openRedeem({ cycleId, code: null, summary: null, headline: 'pending', offerStampAfter: false })
}
</script>

<template>
  <div>
    <!-- Card to stamp -->
    <VCard
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="pa-4">
        <ApiErrorAlert
          :error="cardsError"
          class="mb-3"
        >
          <VBtn
            size="small"
            variant="tonal"
            color="error"
            class="mt-2"
            :loading="cardsLoading"
            @click="loadCards"
          >
            Reintentar
          </VBtn>
        </ApiErrorAlert>

        <CounterCardPicker
          v-model="selectedCardId"
          :cards="cards"
          :loading="cardsLoading"
          :time-zone="business.timezone"
        />
        <div class="text-caption text-medium-emphasis mt-2">
          Con el QR de una tarjeta no hace falta elegirla.
        </div>

        <VAlert
          v-if="!cardsLoading && !cardsError && cards.length === 0"
          color="info"
          variant="tonal"
          rounded="lg"
          density="compact"
          class="mt-3"
        >
          No hay tarjetas publicadas.
          <RouterLink
            v-if="business.isOwner"
            to="/empresa/tarjetas"
          >
            Publica una tarjeta
          </RouterLink>
          <span v-else>Pídele al dueño que publique una.</span>
        </VAlert>
      </VCardText>
    </VCard>

    <!-- Scanner -->
    <CounterScanner
      :paused="scanPaused"
      class="mb-4"
      @detect="onDetect"
    />

    <VProgressLinear
      v-if="stamping"
      indeterminate
      color="primary"
      rounded
      class="mb-4"
    />

    <CounterErrorAlert
      :error="stampError"
      class="mb-4"
    >
      <VBtn
        v-if="stampError?.error.code === 'CUSTOMER_NOT_FOUND'"
        size="small"
        variant="flat"
        color="primary"
        prepend-icon="tabler-user-plus"
        @click="openEnroll(notFoundPhone)"
      >
        Registrar cliente
      </VBtn>
      <VBtn
        v-if="canRetryStamp"
        size="small"
        variant="flat"
        color="primary"
        prepend-icon="tabler-refresh"
        :loading="stamping"
        @click="retryStamp"
      >
        Reintentar
      </VBtn>
      <VBtn
        v-if="isCardError"
        size="small"
        variant="tonal"
        color="primary"
        prepend-icon="tabler-gift"
        to="/empresa/recompensas"
      >
        Recompensas pendientes
      </VBtn>
      <VBtn
        size="small"
        variant="text"
        color="secondary"
        @click="dismissStampError"
      >
        {{ stampError?.error.code === 'INVALID_QR' ? 'Escanear otro' : 'Cerrar' }}
      </VBtn>
    </CounterErrorAlert>

    <!-- Manual input -->
    <div class="d-flex align-center gap-3 mb-4">
      <VDivider />
      <span class="text-caption text-medium-emphasis text-no-wrap">
        o ingresa manualmente
      </span>
      <VDivider />
    </div>

    <CounterManualInput
      ref="manualInput"
      class="mb-4"
      :loading="stamping"
      :needs-card="!selectedStampable"
      @submit="onManual"
    />

    <div class="mb-6">
      <VBtn
        size="small"
        variant="tonal"
        rounded="xl"
        prepend-icon="tabler-user-plus"
        @click="openEnroll"
      >
        Registrar cliente nuevo
      </VBtn>
    </div>

    <CounterRecentsList />

    <!-- Dialogs -->
    <CounterChooseCardDialog
      v-model="chooseCard.open"
      :cards="cards"
      :time-zone="business.timezone"
      :initial-card-id="selectedCardId"
      @choose="onChooseCard"
    />

    <CounterEnrollDialog
      v-model="enroll.open"
      :cards="cards"
      :cards-loading="cardsLoading"
      :initial-phone="enroll.phone"
      :initial-card-id="selectedStampable ? selectedCardId : null"
      @enrolled="onEnrolled"
      @redeem-pending="onEnrollRedeemPending"
      @cards-stale="loadCards"
    />

    <CounterRedeemDialog
      v-model="redeem.open"
      :cycle-id="redeem.cycleId"
      :code="redeem.code"
      :summary="redeem.summary"
      :headline="redeem.headline"
      :offer-stamp-after="redeem.offerStampAfter"
      @stamp-again="onStampAgain"
    />

    <CounterSuccessScreen
      :info="success"
      @close="success = null"
    />
  </div>
</template>
