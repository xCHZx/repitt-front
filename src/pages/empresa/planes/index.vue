<script setup lang="ts">
import { createCheckout, createPortal, getBilling } from '@/api/endpoints/billing'
import type { Billing, EntitlementReason } from '@/api/types'
import BillingStatusCard from '@/components/billing/BillingStatusCard.vue'
import PlanFeaturesCard from '@/components/billing/PlanFeaturesCard.vue'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

definePage({ meta: { layout: 'company', area: 'business', ownerOnly: true } })

// Billing for owners (guide §4.A.10). The state and the paywall come from `entitlement`
// (never from `subscription.status`). Checkout and portal URLs are opened right away, never stored.

/** Backend rule: a trial with at least 49 h 10 min left keeps its remaining days after checkout. */
const KEEP_TRIAL_MIN_MS = (49 * 60 + 10) * 60 * 1000

const CHECKOUT_REASONS: EntitlementReason[] = ['pre_trial', 'trial', 'trial_expired', 'subscription_ended']

const route = useRoute()
const router = useRouter()
const business = useBusinessStore()

// Stripe sends the owner back to /empresa/planes?businessId=<id> both when the checkout is cancelled
// and when leaving the portal, so a per-tab flag set before opening the checkout tells them apart.
const returnBusinessId = typeof route.query.businessId === 'string' ? route.query.businessId : null

const CHECKOUT_FLAG_PREFIX = 'repitt:checkoutStarted:'

function setCheckoutFlag(businessId: string) {
  try {
    sessionStorage.setItem(CHECKOUT_FLAG_PREFIX + businessId, '1')
  }
  catch {
    // Storage unavailable: the "payment not completed" note just won't show.
  }
}

/** Reads and clears the flag. */
function takeCheckoutFlag(businessId: string): boolean {
  try {
    const key = CHECKOUT_FLAG_PREFIX + businessId
    const wasSet = sessionStorage.getItem(key) !== null

    sessionStorage.removeItem(key)

    return wasSet
  }
  catch {
    return false
  }
}

/** True when the owner came back from a checkout they started (not from the portal) for the business on screen. */
const cameBackFromCheckout = ref(false)

const billing = ref<Billing | null>(null)
const isLoading = ref(true)
const isLoadingCheckout = ref(false)
const isLoadingPortal = ref(false)

/** Set after `409 SUBSCRIPTION_EXISTS` on checkout. */
const offerPortal = ref(false)

/** Set after `409 CONFLICT noBillingAccount` on the portal. */
const offerCheckout = ref(false)

const { error: loadError, capture: captureLoad, reset: resetLoad } = useApiError()
const { error: actionError, capture: captureAction, reset: resetAction } = useApiError()

const reason = computed(() => billing.value?.entitlement.reason ?? null)
const isSuspended = computed(() => reason.value === 'suspended')

const canCheckout = computed(() => {
  if (!reason.value || isSuspended.value || offerPortal.value)
    return false

  return CHECKOUT_REASONS.includes(reason.value) || offerCheckout.value
})

const canPortal = computed(() => {
  if (!reason.value || offerCheckout.value)
    return false

  return reason.value === 'subscribed' || reason.value === 'grace' || !!billing.value?.subscription || offerPortal.value
})

const checkoutIsPrimary = computed(() => reason.value !== 'pre_trial')
const portalIsPrimary = computed(() => reason.value === 'grace' || offerPortal.value)

const keepsTrialDays = computed(() => {
  const until = billing.value?.entitlement.until
  if (reason.value !== 'trial' || !until)
    return false

  return Date.parse(until) - Date.now() >= KEEP_TRIAL_MIN_MS
})

const showCheckoutNotCompleted = computed(() => cameBackFromCheckout.value && !!reason.value && reason.value !== 'subscribed')

/**
 * GET …/billing. `quiet` refreshes the status in place (no skeleton) and keeps the current data
 * if it fails, e.g. after a checkout error that says the shown state is stale.
 */
async function loadBilling(options: { quiet?: boolean } = {}) {
  const businessId = business.activeId
  if (!businessId)
    return

  if (options.quiet) {
    try {
      billing.value = await getBilling(businessId)
    }
    catch {
      // Keep the current state; the action error is already on screen.
    }

    return
  }

  isLoading.value = true
  resetLoad()
  try {
    billing.value = await getBilling(businessId)
  }
  catch (e) {
    captureLoad(e)
  }
  finally {
    isLoading.value = false
  }
}

/** The step-up dialog was cancelled: the page gets the original 403, nothing to show. */
function isCancelledReauth(code: string) {
  return code === 'REAUTH_REQUIRED' || code === 'PASSWORD_REQUIRED'
}

async function onCheckout() {
  const businessId = business.activeId
  if (!businessId)
    return

  isLoadingCheckout.value = true
  resetAction()
  try {
    const { url } = await createCheckout(businessId)

    setCheckoutFlag(businessId)
    window.location.assign(url)
  }
  catch (e) {
    const { error } = captureAction(e)

    if (isCancelledReauth(error.code)) {
      resetAction()
    }
    else if (error.code === 'SUBSCRIPTION_EXISTS') {
      offerPortal.value = true
      loadBilling({ quiet: true })
    }
    else if (error.code === 'CONFLICT' && error.detailCode === 'businessSuspended') {
      loadBilling({ quiet: true })
    }
    isLoadingCheckout.value = false
  }
}

async function onPortal() {
  const businessId = business.activeId
  if (!businessId)
    return

  isLoadingPortal.value = true
  resetAction()
  try {
    const { url } = await createPortal(businessId)

    // The portal returns to the same URL as a cancelled checkout: drop any pending checkout flag.
    takeCheckoutFlag(businessId)
    window.location.assign(url)
  }
  catch (e) {
    const { error } = captureAction(e)

    if (isCancelledReauth(error.code))
      resetAction()
    else if (error.code === 'CONFLICT' && error.detailCode === 'noBillingAccount')
      offerCheckout.value = true
    isLoadingPortal.value = false
  }
}

/** Back from Stripe restored this page from the bfcache: unlock the buttons and refresh the state. */
function onPageShow(event: PageTransitionEvent) {
  if (!event.persisted)
    return

  isLoadingCheckout.value = false
  isLoadingPortal.value = false
  if (business.activeId)
    takeCheckoutFlag(business.activeId)
  loadBilling({ quiet: true })
}

onMounted(() => {
  if (returnBusinessId) {
    // The guard selects ?businessId only when the user is a member; ignore returns for another business.
    cameBackFromCheckout.value = returnBusinessId === business.activeId && takeCheckoutFlag(returnBusinessId)

    const { businessId: _, ...query } = route.query

    router.replace({ path: route.path, query })
  }
  window.addEventListener('pageshow', onPageShow)
  loadBilling()
})

onBeforeUnmount(() => window.removeEventListener('pageshow', onPageShow))
</script>

<template>
  <div class="planes-page">
    <div class="planes-hero">
      <div class="planes-hero-icon">
        <VIcon
          icon="tabler-crown"
          size="32"
        />
      </div>
      <h1 class="titulo-display">
        Tu plan
      </h1>
      <p class="planes-hero-subtitle">
        {{ business.active?.name }}
      </p>
    </div>

    <!-- Carga -->
    <template v-if="isLoading">
      <VSkeletonLoader
        type="article"
        class="mb-4"
      />
      <VSkeletonLoader type="list-item-three-line" />
    </template>

    <!-- Error de carga -->
    <template v-else-if="loadError">
      <ApiErrorAlert
        :error="loadError"
        class="mb-4"
      />
      <VBtn
        variant="tonal"
        block
        rounded="lg"
        prepend-icon="tabler-refresh"
        @click="loadBilling"
      >
        Reintentar
      </VBtn>
    </template>

    <template v-else-if="billing">
      <VAlert
        v-if="showCheckoutNotCompleted"
        color="secondary"
        variant="tonal"
        rounded="lg"
        density="compact"
        icon="tabler-info-circle"
        class="mb-4"
        text="No se completó el pago. Puedes intentarlo de nuevo cuando quieras."
      />

      <BillingStatusCard
        :billing="billing"
        :time-zone="business.timezone"
        class="mb-4"
      />

      <ApiErrorAlert
        :error="actionError"
        class="mb-4"
      />

      <!-- Negocio suspendido: sin planes, solo soporte -->
      <VBtn
        v-if="isSuspended"
        color="primary"
        block
        size="large"
        rounded="lg"
        prepend-icon="tabler-mail"
        href="mailto:soporte@repitt.com"
        class="mb-3"
      >
        Contactar a soporte
      </VBtn>

      <!-- Prueba sin iniciar -->
      <VBtn
        v-if="reason === 'pre_trial'"
        color="primary"
        block
        size="large"
        rounded="lg"
        prepend-icon="tabler-cards"
        to="/empresa/tarjetas/crear"
        class="mb-3"
      >
        Crear mi primera tarjeta
      </VBtn>

      <template v-if="canCheckout">
        <PlanFeaturesCard class="mb-4" />

        <VBtn
          color="primary"
          :variant="checkoutIsPrimary ? 'flat' : 'tonal'"
          block
          size="large"
          rounded="lg"
          :loading="isLoadingCheckout"
          :disabled="isLoadingPortal"
          @click="onCheckout"
        >
          <VIcon
            icon="tabler-lock-open"
            start
          />
          Contratar
        </VBtn>

        <p class="planes-legal">
          <template v-if="keepsTrialDays">
            Si contratas ahora, conservas los días que te quedan de prueba.<br>
          </template>
          Pago seguro con Stripe · Cancela cuando quieras
        </p>
      </template>

      <template v-if="canPortal">
        <VBtn
          color="primary"
          :variant="portalIsPrimary ? 'flat' : 'tonal'"
          block
          size="large"
          rounded="lg"
          :class="{ 'mt-4': canCheckout }"
          :loading="isLoadingPortal"
          :disabled="isLoadingCheckout"
          @click="onPortal"
        >
          <VIcon
            icon="tabler-credit-card"
            start
          />
          Administrar pagos
        </VBtn>

        <p class="planes-legal">
          Método de pago, facturas y cancelación en el portal seguro de Stripe. Es posible que te pidamos tu contraseña.
        </p>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.planes-page {
  padding-block: var(--s-2);
}

// Cabecera alineada a la izquierda: ícono tonal plano (sin degradado ni sombra) y título display.
.planes-hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-block-end: var(--s-5);
  padding-block: var(--s-5) 0;
}

.planes-hero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-control);
  background: var(--violeta-suave);
  block-size: 56px;
  color: var(--enlace);
  inline-size: 56px;
  margin-block-end: var(--s-4);
}

.planes-hero-subtitle {
  color: var(--texto-2);
  font-size: var(--t-body);
  margin-block-start: var(--s-3);
  max-inline-size: 32em;
}

.planes-legal {
  color: var(--texto-2);
  font-size: var(--t-small);
  line-height: var(--lh-small);
  margin-block-start: var(--s-3);
}
</style>
