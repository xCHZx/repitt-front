<script lang="ts" setup>
import { logoutUser } from '@/services/auth/auth'
import { getAllBusinessesMe } from '@/services/company/businesses'
import { getSubscriptionStatus } from '@/services/subscription/subscription'
import { refreshUserData } from '@/services/utils/utils'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const companyStore = useCompanyStore()
const router = useRouter()

const planStatusLabel = computed(() => {
  const sub = companyStore.businessSubscription
  if (!sub) return 'Sin plan'
  if (sub.cancelAtPeriodEnd && sub.cancelAt) {
    const date = new Date(sub.cancelAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    return `Cancela el ${date}`
  }
  if (sub.status === 'active') return 'Activo'
  if (sub.status === 'trialing') return 'Prueba'
  if (sub.status === 'past_due') return 'Pago pendiente'
  if (sub.status === 'canceled') return 'Cancelado'
  if (sub.status === 'paused') return 'Pausado'
  return 'Sin plan'
})

const planStatusColor = computed(() => {
  const sub = companyStore.businessSubscription
  if (!sub) return 'error'
  if (sub.cancelAtPeriodEnd) return 'warning'
  if (sub.status === 'active') return 'success'
  if (sub.status === 'trialing') return 'info'
  if (sub.status === 'past_due') return 'warning'
  return 'error'
})
const isDialogVisible = ref(false)
const businesses: any = ref([])
const user: any = ref(null)

const quickActions = [
  { icon: 'tabler-cards', label: 'Tarjetas', caption: 'De lealtad', to: '/empresa/tarjetas' },
  { icon: 'tabler-walk', label: 'Visitas', caption: 'Historial', to: '/empresa/visitas' },
  { icon: 'tabler-chart-histogram', label: 'Métricas', caption: 'Actividad', to: '/empresa/metricas' },
  { icon: 'tabler-gift', label: 'Recompensas', caption: 'Canjear', to: '/empresa/recompensas' },
]

const getData = async () => {
  try {
    const businessId = companyStore.selectedCompany?.id as number
    const [businessList, userData, subscriptionData] = await Promise.all([
      getAllBusinessesMe(),
      refreshUserData(),
      getSubscriptionStatus(businessId),
    ])
    businesses.value = businessList
    user.value = userData.data
    companyStore.setBusinessSubscription(subscriptionData)
  }
  catch {
    // silently ignore
  }
}

onMounted(async () => {
  const currentCode = companyStore.selectedCompany.businessRepittCode
  if (!companyStore.selectedCompany.name || !currentCode) {
    router.push('/empresa/seleccionar')
    return
  }
  await companyStore.refreshCompany(currentCode)
  getData()
})

const logout = async () => {
  await logoutUser()
  await router.push('/auth/login')
}

const isActive = computed(() => companyStore.selectedCompany.isActive)
</script>

<template>
  <div class="pa-0">
    <!-- Business Header -->
    <div class="d-flex align-center gap-3 mb-4">
      <VAvatar
        color="primary"
        variant="tonal"
        size="44"
      >
        <VImg
          v-if="companyStore.selectedCompany.logoPath"
          :src="companyStore.selectedCompany.logoPath"
        />
        <span
          v-else
          class="text-h6 font-weight-bold"
        >
          {{ String(companyStore.selectedCompany?.name || 'R').charAt(0).toUpperCase() }}
        </span>
      </VAvatar>
      <div class="flex-grow-1 overflow-hidden">
        <p class="text-h6 font-weight-bold mb-0 text-truncate">
          {{ companyStore.selectedCompany?.name || 'Mi Negocio' }}
        </p>
        <VChip
          :color="isActive ? 'success' : 'error'"
          size="x-small"
          variant="tonal"
        >
          {{ isActive ? 'Activo' : 'Inactivo' }}
        </VChip>
      </div>
    </div>

    <!-- Primary CTA: Registrar Visita -->
    <HeroCTACard
      icon="tabler-qrcode"
      title="Registrar Visita"
      :subtitle="isActive ? 'Escanea el código QR de tu cliente' : 'Negocio inactivo'"
      to="/empresa/visitas/registrar"
      :disabled="!isActive"
      class="mb-4"
    />

    <!-- Quick Actions Grid -->
    <VRow dense class="mb-2">
      <VCol
        v-for="action in quickActions"
        :key="action.to"
        cols="6"
      >
        <QuickActionCard v-bind="action" />
      </VCol>
    </VRow>

    <!-- Secondary Actions List -->
    <VCard
      rounded="xl"
      class="mb-4"
    >
      <VList>
        <VListItem
          prepend-icon="tabler-building-store"
          title="Información del Negocio"
          subtitle="Edita los datos de tu negocio"
          append-icon="tabler-chevron-right"
          to="/empresa/informacion"
        />
        <VDivider />
        <VListItem
          prepend-icon="tabler-crown"
          title="Mi Plan"
          append-icon="tabler-chevron-right"
          to="/empresa/planes"
        >
          <template #subtitle>
            <VChip
              :color="planStatusColor"
              size="x-small"
              variant="tonal"
              class="mt-1"
            >
              {{ planStatusLabel }}
            </VChip>
          </template>
        </VListItem>
      </VList>
    </VCard>

    <!-- Footer -->
    <div class="d-flex justify-center gap-4 mt-2">
      <VBtn
        variant="text"
        size="small"
        prepend-icon="tabler-refresh"
        @click="isDialogVisible = true"
      >
        Cambiar Perfil
      </VBtn>
      <VBtn
        color="secondary"
        variant="text"
        size="small"
        prepend-icon="tabler-logout"
        @click="logout"
      >
        Cerrar Sesión
      </VBtn>
    </div>
  </div>

  <!-- Cambiar Perfil Dialog -->
  <CambiarPerfilDialog
    v-model="isDialogVisible"
    :businesses="businesses"
    :user="user"
  />
</template>
