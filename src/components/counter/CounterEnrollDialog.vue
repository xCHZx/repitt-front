<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CounterCardPicker from './CounterCardPicker.vue'
import CounterErrorAlert from './CounterErrorAlert.vue'
import { isStampPartError } from './counter'
import { useCounterError } from './useCounterError'
import { isSameKeyRetriable, useRetriableAttempt } from './useRetriableAttempt'
import type { IdempotentAttempt } from './useRetriableAttempt'
import { enrollCustomer } from '@/api/endpoints/loyalty'
import { withIdempotency } from '@/api/idempotency'
import type { CounterEnroll, CounterEnrollResult, StampCard } from '@/api/types'
import PrivacyNoticeShort from '@/components/common/PrivacyNoticeShort.vue'
import { useBusinessStore } from '@/stores/business'

// Counter enroll (§4.B.3): phone + name + consent (the cashier shows the short privacy notice),
// optionally stamping a card in the same call. If the stamp part fails, the whole enroll is
// reverted: "Registrar sin sellar" is a NEW attempt (new Idempotency-Key) without cardId.

const props = withDefaults(defineProps<{
  cards: StampCard[]
  cardsLoading?: boolean
  initialPhone?: string
  initialCardId?: string | null
}>(), {
  cardsLoading: false,
  initialPhone: '',
  initialCardId: null,
})

const emit = defineEmits<{
  enrolled: [result: CounterEnrollResult]

  /** REWARD_PENDING while stamping on enroll: redeem that cycle (no code). */
  redeemPending: [cycleId: string]

  /** The card list is stale (card paused / archived / not found). */
  cardsStale: []
}>()

const open = defineModel<boolean>({ default: false })

const business = useBusinessStore()
const { error, fieldErrors, capture, reset } = useCounterError('enroll')

const phone = ref('')
const displayName = ref('')
const cardId = ref<string | null>(null)
const consent = ref(false)
const submitting = ref(false)

/** The last failure was in the stamp part: offer registering without stamping. */
const stampFailed = ref(false)
const pendingCycleId = ref<string | null>(null)

/** Enroll that failed with a retriable error: "Reintentar" reuses its key and body (§1.8). */
const attempts = useRetriableAttempt<CounterEnroll>()

const canRetry = computed(() =>
  !!attempts.pending.value && !!error.value && isSameKeyRetriable(error.value.error),
)

watch(open, isOpen => {
  if (!isOpen)
    return
  phone.value = props.initialPhone
  displayName.value = ''
  cardId.value = props.initialCardId
  consent.value = false
  stampFailed.value = false
  pendingCycleId.value = null
  reset()
}, { immediate: true })

const nameTrimmed = computed(() => displayName.value.trim())

const canSubmit = computed(() =>
  phone.value.replace(/\D/g, '').length >= 10
  && nameTrimmed.value.length >= 1
  && nameTrimmed.value.length <= 100
  && consent.value,
)

const phoneError = computed(() =>
  fieldErrors.value.phone ?? (error.value?.error.code === 'INVALID_PHONE' ? error.value.message : undefined),
)

function submit(withCard: boolean) {
  const businessId = business.activeId
  if (!businessId || !canSubmit.value || submitting.value)
    return

  const sentCard = withCard ? cardId.value : null

  // One logical attempt = one key; the same request after a retriable failure reuses the
  // pending key and body object (§1.8), so a lost response never enrolls/stamps twice.
  send(businessId, attempts.begin(businessId, {
    phone: phone.value.trim(),
    displayName: nameTrimmed.value,
    consentAttested: true,
    ...(sentCard ? { cardId: sentCard } : {}),
  }))
}

/** Retry the failed attempt with the same key and body. */
function retry() {
  const businessId = business.activeId
  const attempt = attempts.pending.value
  if (businessId && attempt && !submitting.value)
    send(businessId, attempt)
}

async function send(businessId: string, attempt: IdempotentAttempt<CounterEnroll>) {
  const body = attempt.body

  reset()
  stampFailed.value = false
  pendingCycleId.value = null
  submitting.value = true

  try {
    const res = await withIdempotency(key => enrollCustomer(businessId, body, key), { key: attempt.key })

    attempts.clear()
    open.value = false
    emit('enrolled', res)
  }
  catch (e) {
    const { error: err } = capture(e)

    attempts.fail(attempt, err)

    if (body.cardId && isStampPartError(err))
      stampFailed.value = true
    if (err.code === 'REWARD_PENDING' && err.detailObj?.cycleId)
      pendingCycleId.value = err.detailObj.cycleId
    if (err.code === 'NOT_FOUND' || err.code.startsWith('CARD_'))
      emit('cardsStale')

    // The card is not of this business anymore, or we are no longer a member (§3.3)
    if (err.code === 'NOT_FOUND')
      business.refreshActive().catch(() => {})
  }
  finally {
    submitting.value = false
  }
}

/** New attempt (new key) without cardId after the stamp part failed. */
function registerWithoutStamp() {
  cardId.value = null
  submit(false)
}

function redeemPending() {
  const id = pendingCycleId.value
  if (!id)
    return
  open.value = false
  emit('redeemPending', id)
}
</script>

<template>
  <VDialog
    v-model="open"
    max-width="480"
    scrollable
    :persistent="submitting"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <div class="text-center mb-5">
          <VAvatar
            color="primary"
            variant="tonal"
            size="56"
            class="mb-3"
          >
            <VIcon
              icon="tabler-user-plus"
              size="28"
            />
          </VAvatar>
          <div class="text-h6 font-weight-bold mb-1">
            Registrar cliente
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Da de alta a tu cliente con su teléfono y, si quieres, séllalo en este momento.
          </div>
        </div>

        <form @submit.prevent="submit(true)">
          <VTextField
            v-model="phone"
            label="Teléfono"
            placeholder="55 1234 5678"
            prepend-inner-icon="tabler-phone"
            variant="outlined"
            type="tel"
            inputmode="tel"
            autocomplete="off"
            maxlength="20"
            class="mb-3"
            :error-messages="phoneError"
            hide-details="auto"
          />

          <VTextField
            v-model="displayName"
            label="Nombre del cliente"
            placeholder="Ana López"
            prepend-inner-icon="tabler-user"
            variant="outlined"
            maxlength="100"
            autocomplete="off"
            class="mb-3"
            :error-messages="fieldErrors.displayName"
            hide-details="auto"
          />

          <CounterCardPicker
            v-model="cardId"
            :cards="props.cards"
            :loading="props.cardsLoading"
            :time-zone="business.timezone"
            :error-messages="fieldErrors.cardId"
            label="Tarjeta a sellar (opcional)"
            clearable
            class="mb-4"
          />

          <div class="counter-privacy mb-2">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">
              Muestra este aviso a tu cliente
            </div>
            <PrivacyNoticeShort />
          </div>

          <VCheckbox
            v-model="consent"
            density="compact"
            hide-details
            class="mb-4"
            label="El cliente leyó y aceptó el aviso de privacidad"
          />

          <CounterErrorAlert
            :error="error"
            class="mb-4"
          >
            <VBtn
              v-if="canRetry"
              size="small"
              variant="flat"
              color="primary"
              prepend-icon="tabler-refresh"
              :loading="submitting"
              @click="retry"
            >
              Reintentar
            </VBtn>
            <VBtn
              v-if="stampFailed"
              size="small"
              variant="flat"
              color="primary"
              @click="registerWithoutStamp"
            >
              Registrar sin sellar
            </VBtn>
            <VBtn
              v-if="pendingCycleId"
              size="small"
              variant="tonal"
              color="success"
              prepend-icon="tabler-gift"
              @click="redeemPending"
            >
              Canjear recompensa
            </VBtn>
            <VBtn
              v-if="error?.error.code === 'CONFLICT' && error.error.detailCode === 'noPublishedCard' && business.isOwner"
              size="small"
              variant="tonal"
              color="primary"
              to="/empresa/tarjetas"
            >
              Ir a tarjetas
            </VBtn>
          </CounterErrorAlert>

          <div class="d-flex gap-2">
            <VBtn
              variant="tonal"
              color="secondary"
              rounded="xl"
              class="flex-1-1"
              :disabled="submitting"
              @click="open = false"
            >
              Cancelar
            </VBtn>
            <VBtn
              type="submit"
              color="primary"
              rounded="xl"
              class="flex-1-1"
              prepend-icon="tabler-user-check"
              :disabled="!canSubmit"
              :loading="submitting"
            >
              {{ cardId ? 'Registrar y sellar' : 'Registrar' }}
            </VBtn>
          </div>
        </form>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.counter-privacy {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding-block: 12px;
  padding-inline: 14px;
}
</style>
