<script lang="ts" setup>
import { VForm } from 'vuetify/components/VForm'
import { getCard, updateCard, uploadCardIcon } from '@/api/endpoints/cards'
import type { StampCard } from '@/api/types'
import CardForm from '@/components/cards/CardForm.vue'
import { iconChoiceToFile } from '@/components/cards/cardIcons'
import type { IconChoice } from '@/components/cards/cardIcons'
import { cardToForm, formToUpdateBody } from '@/components/cards/cardForm'
import type { CardFormModel } from '@/components/cards/cardForm'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { todayInZone } from '@/utils/dates'

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const route = useRoute('empresa-tarjetas-id-editar')
const router = useRouter()
const business = useBusinessStore()

const today = computed(() => todayInZone(business.timezone))

const card = ref<StampCard | null>(null)
const form = ref<CardFormModel | null>(null)
const icon = ref<IconChoice | null>(null)
const formRef = ref<VForm>()

const isLoading = ref(true)
const isSubmitting = ref(false)
const iconPrepError = ref<string | null>(null)
const { error: loadError, capture: captureLoad, reset: resetLoad } = useApiError()
const { error, fieldErrors, capture, reset } = useApiError()

const detailPath = computed(() => `/empresa/tarjetas/${route.params.id}`)

async function fetchCard() {
  const businessId = business.activeId
  if (!businessId)
    return
  resetLoad()
  isLoading.value = true
  try {
    card.value = await getCard(businessId, route.params.id)
    form.value = cardToForm(card.value)
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

/** After a 409 RULES_LOCKED: re-read the card and put the locked rules back to their values. */
async function syncLockedRules(businessId: string) {
  try {
    const fresh = await getCard(businessId, route.params.id)
    const locked = cardToForm(fresh)

    card.value = fresh
    if (form.value) {
      Object.assign(form.value, {
        requiredStamps: locked.requiredStamps,
        cooldownHours: locked.cooldownHours,
        unlimitedCycles: locked.unlimitedCycles,
        maxCycles: locked.maxCycles,
        startsAt: locked.startsAt,
        noEnd: locked.noEnd,
        endsAt: locked.endsAt,
      })
    }
  }
  catch {
    // the RULES_LOCKED message is already shown
  }
}

async function saveIcon(businessId: string, current: StampCard, choice: IconChoice): Promise<boolean> {
  let file: File
  try {
    file = await iconChoiceToFile(choice, current.primaryColor)
  }
  catch {
    iconPrepError.value = 'No pudimos preparar el ícono. Elige otro o sube una imagen.'

    return false
  }
  try {
    card.value = await uploadCardIcon(businessId, current.id, file)
    icon.value = null

    return true
  }
  catch (e) {
    capture(e)

    return false
  }
}

async function submit() {
  const businessId = business.activeId
  if (!businessId || !card.value || !form.value || isSubmitting.value)
    return

  const { valid } = await formRef.value!.validate()
  if (!valid)
    return

  reset()
  iconPrepError.value = null
  isSubmitting.value = true
  try {
    const body = formToUpdateBody(form.value, card.value)
    if (Object.keys(body).length) {
      try {
        card.value = await updateCard(businessId, card.value.id, body)
      }
      catch (e) {
        if (capture(e).error.code === 'RULES_LOCKED')
          await syncLockedRules(businessId)

        return
      }
    }

    // Icon changes are allowed even with locked rules. If it fails, the text changes are already
    // saved: a new submit sends no diff and retries only the icon.
    if (icon.value && !await saveIcon(businessId, card.value, icon.value))
      return

    await router.push(detailPath.value)
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(fetchCard)
</script>

<template>
  <div>
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

    <div
      v-else-if="!card || !form"
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

    <VAlert
      v-else-if="card.status === 'archived'"
      color="secondary"
      variant="tonal"
      rounded="xl"
      icon="tabler-archive"
    >
      Esta tarjeta está archivada y ya no se puede editar.
      <div class="mt-2">
        <VBtn
          size="small"
          variant="text"
          class="px-0"
          :to="detailPath"
        >
          Volver a la tarjeta
        </VBtn>
      </div>
    </VAlert>

    <VForm
      v-else
      ref="formRef"
      @submit.prevent="submit"
    >
      <CardForm
        v-model="form"
        v-model:icon="icon"
        :today="today"
        :field-errors="fieldErrors"
        :rules-locked-at="card.rulesLockedAt"
        :original-ends-on="card.endsOn"
        :existing-icon-url="card.iconUrl"
      />

      <VAlert
        v-if="iconPrepError"
        color="error"
        variant="tonal"
        rounded="lg"
        density="compact"
        icon="tabler-alert-triangle"
        class="mb-4"
      >
        {{ iconPrepError }}
      </VAlert>

      <ApiErrorAlert
        :error="error"
        class="mb-4"
      />

      <VBtn
        type="submit"
        block
        size="large"
        :loading="isSubmitting"
        :style="{ background: form.primaryColor }"
      >
        Guardar cambios
      </VBtn>
    </VForm>
  </div>
</template>
