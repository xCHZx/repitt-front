<!-- Password reset link by email (guide §2.10): always 202, neutral confirmation (no enumeration). -->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import { authApi } from '@/api'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { emailValidator, requiredValidator } from '@core/utils/validators'

const email = ref('')
const loading = ref(false)
const sent = ref(false)

const { error, fieldErrors, capture, reset } = useApiError()

async function onSubmit(event: SubmitEventPromise) {
  const { valid } = await event
  if (!valid)
    return

  reset()
  loading.value = true
  try {
    await authApi.passwordForgot({ email: email.value.trim() })
    sent.value = true
  }
  catch (e) {
    capture(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="sent">
    <div class="auth-status-icon auth-status-icon--success mb-4">
      <VIcon
        icon="tabler-mail-check"
        size="32"
      />
    </div>
    <div class="text-h6 font-weight-bold mb-2">
      Revisa tu correo
    </div>
    <p class="text-body-2 text-medium-emphasis mb-0">
      Si existe una cuenta con contraseña y correo verificado para <strong>{{ email }}</strong>, te enviamos un enlace para restablecerla. Vence en 1 hora. No olvides revisar spam.
    </p>
    <p class="text-body-2 text-medium-emphasis mt-3 mb-0">
      ¿No te llega? Si nunca verificaste tu correo, usa la opción por teléfono.
    </p>
  </div>

  <template v-else>
    <p class="text-body-2 text-medium-emphasis mb-5">
      Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva.
    </p>

    <ApiErrorAlert
      v-if="!fieldErrors.email"
      :error="error"
      class="mb-4"
    />

    <VForm
      validate-on="submit lazy"
      @submit.prevent="onSubmit"
    >
      <VTextField
        v-model="email"
        autofocus
        label="Correo"
        type="email"
        autocomplete="email"
        variant="outlined"
        placeholder="hola@negocio.com"
        prepend-inner-icon="tabler-mail"
        :rules="[requiredValidator, emailValidator]"
        :error-messages="fieldErrors.email"
        class="mb-5"
      />
      <VBtn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="xl"
        :loading="loading"
      >
        Enviar enlace
      </VBtn>
    </VForm>
  </template>
</template>
