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
      class="mb-4 hero-violeta"
    >
      <VCardText class="pa-6">
        <h1 class="titulo-display text-white mb-2">
          Hola, {{ session.me?.firstName || 'bienvenido' }}
        </h1>
        <p class="text-white text-body-2 mb-5">
          Muéstrale tu código al negocio para recibir tus sellos
        </p>

        <VCard
          rounded="lg"
          class="mb-4 qr-tap-card"
          to="/visitante/perfil/qr"
        >
          <VCardText class="pa-3">
            <AppQrCode
              :value="session.me?.qrPayload"
              :size="196"
            />
          </VCardText>
        </VCard>

        <VBtn
          size="small"
          class="btn-inverso"
          prepend-icon="tabler-barcode"
          to="/visitante/perfil/qr"
        >
          <span class="hero-code">{{ formatRepittCode(session.me?.repittCode) }}</span>
        </VBtn>
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
        <div class="section-label mt-2 mb-3">
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
        <div class="section-label mt-2 mb-3">
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
/* Sobre --violeta el anillo de foco --violeta no se ve (1:1): pasa a papel (6.23:1, guía §9.3) */
.hero-violeta {
  --foco: var(--papel);
}

/* El QR va siempre sobre papel blanco, también en oscuro */
.qr-tap-card {
  background: var(--papel);
  cursor: pointer;
  max-inline-size: 220px;
}

.hero-code {
  font-variant-numeric: tabular-nums;
  white-space: pre;
}
</style>
