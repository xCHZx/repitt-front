<!--
  Owner login (guide §2.7): POST /v1/auth/owner/login. 401 INVALID_CREDENTIALS is a form error
  (never a refresh); 403 ACCOUNT_SUSPENDED is routed by the interceptor to /cuenta-suspendida.
-->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import { authApi } from '@/api'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'
import { emailValidator, requiredValidator } from '@core/utils/validators'

const emit = defineEmits<{
  success: []
}>()

const session = useSessionStore()

const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const loading = ref(false)

const { error, fieldErrors, capture, reset } = useApiError()

async function onSubmit(event: SubmitEventPromise) {
  const { valid } = await event
  if (!valid)
    return

  reset()
  loading.value = true
  try {
    const res = await authApi.ownerLogin({ email: email.value.trim(), password: password.value })

    session.applySession(res)
    emit('success')
  }
  catch (e) {
    if (capture(e).error.code === 'INVALID_CREDENTIALS')
      password.value = ''
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <ApiErrorAlert
      v-if="error?.error.code !== 'ACCOUNT_SUSPENDED'"
      :error="error"
      class="mb-4"
    />

    <VForm
      validate-on="submit lazy"
      @submit.prevent="onSubmit"
    >
      <AppTextField
        v-model="email"
        autofocus
        label="Correo"
        type="email"
        autocomplete="email"
        placeholder="hola@negocio.com"
        prepend-inner-icon="tabler-mail"
        :rules="[requiredValidator, emailValidator]"
        :error-messages="fieldErrors.email"
        class="mb-4"
      />
      <AppTextField
        v-model="password"
        label="Contraseña"
        placeholder="············"
        autocomplete="current-password"
        :type="isPasswordVisible ? 'text' : 'password'"
        :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
        :rules="[requiredValidator]"
        :error-messages="fieldErrors.password"
        class="mb-3"
        @click:append-inner="isPasswordVisible = !isPasswordVisible"
      />
      <div class="text-end mb-5">
        <RouterLink
          to="/auth/recuperar-contrasena"
          class="text-primary text-body-2 font-weight-medium"
        >
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </div>

      <VBtn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="xl"
        :loading="loading"
      >
        Entrar
      </VBtn>
    </VForm>
  </div>
</template>
