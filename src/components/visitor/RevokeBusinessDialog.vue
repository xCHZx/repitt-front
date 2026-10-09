<script setup lang="ts">
import { revokeMyBusiness } from '@/api/endpoints/me'
import type { MeCard } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import type { RevokeTarget } from '@/components/visitor/wallet'
import { useApiError } from '@/composables/useApiError'

// Leave a business / withdraw my data from it (guide §4.C.4): DELETE /v1/me/businesses/{businessId}.
// Strong confirmation listing what is lost. 409 ownerMembership → it is my own business (hide the action).
// 404 → reload the list; only on a cashier retry does it mean the exit was already applied (success).

const props = defineProps<{
  target: RevokeTarget | null
  cards: MeCard[]
}>()

const emit = defineEmits<{
  done: [result: 'revoked' | 'gone']
  ownBusiness: [businessId: string]
}>()

const isOpen = defineModel<boolean>({ required: true })

const { error, capture, reset } = useApiError()
const understood = ref(false)
const submitting = ref(false)

watch(isOpen, open => {
  if (open) {
    understood.value = false
    reset()
  }
})

const related = computed(() => {
  const code = props.target?.repittCode
  if (!code)
    return []

  return props.cards.filter(c => c.business.repittCode === code)
})

const pendingRewards = computed(() => related.value.filter(c => c.cycle.status === 'completed'))
const openStamps = computed(() => related.value.filter(c => c.cycle.status === 'open' && c.cycle.stampsCount > 0))

const onlyStaff = computed(() => !!props.target?.isCashier && !props.target.repittCode)

// Businesses whose DELETE was already sent at least once in this dialog's lifetime (retry detection).
const attempted = new Set<string>()

async function confirm() {
  const target = props.target
  if (!target || !understood.value)
    return
  submitting.value = true
  reset()

  const isRetry = attempted.has(target.businessId)

  attempted.add(target.businessId)
  try {
    await revokeMyBusiness(target.businessId)
    attempted.delete(target.businessId)
    isOpen.value = false
    emit('done', 'revoked')
  }
  catch (e) {
    const err = capture(e).error
    if (err.status === 404) {
      attempted.delete(target.businessId)
      isOpen.value = false

      // Only a cashier retry means the exit was already applied; otherwise reload neutrally.
      emit('done', target.isCashier && isRetry ? 'revoked' : 'gone')
    }
    else if (err.code === 'CONFLICT' && err.detailCode === 'ownerMembership') {
      isOpen.value = false
      emit('ownBusiness', target.businessId)
    }
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="480"
    :persistent="submitting"
  >
    <VCard
      v-if="props.target"
      rounded="xl"
    >
      <VCardText class="pa-5">
        <div class="d-flex align-center gap-3 mb-4">
          <VAvatar
            color="error"
            variant="tonal"
            size="44"
          >
            <VIcon
              icon="tabler-alert-triangle"
              color="error"
            />
          </VAvatar>
          <div class="text-h6 font-weight-bold">
            {{ onlyStaff ? 'Salir de' : 'Darte de baja de' }} {{ props.target.name }}
          </div>
        </div>

        <ul class="loss-list text-body-2 mb-4">
          <li v-if="!onlyStaff">
            La baja es <strong>definitiva</strong>: este negocio ya no podrá sellarte ni registrarte. Para volver tendrías que escribir a soporte.
          </li>
          <li v-if="pendingRewards.length">
            Pierdes {{ pendingRewards.length === 1 ? 'tu recompensa pendiente' : `tus ${pendingRewards.length} recompensas pendientes` }}:
            <strong>{{ pendingRewards.map(c => c.card.reward).join(', ') }}</strong>.
          </li>
          <li v-if="openStamps.length">
            Pierdes los sellos que llevas acumulados
            ({{ openStamps.map(c => `${c.cycle.stampsCount} en ${c.card.name}`).join(', ') }}).
          </li>
          <li v-if="props.target.isCashier">
            También dejas de ser parte del personal de este negocio.
          </li>
        </ul>

        <VCheckbox
          v-model="understood"
          density="compact"
          hide-details
          :label="onlyStaff ? 'Entiendo que dejaré de ser parte del personal' : 'Entiendo que la baja es definitiva'"
          class="mb-3"
        />

        <ApiErrorAlert :error="error" />
      </VCardText>
      <VCardActions class="justify-end gap-2 pb-4 px-4">
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="submitting"
          @click="isOpen = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="error"
          variant="flat"
          :loading="submitting"
          :disabled="!understood"
          @click="confirm"
        >
          {{ onlyStaff ? 'Salir del negocio' : 'Darme de baja' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.loss-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding-inline-start: var(--s-5);
}
</style>
