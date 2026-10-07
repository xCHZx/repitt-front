<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { listCards } from '@/api/endpoints/cards'
import { listPendingRedemptions } from '@/api/endpoints/loyalty'
import type { PendingRedemption, StampCard } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import CounterRedeemDialog from '@/components/counter/CounterRedeemDialog.vue'
import { redeemSummaryOf } from '@/components/counter/counter'
import UserStampCardWaitingRedeemListAsCompany from '@/components/stampCards/UserStampCardWaitingRedeemListAsCompany.vue'
import { useCursorList } from '@/composables/useCursorList'
import { useBusinessStore } from '@/stores/business'

// Pending redemptions (§4.B.5): completed cycles, newest first. It is the only way to redeem when
// the card is paused, archived or expired. Redeem from here goes without code.

definePage({
  meta: {
    layout: 'company',
    area: 'business',
  },
})

const business = useBusinessStore()

const list = useCursorList<PendingRedemption>(cursor =>
  listPendingRedemptions(business.activeId as string, { cursor, limit: 25 }),
)

const { items, loading, loaded, error, hasMore, isEmpty: listEmpty } = list

// Remember which load failed so "Reintentar" repeats it (a failed reload must not turn into
// appending page 2 to stale data).
let lastLoad: 'reload' | 'more' = 'reload'

function reload() {
  lastLoad = 'reload'

  return list.reload()
}

function loadMore() {
  lastLoad = 'more'

  return list.loadMore()
}

function retry() {
  return lastLoad === 'more' ? list.loadMore() : list.reload()
}

// §3.3: a 404 on the list means we are no longer a member (or the business is gone)
watch(error, e => {
  if (e?.error.status === 404)
    business.refreshActive().catch(() => {})
})

// Card style: cross card.id with the business cards (default style if archived / missing)
const cardsById = ref(new Map<string, StampCard>())

async function loadCardStyles() {
  if (!business.activeId)
    return
  try {
    const cards = await listCards(business.activeId)

    cardsById.value = new Map(cards.map(c => [c.id, c]))
  }
  catch {
    // Only cosmetic: keep the default style
  }
}

watch(() => business.activeId, id => {
  if (!id)
    return
  reload()
  loadCardStyles()
}, { immediate: true })

const initialLoading = computed(() => loading.value && !loaded.value)

// Redeem from the list
const redeemOpen = ref(false)
const target = ref<PendingRedemption | null>(null)

const summary = computed(() => (target.value ? redeemSummaryOf(target.value) : null))

function openRedeem(item: PendingRedemption) {
  target.value = item
  redeemOpen.value = true
}
</script>

<template>
  <div>
    <ApiErrorAlert
      :error="error"
      class="mb-4"
    >
      <VBtn
        size="small"
        variant="tonal"
        color="error"
        class="mt-2"
        :loading="loading"
        @click="retry"
      >
        Reintentar
      </VBtn>
    </ApiErrorAlert>

    <!-- Skeleton -->
    <template v-if="initialLoading">
      <VSkeletonLoader
        v-for="n in 3"
        :key="n"
        type="list-item-avatar-two-line"
        rounded="xl"
        class="mb-3"
      />
    </template>

    <!-- Empty -->
    <div
      v-else-if="listEmpty && !error"
      class="d-flex flex-column align-center justify-center text-center pa-8"
    >
      <VIcon
        icon="tabler-gift-off"
        size="52"
        color="medium-emphasis"
        class="mb-3"
      />
      <div class="text-body-1 font-weight-bold mb-1">
        Sin recompensas pendientes
      </div>
      <div class="text-body-2 text-medium-emphasis">
        Aquí aparecerán los clientes con tarjetas completas listas para canjear.
      </div>
    </div>

    <!-- List -->
    <template v-else-if="items.length">
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-gift"
          size="15"
        />
        Listas para canjear
      </div>

      <UserStampCardWaitingRedeemListAsCompany
        v-for="item in items"
        :key="item.cycle.id"
        :item="item"
        :time-zone="business.timezone"
        :primary-color="cardsById.get(item.card.id)?.primaryColor"
        :icon-url="cardsById.get(item.card.id)?.iconUrl"
        class="mb-3"
        @redeem="openRedeem(item)"
      />

      <div
        v-if="hasMore"
        class="text-center mt-2"
      >
        <VBtn
          variant="tonal"
          rounded="xl"
          :loading="loading"
          @click="loadMore"
        >
          Ver más
        </VBtn>
      </div>
    </template>

    <CounterRedeemDialog
      v-model="redeemOpen"
      :cycle-id="target?.cycle.id ?? null"
      :summary="summary"
      headline="list"
      @redeemed="reload"
      @changed="reload"
    />
  </div>
</template>

<style scoped>
.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
