<script setup lang="ts">
import { updateMe } from '@/api/endpoints/me'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// PATCH /v1/me { firstName, lastName } (guide §2.12). `lastName: null` clears it; phone is never sent here.

const emit = defineEmits<{ saved: [] }>()

const isOpen = defineModel<boolean>({ required: true })

const session = useSessionStore()
const { error, fieldErrors, capture, reset } = useApiError()

const firstName = ref('')
const lastName = ref('')
const saving = ref(false)

watch(isOpen, open => {
  if (!open)
    return
  reset()
  firstName.value = session.me?.firstName ?? ''
  lastName.value = session.me?.lastName ?? ''
})

const canSave = computed(() => firstName.value.trim().length > 0 && !saving.value)

async function save() {
  if (!canSave.value)
    return
  saving.value = true
  reset()
  try {
    session.me = await updateMe({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim() || null,
    })
    isOpen.value = false
    emit('saved')
  }
  catch (e) {
    capture(e)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="480"
  >
    <VCard
      rounded="xl"
      title="Editar nombre"
    >
      <VCardText>
        <VForm @submit.prevent="save">
          <VTextField
            v-model="firstName"
            label="Nombre"
            prepend-inner-icon="tabler-user"
            autocomplete="given-name"
            :error-messages="fieldErrors.firstName"
            class="mb-4"
          />
          <VTextField
            v-model="lastName"
            label="Apellido (opcional)"
            prepend-inner-icon="tabler-user"
            autocomplete="family-name"
            :error-messages="fieldErrors.lastName"
            class="mb-2"
          />
          <ApiErrorAlert
            v-if="error && !Object.keys(error.fieldErrors).length"
            :error="error"
          />
        </VForm>
      </VCardText>
      <VCardActions class="justify-end gap-2 pb-4 px-4">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isOpen = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="!canSave"
          @click="save"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
