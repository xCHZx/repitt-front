<script setup lang="ts">
import { getBilling } from '@/api/endpoints/billing'
import type { ApiErrorCode } from '@/api/errors'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

definePage({ meta: { layout: 'company', area: 'business', ownerOnly: true } })

// Stripe success return: /empresa/planes/gracias?businessId=<id> (guide §4.A.10).
// Landing here grants nothing: poll GET …/billing until the backend confirms `subscribed`.

const POLL_INTERVAL_MS = 3000
const POLL_MAX_MS = 60_000

type Phase = 'confirming' | 'confirmed' | 'pending' | 'otherBusiness'

const route = useRoute()
const business = useBusinessStore()
const { error, capture, reset } = useApiError()

const phase = ref<Phase>('confirming')
const isChecking = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null
let stopped = false

function stopPolling() {
  stopped = true
  if (timer)
    clearTimeout(timer)
  timer = null
}

/** Errors worth another poll; anything else (403, 404, cancelled step-up…) won't fix itself. */
const TRANSIENT_CODES: ApiErrorCode[] = ['NETWORK', 'INTERNAL_ERROR', 'RATE_LIMITED', 'CONFLICT', 'NOT_READY']

type CheckResult = 'confirmed' | 'notYet' | 'failed'

/** One GET …/billing. */
async function check(businessId: string): Promise<CheckResult> {
  try {
    const billing = await getBilling(businessId)

    reset()

    return billing.entitlement.reason === 'subscribed' ? 'confirmed' : 'notYet'
  }
  catch (e) {
    const { error: described } = capture(e)

    return TRANSIENT_CODES.includes(described.code) ? 'notYet' : 'failed'
  }
}

async function onConfirmed() {
  phase.value = 'confirmed'
  try {
    await business.refreshActive()
  }
  catch {
    // The billing state is already confirmed; the business is re-read on the next navigation.
  }
}

async function poll(businessId: string, deadline: number) {
  if (stopped)
    return
  const result = await check(businessId)
  if (stopped)
    return
  if (result === 'confirmed') {
    await onConfirmed()

    return
  }

  // Non-transient error or time is up: show the error (if any) and "Revisar de nuevo".
  if (result === 'failed' || Date.now() + POLL_INTERVAL_MS > deadline) {
    stopPolling()
    phase.value = 'pending'

    return
  }
  timer = setTimeout(() => poll(businessId, deadline), POLL_INTERVAL_MS)
}

async function checkAgain() {
  const businessId = business.activeId
  if (!businessId)
    return

  isChecking.value = true
  try {
    if (await check(businessId) === 'confirmed')
      await onConfirmed()
  }
  finally {
    isChecking.value = false
  }
}

onMounted(() => {
  const businessId = business.activeId
  const queryBusinessId = typeof route.query.businessId === 'string' ? route.query.businessId : null

  // The guard selects ?businessId only when the user is a member: otherwise don't poll another business.
  if (!businessId || (queryBusinessId && queryBusinessId !== businessId)) {
    phase.value = 'otherBusiness'

    return
  }

  poll(businessId, Date.now() + POLL_MAX_MS)
})

onBeforeUnmount(stopPolling)

const COPY: Record<Phase, { title: string; text: string }> = {
  confirming: { title: 'Confirmando tu pago…', text: 'Estamos confirmando tu pago con Stripe. Solo tomará unos segundos.' },
  confirmed: { title: '¡Tu suscripción está activa!', text: 'Ya tienes acceso completo a Repitt. Gracias por confiar en nosotros.' },
  pending: { title: 'Seguimos confirmando tu pago', text: 'Stripe aún no nos confirma el pago. Puede tardar unos minutos; no necesitas pagar de nuevo.' },
  otherBusiness: { title: 'No pudimos revisar este pago', text: 'El pago es de un negocio que no está disponible con esta cuenta. Inicia sesión con la cuenta dueña del negocio.' },
}

const copy = computed(() => COPY[phase.value])

const nextLink = computed(() => phase.value === 'pending'
  ? { to: '/empresa/planes', label: 'Ver mi plan' }
  : { to: '/empresa', label: 'Ir al inicio' })
</script>

<template>
  <div class="gracias-page">
    <div class="gracias-inner">
      <div class="gracias-icon">
        <VProgressCircular
          v-if="phase === 'confirming'"
          indeterminate
          color="white"
          size="48"
        />
        <VIcon
          v-else
          :icon="phase === 'confirmed' ? 'tabler-crown' : 'tabler-clock'"
          size="48"
          color="white"
        />
      </div>

      <h1 class="gracias-title">
        {{ copy.title }}
      </h1>
      <p class="gracias-subtitle">
        {{ copy.text }}
      </p>

      <ApiErrorAlert
        v-if="phase === 'pending'"
        :error="error"
        class="gracias-alert"
      />

      <VBtn
        v-if="phase === 'pending'"
        color="white"
        variant="elevated"
        size="large"
        rounded="lg"
        class="gracias-btn mb-3"
        :loading="isChecking"
        @click="checkAgain"
      >
        <VIcon
          icon="tabler-refresh"
          start
        />
        Revisar de nuevo
      </VBtn>

      <VBtn
        v-if="phase !== 'confirming'"
        :color="phase === 'confirmed' ? 'white' : undefined"
        :variant="phase === 'confirmed' ? 'elevated' : 'outlined'"
        size="large"
        rounded="lg"
        class="gracias-btn"
        :class="{ 'gracias-btn--outlined': phase !== 'confirmed' }"
        :to="nextLink.to"
      >
        {{ nextLink.label }}
        <VIcon
          icon="tabler-arrow-right"
          end
        />
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gracias-page {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: linear-gradient(160deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  margin-block: 8px;
  min-block-size: calc(100dvh - 200px);
  padding-block: 40px;
}

.gracias-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fade-up 0.5s ease both;
  inline-size: 100%;
  max-inline-size: 360px;
  padding-inline: 24px;
  text-align: center;
}

.gracias-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  background: rgb(255 255 255 / 20%);
  block-size: 96px;
  inline-size: 96px;
  margin-block-end: 24px;
}

.gracias-title {
  animation: fade-up 0.5s ease 0.2s both;
  color: white;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-block-end: 12px;
}

.gracias-subtitle {
  animation: fade-up 0.5s ease 0.3s both;
  color: rgb(255 255 255 / 80%);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-block-end: 28px;
}

.gracias-alert {
  inline-size: 100%;
  margin-block-end: 16px;
  text-align: start;
}

.gracias-btn {
  animation: fade-up 0.5s ease 0.4s both;
  color: rgb(var(--v-theme-primary));
  inline-size: 100%;

  &--outlined {
    color: white;
  }
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
