<!-- Name capture after creating an account by phone (guide §2.5): PATCH /v1/me { firstName, lastName }. -->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import { meApi } from '@/api'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'
import { requiredValidator } from '@core/utils/validators'

const emit = defineEmits<{
  done: []
}>()

const session = useSessionStore()
const firstName = ref(session.me?.firstName ?? '')
const lastName = ref(session.me?.lastName ?? '')
const saving = ref(false)

const { error, fieldErrors, capture, reset } = useApiError()

async function onSubmit(event: SubmitEventPromise) {
  const { valid } = await event
  if (!valid)
    return

  reset()
  saving.value = true
  try {
    session.me = await meApi.updateMe({
      firstName: firstName.value.trim(),
      ...(lastName.value.trim() ? { lastName: lastName.value.trim() } : {}),
    })
    emit('done')
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
  <div>
    <div class="text-h6 font-weight-bold mb-1">
      ¡Bienvenido/a a Repitt!
    </div>
    <p class="text-body-2 text-medium-emphasis mb-5">
      ¿Cómo te llamas? Así te reconocerán en tus negocios favoritos.
    </p>

    <ApiErrorAlert
      :error="error"
      class="mb-4"
    />

    <VForm
      validate-on="submit lazy"
      @submit.prevent="onSubmit"
    >
      <div class="d-flex flex-column gap-4">
        <VTextField
          v-model="firstName"
          autofocus
          label="Nombre *"
          placeholder="Tu nombre"
          autocomplete="given-name"
          variant="outlined"
          prepend-inner-icon="tabler-user"
          :rules="[requiredValidator]"
          :error-messages="fieldErrors.firstName"
        />
        <VTextField
          v-model="lastName"
          label="Apellido (opcional)"
          placeholder="Tu apellido"
          autocomplete="family-name"
          variant="outlined"
          prepend-inner-icon="tabler-user"
          :error-messages="fieldErrors.lastName"
        />
        <VBtn
          type="submit"
          block
          size="large"
          color="primary"
          rounded="xl"
          :loading="saving"
        >
          Continuar
        </VBtn>
      </div>
    </VForm>
  </div>
</template>
