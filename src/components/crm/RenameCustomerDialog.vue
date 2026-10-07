<script setup lang="ts">
import { renameCustomer } from '@/api/endpoints/crm'
import type { CustomerSummary } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'

// Rename a customer in this business: PATCH …/customers/{customerId} { displayName } (guide §4.A.7).

const props = defineProps<{
  businessId: string
  customerId: string
  currentName: string
}>()

const emit = defineEmits<{
  saved: [summary: CustomerSummary]
}>()

const open = defineModel<boolean>({ default: false })

const name = ref('')
const isLoading = ref(false)
const { error, fieldErrors, capture, reset } = useApiError()

const rules = [
  (v: string) => !!v?.trim() || 'Escribe un nombre.',
  (v: string) => (v?.trim().length ?? 0) <= 100 || 'Máximo 100 caracteres.',
]

const isValid = computed(() => rules.every(rule => rule(name.value) === true))

watch(open, value => {
  if (value) {
    name.value = props.currentName
    reset()
  }
})

const save = async () => {
  if (!isValid.value || isLoading.value)
    return
  isLoading.value = true
  reset()
  try {
    const summary = await renameCustomer(props.businessId, props.customerId, name.value.trim())

    emit('saved', summary)
    open.value = false
  }
  catch (e) {
    capture(e)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="open"
    max-width="420"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <div class="text-h6 font-weight-bold mb-1">
          Cambiar nombre
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Este nombre solo lo ve tu negocio.
        </div>

        <VForm @submit.prevent="save">
          <VTextField
            v-model="name"
            label="Nombre del cliente"
            :rules="rules"
            counter="100"
            maxlength="100"
            autofocus
            :error-messages="fieldErrors.displayName"
          />
          <ApiErrorAlert
            :error="error"
            class="mt-3"
          />
          <div class="d-flex justify-end gap-2 mt-4">
            <VBtn
              variant="text"
              :disabled="isLoading"
              @click="open = false"
            >
              Cancelar
            </VBtn>
            <VBtn
              type="submit"
              color="primary"
              :loading="isLoading"
              :disabled="!isValid"
            >
              Guardar
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
