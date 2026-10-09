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
  <!-- Banda tonal plana (guía §2.4), alineada a la izquierda y sin animación de entrada -->
  <div class="gracias-page section--tono">
    <div class="gracias-inner">
      <div class="gracias-icon">
        <VProgressCircular
          v-if="phase === 'confirming'"
          indeterminate
          color="primary"
          size="48"
        />
        <VIcon
          v-else
          :icon="phase === 'confirmed' ? 'tabler-crown' : 'tabler-clock'"
          size="48"
        />
      </div>

      <h1 class="titulo-display">
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
        size="large"
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
        :variant="phase === 'confirmed' ? 'flat' : 'outlined'"
        size="large"
        class="gracias-btn"
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
  border-radius: var(--r-superficie);
  margin-block: var(--s-2);
  min-block-size: calc(100dvh - 200px);
  padding-block: var(--s-6);
}

.gracias-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  inline-size: 100%;
  max-inline-size: 32em;
  padding-inline: var(--s-5);
}

.gracias-icon {
  display: flex;
  align-items: center;
  color: var(--acento);
  margin-block-end: var(--s-5);
}

.gracias-subtitle {
  color: var(--texto);
  font-size: var(--t-body);
  line-height: var(--lh-body);
  margin-block: var(--s-3) var(--s-5);
}

.gracias-alert {
  inline-size: 100%;
  margin-block-end: var(--s-4);
}

.gracias-btn {
  inline-size: 100%;
}
</style>
