<script lang="ts" setup>
import { roleLabel } from '@/components/business/businessForm'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import HeroCTACard from '@/components/general/HeroCTACard.vue'
import QuickActionCard from '@/components/general/QuickActionCard.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'
import { paywallMessage } from '@/utils/entitlement'

// Business home (guide §3.4): owner sees every area; cashier only the counter.

definePage({
  meta: {
    layout: 'company',
    area: 'business',
  },
})

const router = useRouter()
const business = useBusinessStore()
const session = useSessionStore()
const { error, capture } = useApiError()

const ownerActions = [
  { icon: 'tabler-cards', label: 'Tarjetas', caption: 'De lealtad', to: '/empresa/tarjetas' },
  { icon: 'tabler-users', label: 'Clientes', caption: 'Tu cartera', to: '/empresa/clientes' },
  { icon: 'tabler-list-details', label: 'Movimientos', caption: 'Bitácora', to: '/empresa/visitas' },
  { icon: 'tabler-chart-histogram', label: 'Métricas', caption: 'Actividad', to: '/empresa/metricas' },
  { icon: 'tabler-gift', label: 'Recompensas', caption: 'Por canjear', to: '/empresa/recompensas' },
  { icon: 'tabler-users-group', label: 'Cajeros', caption: 'Tu equipo', to: '/empresa/cajeros' },
  { icon: 'tabler-building-store', label: 'Mi negocio', caption: 'Datos y QR', to: '/empresa/informacion' },
  { icon: 'tabler-crown', label: 'Plan', caption: 'Suscripción', to: '/empresa/planes' },
]

const active = computed(() => business.active)
const initial = computed(() => String(active.value?.name || 'R').charAt(0).toUpperCase())
const isPublished = computed(() => !!active.value?.isPublished)
const canRegister = computed(() => business.canOperate && isPublished.value)

const registerSubtitle = computed(() => {
  if (!business.canOperate)
    return paywallMessage(business.entitlement?.reason, business.role)
  if (!isPublished.value)
    return business.isOwner ? 'Publica tu negocio para registrar visitas' : 'El negocio está en pausa. Avísale al dueño.'

  return 'Escanea el código QR de tu cliente'
})

const hasSeveralBusinesses = computed(() => business.businesses.length > 1)
const isLoggingOut = ref(false)

async function logout() {
  isLoggingOut.value = true
  await session.logout()
  isLoggingOut.value = false
  await router.push('/auth/login')
}

onMounted(async () => {
  // Entitlement may have changed since the list was loaded
  try {
    await business.refreshActive()
    if (!business.active)
      await router.push('/empresa/seleccionar')
  }
  catch (e) {
    capture(e)
  }
})
</script>

<template>
  <div v-if="active">
    <!-- Business header -->
    <div class="d-flex align-center gap-3 mb-4">
      <VAvatar
        color="primary"
        variant="tonal"
        size="44"
        rounded="lg"
      >
        <VImg
          v-if="active.logoUrl"
          :src="active.logoUrl"
          cover
        />
        <span
          v-else
          class="text-h6 font-weight-bold"
        >{{ initial }}</span>
      </VAvatar>
      <div class="flex-grow-1 overflow-hidden">
        <p class="text-h6 font-weight-bold mb-0 text-truncate">
          {{ active.name }}
        </p>
        <div class="d-flex gap-1">
          <VChip
            :color="business.isOwner ? 'primary' : 'secondary'"
            size="x-small"
            variant="tonal"
          >
            {{ roleLabel(business.role) }}
          </VChip>
          <VChip
            v-if="!isPublished"
            size="x-small"
            variant="tonal"
          >
            En pausa
          </VChip>
        </div>
      </div>
    </div>

    <ApiErrorAlert
      :error="error"
      class="mb-4"
    />

    <VAlert
      v-if="business.isOwner && !isPublished"
      color="warning"
      variant="tonal"
      rounded="lg"
      density="compact"
      class="mb-4"
    >
      <div class="d-flex flex-wrap align-center gap-2">
        <span class="flex-grow-1">Tu negocio está en pausa: tu página pública está oculta y no se puede sellar.</span>
        <VBtn
          size="small"
          variant="flat"
          color="primary"
          to="/empresa/informacion"
        >
          Publicar
        </VBtn>
      </div>
    </VAlert>

    <!-- Primary CTA -->
    <HeroCTACard
      icon="tabler-qrcode"
      title="Registrar visita"
      :subtitle="registerSubtitle"
      to="/empresa/visitas/registrar"
      :disabled="!canRegister"
      class="mb-4"
    />

    <!-- Owner: every area -->
    <VRow
      v-if="business.isOwner"
      dense
      class="mb-2"
    >
      <VCol
        v-for="action in ownerActions"
        :key="action.to"
        cols="6"
        sm="3"
      >
        <QuickActionCard v-bind="action" />
      </VCol>
    </VRow>

    <!-- Cashier: counter only -->
    <VCard
      v-else
      rounded="xl"
      class="mb-4"
    >
      <VList>
        <VListItem
          prepend-icon="tabler-gift"
          title="Recompensas pendientes"
          subtitle="Canjea las recompensas de tus clientes"
          append-icon="tabler-chevron-right"
          to="/empresa/recompensas"
        />
      </VList>
    </VCard>

    <!-- Footer -->
    <div class="d-flex flex-wrap gap-4 mt-4">
      <VBtn
        v-if="hasSeveralBusinesses"
        variant="text"
        size="small"
        prepend-icon="tabler-switch-horizontal"
        to="/empresa/seleccionar"
      >
        Cambiar de negocio
      </VBtn>
      <VBtn
        color="secondary"
        variant="text"
        size="small"
        prepend-icon="tabler-logout"
        :loading="isLoggingOut"
        @click="logout"
      >
        Cerrar sesión
      </VBtn>
    </div>
  </div>
</template>
