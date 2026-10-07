<!--
  Reset link from the email (guide §2.10): `/reset-password#token=…` (token in the fragment).
  204 revokes every session and does not sign in → login. 410 RESET_TOKEN_INVALID → new link.
  A rejected password (passwordTooCommon…) keeps the link valid for another try.
-->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import { authApi } from '@/api'
import AuthShell from '@/components/auth/AuthShell.vue'
import NewPasswordFields from '@/components/auth/NewPasswordFields.vue'
import { useFragmentToken } from '@/components/auth/useFragmentToken'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()
const session = useSessionStore()

const token = useFragmentToken()

const password = ref('')
const loading = ref(false)
const linkInvalid = ref(!token)

const { error, fieldErrors, capture, reset } = useApiError()

async function onSubmit(event: SubmitEventPromise) {
  const { valid } = await event
  if (!valid || !token)
    return

  reset()
  loading.value = true
  try {
    await authApi.passwordReset({ token, password: password.value })
    session.clear()
    await router.replace({ path: '/auth/login', query: { reset: '1' } })
  }
  catch (e) {
    if (capture(e).error.code === 'RESET_TOKEN_INVALID')
      linkInvalid.value = true
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <div
      v-if="linkInvalid"
      class="text-center"
    >
      <div class="auth-status-icon auth-status-icon--warning mb-4">
        <VIcon
          icon="tabler-link-off"
          size="40"
          color="warning"
        />
      </div>
      <div class="text-h6 font-weight-bold mb-2">
        Este enlace ya no es válido
      </div>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Los enlaces para restablecer la contraseña vencen en 1 hora y solo se pueden usar una vez. Solicita un enlace nuevo.
      </p>
      <VBtn
        block
        size="large"
        color="primary"
        rounded="xl"
        to="/auth/recuperar-contrasena"
      >
        Solicitar un enlace nuevo
      </VBtn>
    </div>

    <template v-else>
      <div class="text-h6 font-weight-bold mb-1">
        Nueva contraseña
      </div>
      <p class="text-body-2 text-medium-emphasis mb-5">
        Elige una nueva contraseña para tu cuenta. Al cambiarla cerraremos tus sesiones abiertas.
      </p>

      <ApiErrorAlert
        v-if="!fieldErrors.password"
        :error="error"
        class="mb-4"
      />

      <VForm
        validate-on="submit lazy"
        @submit.prevent="onSubmit"
      >
        <NewPasswordFields
          v-model="password"
          autofocus
          :error-messages="fieldErrors.password"
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
          Cambiar contraseña
        </VBtn>
      </VForm>
    </template>

    <VDivider class="my-5" />

    <div class="text-center text-body-2">
      <RouterLink
        to="/auth/login"
        class="text-primary font-weight-medium"
      >
        ← Volver al inicio de sesión
      </RouterLink>
    </div>
  </AuthShell>
</template>
