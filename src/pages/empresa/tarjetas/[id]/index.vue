<script lang="ts" setup>
import { archiveCard, getCard, pauseCard, publishCard, resumeCard } from '@/api/endpoints/cards'
import type { StampCard } from '@/api/types'
import CardDetails from '@/components/cards/CardDetails.vue'
import CardIconRetryAlert from '@/components/cards/CardIconRetryAlert.vue'
import CardNotices from '@/components/cards/CardNotices.vue'
import CardStatusPanel from '@/components/cards/CardStatusPanel.vue'
import type { CardAction } from '@/components/cards/cardMeta'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { todayInZone } from '@/utils/dates'
import { paywallMessage } from '@/utils/entitlement'

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const route = useRoute('empresa-tarjetas-id')
const router = useRouter()
const business = useBusinessStore()

const card = ref<StampCard | null>(null)
const isLoading = ref(true)
const { error: loadError, capture: captureLoad, reset: resetLoad } = useApiError()
const { error: actionError, capture: captureAction, reset: resetAction } = useApiError()

const busy = ref<CardAction | null>(null)
const paywall = ref<{ text: string; showPlans: boolean } | null>(null)
const snackbar = ref<string | null>(null)

const today = computed(() => todayInZone(business.timezone))

/** Paywall from the entitlement (the 402 is only the safety net, §3.2). */
const entitlementPaywall = computed(() => {
  const ent = business.entitlement
  if (!ent || ent.allowed || card.value?.status !== 'draft')
    return null

  return { text: paywallMessage(ent.reason, business.role), showPlans: ent.reason !== 'suspended' }
})

const shownPaywall = computed(() => paywall.value ?? entitlementPaywall.value)

async function fetchCard() {
  const businessId = business.activeId
  if (!businessId)
    return
  resetLoad()
  try {
    card.value = await getCard(businessId, route.params.id)
  }
  catch (e) {
    // A 404 may be only the card, or the whole business: check the business (§3.3)
    if (captureLoad(e).error.status === 404)
      business.refreshActive().catch(() => {})
  }
  finally {
    isLoading.value = false
  }
}

const ACTIONS = { publish: publishCard, pause: pauseCard, resume: resumeCard, archive: archiveCard }

const DONE_TEXT: Record<CardAction, string> = {
  publish: 'Tarjeta publicada',
  pause: 'Tarjeta pausada',
  resume: 'Tarjeta reanudada',
  archive: 'Tarjeta archivada',
}

async function runAction(action: CardAction) {
  const businessId = business.activeId
  if (!businessId || !card.value || busy.value)
    return
  resetAction()
  paywall.value = null
  busy.value = action
  try {
    card.value = await ACTIONS[action](businessId, card.value.id)
    snackbar.value = DONE_TEXT[action]
    if (action === 'publish') {
      if (route.query.nueva)
        router.replace(`/empresa/tarjetas/${card.value.id}`)

      // The first publish starts the trial: refresh the business for the banner (§4.A.5)
      business.refreshActive().catch(() => {})
    }
  }
  catch (e) {
    const { error } = captureAction(e)
    if (error.code === 'ENTITLEMENT_REQUIRED') {
      resetAction()
      paywall.value = { text: paywallMessage(error.detailObj?.reason, business.role), showPlans: error.detailObj?.reason !== 'suspended' }
      business.refreshActive().catch(() => {})
    }
    else if (error.code === 'CARD_NOT_ACTIVE' || error.code === 'CARD_EXPIRED') {
      // The state changed elsewhere (or the card expired): show the current one
      fetchCard()
    }
  }
  finally {
    busy.value = null
  }
}

// The card belongs to the business that was active: on a switch, go back to the card list
watch(() => business.activeId, (id, previous) => {
  if (previous && id !== previous)
    router.replace('/empresa/tarjetas')
})

watch(() => route.params.id, () => {
  isLoading.value = true
  card.value = null
  fetchCard()
}, { immediate: true })
</script>

<template>
  <div>
    <!-- Cargando -->
    <template v-if="isLoading">
      <VSkeletonLoader
        type="card"
        rounded="xl"
        class="mb-4"
      />
      <VSkeletonLoader
        type="list-item-three-line"
        rounded="xl"
      />
    </template>

    <!-- Error de carga -->
    <div
      v-else-if="!card"
      class="py-6"
    >
      <ApiErrorAlert
        :error="loadError"
        class="mb-4"
      />
      <div class="d-flex gap-2">
        <VBtn
          variant="tonal"
          prepend-icon="tabler-refresh"
          @click="fetchCard"
        >
          Reintentar
        </VBtn>
        <VBtn
          variant="text"
          to="/empresa/tarjetas"
        >
          Ver tarjetas
        </VBtn>
      </div>
    </div>

    <template v-else>
      <CardNotices
        :card="card"
        :just-created="route.query.nueva === '1'"
        :pre-trial="business.entitlement?.reason === 'pre_trial'"
        :today="today"
      />

      <CardIconRetryAlert
        v-if="business.activeId"
        :business-id="business.activeId"
        :card="card"
        @uploaded="card = $event"
      />

      <!-- Paywall -->
      <VAlert
        v-if="shownPaywall"
        color="warning"
        variant="tonal"
        rounded="xl"
        density="compact"
        icon="tabler-lock"
        class="mb-4"
      >
        <div>{{ shownPaywall.text }}</div>
        <VBtn
          v-if="shownPaywall.showPlans"
          size="small"
          variant="flat"
          color="warning"
          class="mt-2"
          to="/empresa/planes"
        >
          Ver planes
        </VBtn>
      </VAlert>

      <ApiErrorAlert
        :error="actionError"
        class="mb-4"
      >
        <VBtn
          v-if="actionError?.error.code === 'MAX_PUBLISHED_CARDS'"
          size="small"
          variant="text"
          class="mt-1 px-0"
          to="/empresa/tarjetas"
        >
          Ver mis tarjetas
        </VBtn>
      </ApiErrorAlert>

      <CardStatusPanel
        :card="card"
        :busy="busy"
        :can-publish="!entitlementPaywall"
        @action="runAction"
      />

      <CardDetails :card="card" />

      <VBtn
        block
        variant="tonal"
        size="large"
        class="mb-3"
        prepend-icon="tabler-list-details"
        :to="`/empresa/tarjetas/${card.id}/visitas`"
      >
        Movimientos de esta tarjeta
      </VBtn>
      <VBtn
        v-if="card.status !== 'archived'"
        block
        variant="tonal"
        size="large"
        class="mb-3"
        prepend-icon="tabler-edit"
        :to="`/empresa/tarjetas/${card.id}/editar`"
      >
        Editar tarjeta
      </VBtn>
    </template>

    <VSnackbar
      :model-value="!!snackbar"
      color="success"
      :timeout="2500"
      @update:model-value="snackbar = null"
    >
      {{ snackbar }}
    </VSnackbar>
  </div>
</template>
