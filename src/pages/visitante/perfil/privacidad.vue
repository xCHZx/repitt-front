<script lang="ts" setup>
import { listMyBusinesses, listMyCards } from '@/api/endpoints/me'
import type { MeBusiness, MeCard } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import DeleteAccountCard from '@/components/visitor/DeleteAccountCard.vue'
import ExportDataCard from '@/components/visitor/ExportDataCard.vue'
import RevokeBusinessDialog from '@/components/visitor/RevokeBusinessDialog.vue'
import type { RevokeTarget } from '@/components/visitor/wallet'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'
import { formatInstant } from '@/utils/dates'

// Privacy and my data (guide §4.C.4–§4.C.7): businesses with my data and leaving them,
// data export and account deletion.

definePage({
  meta: {
    layout: 'visitor',
  },
})

const session = useSessionStore()
const businessStore = useBusinessStore()
const { error, capture, reset } = useApiError()

const businesses = ref<MeBusiness[]>([])
const cards = ref<MeCard[]>([])
const loading = ref(true)
const ownBusinessIds = ref(new Set<string>())

const dialog = ref(false)
const target = ref<RevokeTarget | null>(null)
const snackbar = ref({ show: false, text: '', color: 'success' })

const roleIn = (businessId: string) => session.memberships.find(m => m.businessId === businessId)?.role

async function load() {
  loading.value = true
  reset()
  try {
    const [b, c] = await Promise.all([listMyBusinesses(), listMyCards()])

    businesses.value = b
    cards.value = c
  }
  catch (e) {
    capture(e)
  }
  finally {
    loading.value = false
  }
}

const canRevoke = (b: MeBusiness) =>
  b.revokedAt === null && roleIn(b.businessId) !== 'owner' && !ownBusinessIds.value.has(b.businessId)

/** Cashier memberships of businesses not listed above: they can still leave the staff. */
const staffOnly = computed(() => {
  const listed = new Set(businesses.value.map(b => b.businessId))

  return session.memberships.filter(m => m.role === 'cashier' && !listed.has(m.businessId))
})

function openRevoke(next: RevokeTarget) {
  target.value = next
  dialog.value = true
}

async function onDone(result: 'revoked' | 'gone') {
  const wasCashier = !!target.value?.isCashier

  snackbar.value = result === 'revoked'
    ? { show: true, text: wasCashier ? 'Listo, saliste del negocio' : 'Listo, te diste de baja del negocio', color: 'success' }
    : { show: true, text: 'Ese negocio ya no está en tu lista', color: 'info' }

  if (wasCashier) {
    await session.loadMe().catch(() => {})
    if (businessStore.loaded)
      await businessStore.load().catch(() => {})
  }
  await load()
}

function onOwnBusiness(businessId: string) {
  ownBusinessIds.value = new Set([...ownBusinessIds.value, businessId])
  snackbar.value = { show: true, text: 'No puedes darte de baja de un negocio propio', color: 'info' }
}

onMounted(load)
</script>

<template>
  <div>
    <!-- Businesses with my data -->
    <div class="section-label mb-3">
      Negocios con mis datos
    </div>
    <p class="text-body-2 text-medium-emphasis mb-3">
      Estos negocios guardan tus sellos y visitas porque aceptaste su programa de lealtad.
    </p>

    <VSkeletonLoader
      v-if="loading"
      type="list-item-two-line, list-item-two-line"
      class="mb-6 rounded-xl"
    />
    <div
      v-else-if="error"
      class="mb-6"
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
    <VCard
      v-else-if="businesses.length === 0"
      rounded="xl"
      class="mb-6"
    >
      <VCardText class="text-body-2 text-medium-emphasis text-center">
        Ningún negocio tiene tus datos todavía
      </VCardText>
    </VCard>
    <VCard
      v-else
      rounded="xl"
      class="mb-6"
    >
      <VList lines="two">
        <template
          v-for="(b, index) in businesses"
          :key="b.businessId"
        >
          <VListItem :class="{ 'revoked-item': b.revokedAt }">
            <VListItemTitle class="font-weight-medium">
              {{ b.name }}
              <VChip
                v-if="roleIn(b.businessId) === 'cashier'"
                size="x-small"
                variant="tonal"
                class="ms-1"
              >
                Eres cajero
              </VChip>
            </VListItemTitle>
            <VListItemSubtitle>
              <template v-if="b.revokedAt">
                Te diste de baja el {{ formatInstant(b.revokedAt) }}
              </template>
              <template v-else>
                Desde el {{ formatInstant(b.consentGrantedAt) }} · {{ b.repittCode }}
              </template>
            </VListItemSubtitle>
            <template #append>
              <VBtn
                v-if="canRevoke(b)"
                size="small"
                variant="text"
                color="error"
                @click="openRevoke({ businessId: b.businessId, name: b.name, repittCode: b.repittCode, isCashier: roleIn(b.businessId) === 'cashier' })"
              >
                Darme de baja
              </VBtn>
            </template>
          </VListItem>
          <VDivider v-if="index < businesses.length - 1" />
        </template>
      </VList>
    </VCard>

    <!-- Cashier memberships not listed -->
    <template v-if="staffOnly.length">
      <div class="section-label mb-3">
        Negocios donde trabajo
      </div>
      <VCard
        rounded="xl"
        class="mb-6"
      >
        <VList>
          <VListItem
            v-for="m in staffOnly"
            :key="m.businessId"
            prepend-icon="tabler-id-badge-2"
            :title="m.businessName"
            subtitle="Cajero"
          >
            <template #append>
              <VBtn
                size="small"
                variant="text"
                color="error"
                @click="openRevoke({ businessId: m.businessId, name: m.businessName, repittCode: null, isCashier: true })"
              >
                Salir del negocio
              </VBtn>
            </template>
          </VListItem>
        </VList>
      </VCard>
    </template>

    <!-- Export -->
    <div class="section-label mb-3">
      Mis datos
    </div>
    <ExportDataCard class="mb-4" />

    <VBtn
      block
      variant="text"
      prepend-icon="tabler-file-text"
      to="/privacidad"
      class="mb-6"
    >
      Leer el aviso de privacidad
    </VBtn>

    <!-- Delete account -->
    <div class="section-label text-error mb-3">
      Zona de riesgo
    </div>
    <DeleteAccountCard />

    <RevokeBusinessDialog
      v-model="dialog"
      :target="target"
      :cards="cards"
      @done="onDone"
      @own-business="onOwnBusiness"
    />

    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3500"
    >
      {{ snackbar.text }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.revoked-item {
  opacity: 0.6;
}
</style>
