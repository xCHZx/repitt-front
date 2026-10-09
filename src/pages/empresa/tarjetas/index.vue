<script setup lang="ts">
import { listCards } from '@/api/endpoints/cards'
import type { StampCard, StampCardStatus } from '@/api/types'
import CardListItem from '@/components/cards/CardListItem.vue'
import { MAX_NON_ARCHIVED_CARDS, MAX_PUBLISHED_CARDS, validityText } from '@/components/cards/cardMeta'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

type Tab = 'current' | 'archived'

const business = useBusinessStore()

const tab = ref<Tab>('current')
const cards = ref<Record<Tab, StampCard[] | null>>({ current: null, archived: null })

// Loading and error state belong to each tab: both lists can load at the same time.
const loading = ref<Record<Tab, boolean>>({ current: false, archived: false })
const errors: Record<Tab, ReturnType<typeof useApiError>> = { current: useApiError(), archived: useApiError() }

const isLoading = computed(() => loading.value[tab.value])
const error = computed(() => errors[tab.value].error.value)

async function load(which: Tab) {
  const businessId = business.activeId
  if (!businessId || loading.value[which])
    return
  errors[which].reset()
  loading.value[which] = true
  try {
    cards.value[which] = await listCards(businessId, which === 'archived' ? 'archived' : undefined)
  }
  catch (e) {
    errors[which].capture(e)
  }
  finally {
    loading.value[which] = false
  }
}

watch(tab, which => {
  if (!cards.value[which])
    load(which)
}, { immediate: true })

const shown = computed(() => cards.value[tab.value])

const SECTIONS: { status: StampCardStatus; label: string; icon: string }[] = [
  { status: 'published', label: 'Publicadas', icon: 'tabler-circle-check' },
  { status: 'paused', label: 'Pausadas', icon: 'tabler-player-pause' },
  { status: 'draft', label: 'Borradores', icon: 'tabler-pencil' },
]

const sections = computed(() => {
  const list = cards.value.current ?? []

  return SECTIONS
    .map(s => ({ ...s, items: list.filter(c => c.status === s.status) }))
    .filter(s => s.items.length)
})

const publishedCount = computed(() => (cards.value.current ?? []).filter(c => c.status === 'published').length)
const atPublishedLimit = computed(() => publishedCount.value >= MAX_PUBLISHED_CARDS)
const atCardLimit = computed(() => (cards.value.current?.length ?? 0) >= MAX_NON_ARCHIVED_CARDS)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between gap-2 mb-4">
      <VTabs
        v-model="tab"
        density="compact"
      >
        <VTab value="current">
          Activas
        </VTab>
        <VTab value="archived">
          Archivadas
        </VTab>
      </VTabs>
      <VBtn
        size="small"
        color="primary"
        rounded="xl"
        prepend-icon="tabler-plus"
        to="/empresa/tarjetas/crear"
      >
        Nueva tarjeta
      </VBtn>
    </div>

    <!-- Cargando -->
    <div
      v-if="isLoading"
      class="d-flex flex-column gap-3"
    >
      <VSkeletonLoader
        v-for="i in 3"
        :key="i"
        type="list-item-avatar"
        rounded="xl"
      />
    </div>

    <!-- Error de carga -->
    <div v-else-if="error || !shown">
      <ApiErrorAlert
        :error="error"
        class="mb-4"
      />
      <VBtn
        variant="tonal"
        prepend-icon="tabler-refresh"
        @click="load(tab)"
      >
        Reintentar
      </VBtn>
    </div>

    <!-- Activas -->
    <template v-else-if="tab === 'current' && shown.length">
      <VAlert
        v-if="atCardLimit"
        color="warning"
        variant="tonal"
        rounded="xl"
        density="compact"
        icon="tabler-alert-triangle"
        class="mb-4"
      >
        Llegaste al máximo de {{ MAX_NON_ARCHIVED_CARDS }} tarjetas sin archivar. Archiva alguna para crear otra.
      </VAlert>
      <VAlert
        v-if="atPublishedLimit"
        color="info"
        variant="tonal"
        rounded="xl"
        density="compact"
        icon="tabler-info-circle"
        class="mb-4"
      >
        Tienes {{ publishedCount }} tarjetas publicadas, el máximo es {{ MAX_PUBLISHED_CARDS }} (las vencidas cuentan).
        Pausa o archiva una para publicar otra.
      </VAlert>

      <template
        v-for="section in sections"
        :key="section.status"
      >
        <div class="section-label mb-3">
          <VIcon
            :icon="section.icon"
            size="15"
          />
          {{ section.label }}
        </div>
        <div class="d-flex flex-column gap-3 mb-5">
          <CardListItem
            v-for="card in section.items"
            :key="card.id"
            :name="card.name"
            :reward="card.reward"
            :required-stamps="card.requiredStamps"
            :primary-color="card.primaryColor"
            :icon-url="card.iconUrl"
            :status="card.status"
            :is-expired="card.isExpired"
            :validity="validityText(card)"
            :to="`/empresa/tarjetas/${card.id}`"
          />
        </div>
      </template>
    </template>

    <!-- Archivadas -->
    <template v-else-if="tab === 'archived' && shown.length">
      <div class="text-caption text-medium-emphasis mb-3">
        Se muestran las 100 archivadas más recientes. Tus clientes aún pueden canjear lo que ganaron en ellas.
      </div>
      <div class="d-flex flex-column gap-3">
        <CardListItem
          v-for="card in shown"
          :key="card.id"
          :name="card.name"
          :reward="card.reward"
          :required-stamps="card.requiredStamps"
          :primary-color="card.primaryColor"
          :icon-url="card.iconUrl"
          :status="card.status"
          :is-expired="card.isExpired"
          :validity="validityText(card)"
          :to="`/empresa/tarjetas/${card.id}`"
        />
      </div>
    </template>

    <!-- Vacío -->
    <div
      v-else-if="tab === 'archived'"
      class="py-12 text-body-2 text-medium-emphasis"
    >
      No tienes tarjetas archivadas.
    </div>
    <div
      v-else
      class="py-12"
    >
      <VIcon
        icon="tabler-cards"
        size="72"
        class="mb-4 empty-icon"
      />
      <div class="text-h6 font-weight-bold mb-1">
        Sin tarjetas de lealtad
      </div>
      <div class="text-body-2 text-medium-emphasis mb-5">
        Crea tu primera tarjeta para empezar a fidelizar clientes
      </div>
      <VBtn
        color="primary"
        rounded="xl"
        prepend-icon="tabler-plus"
        to="/empresa/tarjetas/crear"
      >
        Crear primera tarjeta
      </VBtn>
    </div>
  </div>
</template>

<style scoped>
.empty-icon {
  opacity: 0.3;
}
</style>
