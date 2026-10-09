<script setup lang="ts">
import AddCashierDialog from '@/components/business/AddCashierDialog.vue'
import { listMembers, removeMember } from '@/api/endpoints/businesses'
import type { Member } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { formatInstant } from '@/utils/dates'

// Cashiers of the active business (guide §4.A.6).

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const business = useBusinessStore()
const { error, capture, reset } = useApiError()
const { error: revokeError, capture: captureRevoke, reset: resetRevoke } = useApiError()

const members = ref<Member[]>([])
const isLoading = ref(true)
const addOpen = ref(false)
const suspendedByApi = ref(false)
const toRevoke = ref<Member | null>(null)
const isRevoking = ref(false)
const notice = ref('')

const isSuspended = computed(() => business.active?.moderationStatus === 'suspended' || suspendedByApi.value)
const cashierCount = computed(() => members.value.filter(m => m.role === 'cashier').length)

const revokeDialog = computed({
  get: () => !!toRevoke.value,
  set: v => {
    if (!v)
      toRevoke.value = null
  },
})

async function load() {
  if (!business.activeId)
    return
  reset()
  isLoading.value = true
  try {
    // Active members only, owner first
    members.value = await listMembers(business.activeId)
  }
  catch (e) {
    capture(e)
  }
  finally {
    isLoading.value = false
  }
}

function onCreated(member: Member) {
  members.value = [...members.value, member]
  notice.value = `${member.displayName} ya puede entrar con su teléfono.`
}

function askRevoke(member: Member) {
  resetRevoke()
  toRevoke.value = member
}

async function confirmRevoke() {
  const member = toRevoke.value
  if (!member || !business.activeId)
    return
  resetRevoke()
  isRevoking.value = true
  try {
    await removeMember(business.activeId, member.id)
    members.value = members.value.filter(m => m.id !== member.id)
    toRevoke.value = null
  }
  catch (e) {
    const err = captureRevoke(e)
    if (err.error.status === 404) {
      // Already revoked (maybe in another tab) or the business itself is gone (§3.3)
      toRevoke.value = null
      resetRevoke()
      await business.refreshActive().catch(() => {})
      await load()
    }
  }
  finally {
    isRevoking.value = false
  }
}

const memberStatus = (m: Member) =>
  m.acceptedAt ? `Desde ${formatInstant(m.acceptedAt, business.timezone)}` : 'Pendiente'

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between gap-3 mb-4">
      <div class="text-body-2 text-medium-emphasis">
        Tus cajeros pueden registrar visitas y canjear recompensas en tu negocio.
      </div>
      <VBtn
        v-if="!isSuspended"
        color="primary"
        prepend-icon="tabler-user-plus"
        :disabled="isLoading || !!error"
        class="flex-shrink-0"
        @click="addOpen = true"
      >
        Agregar
      </VBtn>
    </div>

    <VAlert
      v-if="isSuspended"
      color="warning"
      variant="tonal"
      rounded="lg"
      density="compact"
      class="mb-4"
    >
      El negocio está suspendido: no se pueden agregar cajeros.
    </VAlert>

    <ApiErrorAlert
      :error="error"
      class="mb-4"
    >
      <VBtn
        size="small"
        variant="text"
        class="mt-1 px-0"
        @click="load"
      >
        Reintentar
      </VBtn>
    </ApiErrorAlert>

    <template v-if="isLoading">
      <VSkeletonLoader
        v-for="i in 3"
        :key="i"
        type="list-item-avatar-two-line"
        class="mb-2 rounded-xl"
      />
    </template>

    <template v-else-if="!error">
      <VCard rounded="xl">
        <VList lines="two">
          <template
            v-for="(m, i) in members"
            :key="m.id"
          >
            <VDivider v-if="i > 0" />
            <VListItem>
              <template #prepend>
                <VAvatar
                  :color="m.role === 'owner' ? 'primary' : 'secondary'"
                  variant="tonal"
                  size="40"
                >
                  <VIcon :icon="m.role === 'owner' ? 'tabler-crown' : 'tabler-user'" />
                </VAvatar>
              </template>
              <VListItemTitle class="font-weight-medium">
                {{ m.displayName }}
                <VChip
                  size="x-small"
                  variant="tonal"
                  :color="m.role === 'owner' ? 'primary' : 'secondary'"
                  class="ms-1"
                >
                  {{ m.role === 'owner' ? 'Dueño' : 'Cajero' }}
                </VChip>
              </VListItemTitle>
              <VListItemSubtitle>
                {{ m.phoneMasked }} · {{ memberStatus(m) }}
              </VListItemSubtitle>
              <template
                v-if="m.role !== 'owner'"
                #append
              >
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  aria-label="Quitar acceso"
                  @click="askRevoke(m)"
                >
                  <VIcon
                    icon="tabler-user-minus"
                    size="20"
                  />
                </VBtn>
              </template>
            </VListItem>
          </template>
        </VList>
      </VCard>

      <div
        v-if="cashierCount === 0"
        class="text-body-2 text-medium-emphasis mt-4"
      >
        Aún no tienes cajeros.
      </div>
    </template>

    <AddCashierDialog
      v-model="addOpen"
      @created="onCreated"
      @suspended="suspendedByApi = true"
    />

    <!-- Revoke -->
    <VDialog
      v-model="revokeDialog"
      max-width="360"
    >
      <VCard rounded="xl">
        <VCardText class="pa-6">
          <VIcon
            icon="tabler-user-minus"
            color="error"
            size="48"
            class="mb-3"
          />
          <div class="text-h6 font-weight-bold mb-2">
            ¿Quitar a {{ toRevoke?.displayName }}?
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Perderá el acceso a tu negocio de inmediato. Su cuenta de cliente no se ve afectada.
          </div>
          <ApiErrorAlert
            :error="revokeError"
            class="mb-4"
          />
          <div class="d-flex gap-3">
            <VBtn
              block
              variant="tonal"
              color="secondary"
              :disabled="isRevoking"
              @click="toRevoke = null"
            >
              Cancelar
            </VBtn>
            <!-- Destructivo (guía §15): botón de marco con texto en --error -->
            <VBtn
              block
              variant="outlined"
              color="error"
              :loading="isRevoking"
              @click="confirmRevoke"
            >
              Quitar
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>

    <VSnackbar
      :model-value="!!notice"
      :timeout="3000"
      color="success"
      location="bottom"
      @update:model-value="v => { if (!v) notice = '' }"
    >
      {{ notice }}
    </VSnackbar>
  </div>
</template>
