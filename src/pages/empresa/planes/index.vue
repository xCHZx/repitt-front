<script setup lang="ts">
import { getAllBusinessesMe } from '@/services/company/businesses'
import { createCheckoutSession, createPortalSession, getSubscriptionStatus } from '@/services/subscription/subscription'
import { useCompanyStore } from '@/stores/company'

definePage({ meta: { layout: 'company' } })

const route = useRoute()
const companyStore = useCompanyStore()

const isWelcome = computed(() => route.query.welcome === 'true')

const isLoadingCheckout = ref(false)
const isLoadingPortal = ref(false)
const isLoadingStatus = ref(false)
const errorMsg = ref('')

const subscription = computed(() => companyStore.businessSubscription)
const isActive = computed(() => companyStore.isSubscribed)
const isPastDue = computed(() => companyStore.isPastDue)

const statusLabel = computed(() => {
  if (subscription.value?.cancelAt) return 'Cancela al vencer'
  switch (subscription.value?.status) {
    case 'active': return 'Activo'
    case 'trialing': return 'Período de prueba'
    case 'past_due': return 'Pago pendiente'
    case 'canceled': return 'Cancelado'
    case 'paused': return 'Pausado'
    case 'unpaid': return 'Sin pagar'
    default: return '—'
  }
})

const statusColor = computed(() => {
  switch (subscription.value?.status) {
    case 'active': return 'success'
    case 'trialing': return 'info'
    case 'past_due': return 'warning'
    default: return 'error'
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const periodEndFormatted = computed(() => {
  if (!subscription.value?.currentPeriodEnd) return '—'
  return formatDate(subscription.value.currentPeriodEnd)
})

const cancelAtFormatted = computed(() => {
  if (!subscription.value?.cancelAt) return '—'
  return formatDate(subscription.value.cancelAt)
})

const features = [
  { icon: 'tabler-cards', text: 'Tarjetas de sellos ilimitadas' },
  { icon: 'tabler-qrcode', text: 'Registro de visitas por QR o teléfono' },
  { icon: 'tabler-users', text: 'Listado de clientes con historial' },
  { icon: 'tabler-chart-bar', text: 'Métricas y reportes de visitas' },
  { icon: 'tabler-gift', text: 'Gestión de recompensas' },
  { icon: 'tabler-headset', text: 'Soporte prioritario' },
]

async function onSubscribe() {
  isLoadingCheckout.value = true
  errorMsg.value = ''
  try {
    const businessId = companyStore.selectedCompany?.id as number
    const result = await createCheckoutSession(businessId, 'premium')
    window.location.href = result.url
  }
  catch (e: any) {
    errorMsg.value = typeof e === 'string' ? e : 'No se pudo iniciar el pago. Intenta de nuevo.'
    isLoadingCheckout.value = false
  }
}

async function onManage() {
  isLoadingPortal.value = true
  errorMsg.value = ''
  try {
    const businessId = companyStore.selectedCompany?.id as number
    const result = await createPortalSession(businessId)
    window.location.href = result.url
  }
  catch (e: any) {
    errorMsg.value = typeof e === 'string' ? e : 'No se pudo abrir el portal. Intenta de nuevo.'
    isLoadingPortal.value = false
  }
}

async function refreshStatus() {
  isLoadingStatus.value = true
  try {
    const businessId = companyStore.selectedCompany?.id as number
    const [subscriptionData, businesses] = await Promise.all([
      getSubscriptionStatus(businessId),
      getAllBusinessesMe(),
    ])
    companyStore.setBusinessSubscription(subscriptionData)
    const business = businesses.find((b: any) => b.id === businessId) ?? businesses[0]
    if (business)
      companyStore.selectCompany(business)
  }
  catch {
    // silencioso
  }
  finally {
    isLoadingStatus.value = false
  }
}

onMounted(() => {
  refreshStatus()
})
</script>

<template>
  <div class="planes-page">
    <!-- ─── Vista: Sin suscripción ─────────────────────────── -->
    <template v-if="!isActive">
      <VAlert
        v-if="isWelcome"
        color="success"
        variant="tonal"
        rounded="lg"
        icon="tabler-circle-check"
        class="mb-5"
        title="¡Cuenta creada con éxito!"
        text="Para empezar a usar tu negocio, activa tu suscripción."
      />

      <div class="planes-hero">
        <div class="planes-hero-icon">
          <VIcon
            icon="tabler-crown"
            size="40"
            color="white"
          />
        </div>
        <h1 class="planes-hero-title">
          Plan Emprendedor
        </h1>
        <p class="planes-hero-subtitle">
          Todo lo que necesitas para fidelizar a tus clientes, en un solo lugar.
        </p>
      </div>

      <VAlert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="errorMsg"
      />

      <!-- Plan card -->
      <VCard
        class="planes-card mb-4"
        rounded="xl"
        elevation="0"
      >
        <VCardText class="pa-5">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-h6 font-weight-bold">
                Plan Emprendedor
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Facturación mensual
              </div>
            </div>
            <VChip
              color="primary"
              variant="tonal"
              size="small"
            >
              Recomendado
            </VChip>
          </div>

          <VDivider class="mb-4" />

          <div class="features-list">
            <div
              v-for="feature in features"
              :key="feature.text"
              class="feature-item"
            >
              <VIcon
                icon="tabler-check"
                color="success"
                size="18"
                class="flex-shrink-0"
              />
              <span class="text-body-2">{{ feature.text }}</span>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VBtn
        color="primary"
        block
        size="large"
        rounded="lg"
        :loading="isLoadingCheckout"
        @click="onSubscribe"
      >
        <VIcon
          icon="tabler-lock-open"
          start
        />
        Comenzar ahora
      </VBtn>

      <p class="planes-legal">
        Pago seguro con Stripe · Cancela cuando quieras
      </p>
    </template>

    <!-- ─── Vista: Suscripción activa ─────────────────────── -->
    <template v-else>
      <div class="planes-hero planes-hero--active">
        <div class="planes-hero-icon planes-hero-icon--active">
          <VIcon
            icon="tabler-crown"
            size="40"
            color="white"
          />
        </div>
        <h1 class="planes-hero-title">
          Plan {{ subscription?.planName || 'Emprendedor' }}
        </h1>
        <p class="planes-hero-subtitle">
          Tu programa de fidelización está activo.
        </p>
      </div>

      <VAlert
        v-if="isPastDue"
        type="warning"
        variant="tonal"
        class="mb-4"
        icon="tabler-alert-triangle"
        title="Problema con tu pago"
        text="Tu método de pago falló. Stripe reintentará el cobro automáticamente. Actualiza tu tarjeta para evitar interrupciones."
      />

      <VAlert
        v-if="subscription?.cancelAt"
        type="info"
        variant="tonal"
        class="mb-4"
        icon="tabler-calendar-x"
        title="Cancelación programada"
        :text="`Tu plan se cancelará el ${cancelAtFormatted}. Puedes reactivarlo desde el portal de Stripe.`"
      />

      <VAlert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="errorMsg"
      />

      <VCard
        class="planes-card mb-4"
        rounded="xl"
        elevation="0"
      >
        <VCardText class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-h6 font-weight-bold">Plan {{ subscription?.planName || 'Emprendedor' }}</span>
            <div class="d-flex flex-column align-end gap-1">
              <VChip
                :color="statusColor"
                variant="tonal"
                size="small"
              >
                {{ statusLabel }}
              </VChip>
              <VChip
                v-if="subscription?.cancelAt"
                color="warning"
                variant="tonal"
                size="x-small"
                prepend-icon="tabler-calendar-x"
              >
                Se cancela el {{ cancelAtFormatted }}
              </VChip>
            </div>
          </div>

          <VDivider class="mb-3" />

          <div class="d-flex flex-column gap-2">
            <div class="d-flex justify-space-between">
              <span class="text-body-2 text-medium-emphasis">
                {{ subscription?.cancelAt ? 'Acceso hasta el' : 'Próximo cobro' }}
              </span>
              <span class="text-body-2 font-weight-medium">{{ periodEndFormatted }}</span>
            </div>
            <div
              v-if="subscription?.createdAt"
              class="d-flex justify-space-between"
            >
              <span class="text-body-2 text-medium-emphasis">Miembro desde</span>
              <span class="text-body-2 font-weight-medium">{{ formatDate(subscription.createdAt) }}</span>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VBtn
        color="primary"
        block
        size="large"
        rounded="lg"
        variant="tonal"
        :loading="isLoadingPortal"
        @click="onManage"
      >
        <VIcon
          icon="tabler-settings"
          start
        />
        Gestionar suscripción
      </VBtn>

      <p class="planes-legal">
        Administra método de pago, facturas y cancelación en el portal de Stripe.
      </p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.planes-page {
  padding-block: 8px;
}

.planes-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-block-end: 28px;
  padding-block: 24px 0;
  text-align: center;
}

.planes-hero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  block-size: 72px;
  box-shadow: 0 8px 24px rgba(var(--v-global-theme-primary), 0.4);
  inline-size: 72px;
  margin-block-end: 16px;

  &--active {
    background: linear-gradient(145deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 8px 24px rgb(245 158 11 / 35%);
  }
}

.planes-hero-title {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-block-end: 8px;
}

.planes-hero-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.95rem;
  max-inline-size: 280px;
}

.planes-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.planes-legal {
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-size: 0.78rem;
  margin-block-start: 12px;
  text-align: center;
}
</style>
