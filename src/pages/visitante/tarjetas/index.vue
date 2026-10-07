<script setup lang="ts">
import { listMyCards } from '@/api/endpoints/me'
import type { MeCard } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import StampCardListItem from '@/components/stampCards/StampCardListItem.vue'
import { walletGroups } from '@/components/visitor/wallet'
import { useApiError } from '@/composables/useApiError'

// Wallet (guide §4.C.2): GET /v1/me/cards (≤ 100, no pagination).

definePage({
  meta: {
    layout: 'visitor',
  },
})

const items = ref<MeCard[]>([])
const loading = ref(true)
const { error, capture, reset } = useApiError()

const load = async () => {
  loading.value = true
  reset()
  try {
    items.value = await listMyCards()
  }
  catch (e) {
    capture(e)
  }
  finally {
    loading.value = false
  }
}

const groups = computed(() => walletGroups(items.value))

const sections = computed(() => [
  { key: 'redeemable', label: '¡Listas para canjear!', icon: 'tabler-gift', class: 'text-warning', items: groups.value.redeemable, dimmed: false },
  { key: 'progress', label: 'En progreso', icon: 'tabler-rosette-discount', class: 'text-primary', items: groups.value.inProgress, dimmed: false },
  { key: 'inactive', label: 'Inactivas o terminadas', icon: 'tabler-archive', class: 'text-medium-emphasis', items: groups.value.inactive, dimmed: true },
].filter(s => s.items.length))

onMounted(load)
</script>

<template>
  <div>
    <template v-if="loading">
      <VSkeletonLoader
        v-for="i in 3"
        :key="i"
        type="list-item-avatar-two-line"
        class="mb-3 rounded-xl"
      />
    </template>

    <div
      v-else-if="error"
      class="py-6"
    >
      <ApiErrorAlert :error="error" />
      <VBtn
        variant="tonal"
        class="mt-4"
        prepend-icon="tabler-refresh"
        @click="load"
      >
        Reintentar
      </VBtn>
    </div>

    <div
      v-else-if="items.length === 0"
      class="text-center py-12"
    >
      <VIcon
        icon="tabler-cards"
        size="56"
        color="medium-emphasis"
        class="mb-4 empty-icon"
      />
      <div class="text-h6 font-weight-bold mb-1">
        Aún no tienes tarjetas
      </div>
      <div class="text-body-2 text-medium-emphasis mb-5">
        Visita un negocio y muéstrale tu QR para recibir tu primer sello
      </div>
      <VBtn
        to="/visitante/perfil/qr"
        variant="tonal"
        color="primary"
        prepend-icon="tabler-qrcode"
      >
        Ver mi QR
      </VBtn>
    </div>

    <template v-else>
      <section
        v-for="section in sections"
        :key="section.key"
        class="wallet-section"
      >
        <div
          class="section-label"
          :class="section.class"
        >
          <VIcon
            :icon="section.icon"
            size="15"
          />
          {{ section.label }}
        </div>
        <StampCardListItem
          v-for="item in section.items"
          :key="item.cycle.id"
          :item="item"
          :dimmed="section.dimmed"
          :to="`/visitante/tarjetas/${item.cycle.id}`"
          class="mb-3"
        />
      </section>
    </template>
  </div>
</template>

<style scoped>
.section-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.04em;
  margin-block-end: 10px;
  text-transform: uppercase;
}

.wallet-section + .wallet-section {
  margin-block-start: 24px;
}

.empty-icon {
  opacity: 0.35;
}
</style>
