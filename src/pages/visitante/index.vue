<script lang="ts" setup>
import { logoutUser } from '@/services/auth/auth'
import { getAllBusinessesMe } from '@/services/company/businesses'
import { getCurrentVisitorData } from '@/services/visitor/users'
import { getAllUserStampCardsByCurrentVisitor } from '@/services/visitor/userStampCards'
import { useAuthStore } from '@/stores/auth'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
    layout: 'visitor',
  },
})

const authStore = useAuthStore()
const userData = ref<any>(null)
const stampCards = ref<any[]>([])
const businesses = ref<any[]>([])
const isProfileDialogVisible = ref(false)

const getData = async () => {
  const requests: Promise<any>[] = [
    getCurrentVisitorData(),
    getAllUserStampCardsByCurrentVisitor(),
  ]
  if (authStore.authRole === 'Owner')
    requests.push(getAllBusinessesMe())

  const [user, cards, biz] = await Promise.allSettled(requests)
  if (user.status === 'fulfilled') userData.value = user.value
  if (cards.status === 'fulfilled') stampCards.value = cards.value || []
  if (biz?.status === 'fulfilled') businesses.value = biz.value || []
}

const nearestCard = computed(() => {
  const active = stampCards.value.filter(
    (c: any) => c.isActive && !c.isCompleted && !c.isRewardRedeemed && c.stampCard?.requiredStamps,
  )
  if (!active.length) return null
  return active.sort(
    (a: any, b: any) =>
      (b.visitsCount / b.stampCard.requiredStamps) -
      (a.visitsCount / a.stampCard.requiredStamps),
  )[0]
})

const progressPercent = computed(() => {
  if (!nearestCard.value) return 0
  return Math.round((nearestCard.value.visitsCount / nearestCard.value.stampCard.requiredStamps) * 100)
})

const stampsLeft = computed(() => {
  if (!nearestCard.value) return 0
  return nearestCard.value.stampCard.requiredStamps - nearestCard.value.visitsCount
})

onMounted(() => {
  getData()
})
</script>

<template>
  <div class="pa-0">
    <!-- Hero QR Card -->
    <VCard
      color="primary"
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="text-center pa-6">
        <div class="text-white text-h5 font-weight-bold mb-1">
          Hola, {{ userData?.firstName || authStore.user?.firstName || 'Usuario' }} 👋
        </div>
        <div
          class="text-white text-body-2 mb-5"
          style="opacity: 0.8;"
        >
          Muéstrale tu código al negocio para sellar
        </div>

        <VCard
          rounded="lg"
          class="mx-auto mb-4 qr-tap-card"
          to="/visitante/perfil/qr"
        >
          <VCardText class="pa-3">
            <VImg
              :src="userData?.qrPath"
              :aspect-ratio="1"
              :min-block-size="180"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <VProgressCircular
                    indeterminate
                    color="primary"
                  />
                </div>
              </template>
            </VImg>
          </VCardText>
        </VCard>

        <VChip
          color="white"
          size="large"
          to="/visitante/perfil/qr"
        >
          <VIcon
            start
            icon="tabler-barcode"
          />
          {{ userData?.repittCode || '—' }}
        </VChip>
      </VCardText>
    </VCard>

    <!-- Gamification: nearest card to completion -->
    <VCard
      v-if="nearestCard"
      rounded="xl"
      class="mb-4"
      to="/visitante/tarjetas"
    >
      <VCardText class="pa-4">
        <div class="d-flex align-center gap-3 mb-3">
          <VAvatar
            :color="nearestCard.stampCard.primaryColor || 'primary'"
            variant="tonal"
            size="40"
            rounded="lg"
          >
            <VImg
              v-if="nearestCard.business.logoPath"
              :src="nearestCard.business.logoPath"
            />
            <span
              v-else
              class="text-body-2 font-weight-bold"
            >
              {{ nearestCard.business.name?.charAt(0) }}
            </span>
          </VAvatar>
          <div class="flex-grow-1">
            <div class="text-body-2 font-weight-bold">
              {{ nearestCard.business.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Falta{{ stampsLeft > 1 ? 'n' : '' }}
              <strong class="text-warning">{{ stampsLeft }} sello{{ stampsLeft > 1 ? 's' : '' }}</strong>
              para {{ nearestCard.stampCard.reward }}
            </div>
          </div>
          <VChip
            size="x-small"
            color="warning"
            variant="tonal"
          >
            {{ nearestCard.visitsCount }}/{{ nearestCard.stampCard.requiredStamps }}
          </VChip>
        </div>
        <VProgressLinear
          :model-value="progressPercent"
          color="warning"
          height="8"
          rounded
          bg-color="grey-200"
        />
      </VCardText>
    </VCard>

    <!-- Quick Actions -->
    <VRow dense class="mb-2">
      <VCol cols="6">
        <QuickActionCard
          icon="tabler-cards"
          label="Tarjetas"
          caption="Mis recompensas"
          to="/visitante/tarjetas"
          :icon-size="36"
        />
      </VCol>
      <VCol cols="6">
        <QuickActionCard
          icon="tabler-walk"
          label="Visitas"
          caption="Mi historial"
          to="/visitante/visitas"
          :icon-size="36"
        />
      </VCol>
    </VRow>
    <!-- Footer actions -->
    <div class="d-flex justify-center gap-4 mt-4">
      <VBtn
        v-if="authStore.authRole === 'Owner'"
        variant="text"
        size="small"
        prepend-icon="tabler-refresh"
        @click="isProfileDialogVisible = true"
      >
        Cambiar Perfil
      </VBtn>
      <VBtn
        variant="text"
        size="small"
        color="medium-emphasis"
        prepend-icon="tabler-logout"
        @click="logoutUser().then(() => $router.push('/auth/login'))"
      >
        Cerrar sesión
      </VBtn>
    </div>
  </div>

  <CambiarPerfilDialog
    v-model="isProfileDialogVisible"
    :businesses="businesses"
    :user="userData"
  />
</template>

<style scoped>
.qr-tap-card {
  cursor: pointer;
  max-inline-size: 220px;
}
</style>
