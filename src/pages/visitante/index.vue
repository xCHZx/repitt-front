<script lang="ts" setup>
import { listMyCards } from '@/api/endpoints/me'
import type { MeCard } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import AppQrCode from '@/components/common/AppQrCode.vue'
import QuickActionCard from '@/components/general/QuickActionCard.vue'
import StampCardListItem from '@/components/stampCards/StampCardListItem.vue'
import { formatRepittCode, isRedeemable, nearestCard } from '@/components/visitor/wallet'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// Visitor home: greeting, my QR, rewards ready and the card closest to its reward (guide §4.C).

definePage({
  meta: {
    layout: 'visitor',
  },
})

const session = useSessionStore()
const cards = ref<MeCard[]>([])
const loading = ref(true)
const { error, capture, reset } = useApiError()

const load = async () => {
  loading.value = true
  reset()
  try {
    cards.value = await listMyCards()
  }
  catch (e) {
    capture(e)
  }
  finally {
    loading.value = false
  }
}

const readyToRedeem = computed(() => cards.value.filter(isRedeemable))
const nearest = computed(() => nearestCard(cards.value))

onMounted(load)
</script>

<template>
  <div>
    <!-- Hero QR -->
    <VCard
      color="primary"
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="text-center pa-6">
        <div class="text-white text-h5 font-weight-bold mb-1">
          Hola, {{ session.me?.firstName || 'bienvenido' }}
        </div>
        <div class="text-white text-body-2 mb-5 hero-caption">
          Muéstrale tu código al negocio para recibir tus sellos
        </div>

        <VCard
          rounded="lg"
          class="mx-auto mb-4 qr-tap-card"
          to="/visitante/perfil/qr"
        >
          <VCardText class="pa-3">
            <AppQrCode
              :value="session.me?.qrPayload"
              :size="196"
            />
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
          {{ formatRepittCode(session.me?.repittCode) }}
        </VChip>
      </VCardText>
    </VCard>

    <VSkeletonLoader
      v-if="loading"
      type="list-item-avatar-two-line"
      class="mb-4 rounded-xl"
    />

    <div
      v-else-if="error"
      class="mb-4"
    >
      <ApiErrorAlert :error="error" />
      <VBtn
        variant="tonal"
        class="mt-3"
        prepend-icon="tabler-refresh"
        @click="load"
      >
        Reintentar
      </VBtn>
    </div>

    <template v-else>
      <!-- Rewards ready -->
      <template v-if="readyToRedeem.length">
        <div class="section-label text-warning">
          <VIcon
            icon="tabler-gift"
            size="15"
          />
          ¡Recompensa lista!
        </div>
        <StampCardListItem
          v-for="item in readyToRedeem"
          :key="item.cycle.id"
          :item="item"
          :to="`/visitante/tarjetas/${item.cycle.id}`"
          class="mb-3"
        />
      </template>

      <!-- Nearest card -->
      <template v-if="nearest">
        <div class="section-label text-primary">
          <VIcon
            icon="tabler-flame"
            size="15"
          />
          Estás cerca
        </div>
        <StampCardListItem
          :item="nearest"
          :to="`/visitante/tarjetas/${nearest.cycle.id}`"
          class="mb-4"
        />
      </template>
    </template>

    <!-- Quick actions -->
    <VRow
      dense
      class="mb-2"
    >
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
          icon="tabler-activity"
          label="Actividad"
          caption="Sellos y canjes"
          to="/visitante/visitas"
          :icon-size="36"
        />
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.hero-caption {
  opacity: 0.8;
}

.qr-tap-card {
  cursor: pointer;
  max-inline-size: 220px;
}

.section-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.04em;
  margin-block: 8px 10px;
  text-transform: uppercase;
}
</style>
