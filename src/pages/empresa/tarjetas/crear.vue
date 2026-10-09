<script lang="ts" setup>
import { VForm } from 'vuetify/components/VForm'
import { createCard, uploadCardIcon } from '@/api/endpoints/cards'
import { describeError } from '@/api/messages'
import type { StampCard } from '@/api/types'
import CardForm from '@/components/cards/CardForm.vue'
import { iconChoiceToFile } from '@/components/cards/cardIcons'
import type { IconChoice } from '@/components/cards/cardIcons'
import { emptyCardForm, formToCreateBody } from '@/components/cards/cardForm'
import type { CardFormModel } from '@/components/cards/cardForm'
import { pendingIconUpload } from '@/components/cards/pendingIcon'
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

const router = useRouter()
const business = useBusinessStore()

const today = computed(() => todayInZone(business.timezone))

const form = ref<CardFormModel>(emptyCardForm(today.value))
const icon = ref<IconChoice | null>(null)
const formRef = ref<VForm>()

const { error, fieldErrors, capture, reset } = useApiError()
const isSubmitting = ref(false)

/** Upload the chosen icon; on failure hand it to the detail page (the card already exists). */
async function uploadIcon(businessId: string, card: StampCard, choice: IconChoice) {
  let file: File | null = null
  try {
    file = await iconChoiceToFile(choice, form.value.primaryColor)
    await uploadCardIcon(businessId, card.id, file)
  }
  catch (e) {
    pendingIconUpload.value = { cardId: card.id, file, error: file ? describeError(e) : null }
  }
}

async function submit() {
  const businessId = business.activeId
  if (!businessId || isSubmitting.value)
    return

  const { valid } = await formRef.value!.validate()
  if (!valid)
    return

  reset()
  isSubmitting.value = true

  let card: StampCard
  try {
    card = await createCard(businessId, formToCreateBody(form.value))
  }
  catch (e) {
    capture(e)
    isSubmitting.value = false

    return
  }

  if (icon.value)
    await uploadIcon(businessId, card, icon.value)

  // replace: going back must not land on the form again and create a duplicate
  await router.replace(`/empresa/tarjetas/${card.id}?nueva=1`)
}
</script>

<template>
  <VForm
    ref="formRef"
    @submit.prevent="submit"
  >
    <CardForm
      v-model="form"
      v-model:icon="icon"
      :today="today"
      :field-errors="fieldErrors"
    />

    <div class="text-caption text-medium-emphasis mb-4">
      La tarjeta se guarda como borrador: tus clientes no la verán hasta que la publiques.
    </div>

    <ApiErrorAlert
      :error="error"
      class="mb-4"
    />

    <VBtn
      type="submit"
      block
      size="large"
      :loading="isSubmitting"
    >
      Crear tarjeta
    </VBtn>
  </VForm>
</template>
