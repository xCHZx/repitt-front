<!--
  Email verification link (guide §2.11): `/verify-email#token=…` (token in the fragment).
  POST /v1/auth/email/verify → 204. Works without a session; with one, refresh GET /v1/me.
  410 EMAIL_TOKEN_INVALID → explain (+ resend when signed in) · 409 EMAIL_TAKEN → message.
-->
<script setup lang="ts">
import { authApi } from '@/api'
import AuthShell from '@/components/auth/AuthShell.vue'
import { useFragmentToken } from '@/components/auth/useFragmentToken'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'
import { homeRoute } from '@/utils/home'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const session = useSessionStore()
const token = useFragmentToken()

type State = 'verifying' | 'verified' | 'invalid' | 'taken' | 'error'

const state = ref<State>(token ? 'verifying' : 'invalid')
const resending = ref(false)
const resent = ref(false)

const { error, capture, reset } = useApiError()
const resendError = useApiError()

const router = useRouter()

function goOn() {
  router.replace(session.isAuthenticated ? homeRoute() : '/auth/login')
}

async function refreshMe() {
  if (!session.isAuthenticated)
    return
  try {
    await session.loadMe()
  }
  catch {
    // Not critical: the profile refreshes on the next load
  }
}

async function verify() {
  if (!token)
    return

  reset()
  state.value = 'verifying'
  try {
    await authApi.emailVerify({ token })
    state.value = 'verified'
    await refreshMe()
  }
  catch (e) {
    const { code } = capture(e).error
    if (code === 'EMAIL_TOKEN_INVALID')
      state.value = 'invalid'
    else if (code === 'EMAIL_TAKEN')
      state.value = 'taken'
    else
      state.value = 'error'
  }
}

async function resend() {
  resendError.reset()
  resending.value = true
  try {
    const result = await authApi.emailResend()

    // 204: the email was already verified
    if (result === undefined) {
      await refreshMe()
      state.value = 'verified'
    }
    else {
      resent.value = true
    }
  }
  catch (e) {
    resendError.capture(e)
  }
  finally {
    resending.value = false
  }
}

onMounted(verify)
</script>

<template>
  <AuthShell>
    <div class="text-center">
      <template v-if="state === 'verifying'">
        <VProgressCircular
          indeterminate
          color="primary"
          size="48"
          class="my-6"
        />
        <p class="text-body-1 mb-0">
          Verificando tu correo…
        </p>
      </template>

      <template v-else-if="state === 'verified'">
        <div class="auth-status-icon auth-status-icon--success mb-4">
          <VIcon
            icon="tabler-mail-check"
            size="40"
            color="success"
          />
        </div>
        <div class="text-h6 font-weight-bold mb-2">
          ¡Correo verificado!
        </div>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Gracias por confirmar tu correo. Ya puedes usarlo para entrar y para recuperar tu contraseña.
        </p>
        <VBtn
          block
          size="large"
          color="primary"
          rounded="xl"
          @click="goOn"
        >
          Continuar
        </VBtn>
      </template>

      <template v-else-if="state === 'invalid'">
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
          Los enlaces de verificación vencen en 24 horas, se usan una sola vez y dejan de servir si cambiaste tu correo después.
        </p>

        <template v-if="session.isAuthenticated">
          <VAlert
            v-if="resent"
            color="success"
            variant="tonal"
            rounded="lg"
            density="compact"
            class="mb-4 text-start"
          >
            Te enviamos un enlace nuevo. Revisa tu correo.
          </VAlert>
          <ApiErrorAlert
            :error="resendError.error.value"
            class="mb-4 text-start"
          />
          <VBtn
            block
            size="large"
            color="primary"
            rounded="xl"
            :loading="resending"
            :disabled="resent"
            @click="resend"
          >
            Enviarme un enlace nuevo
          </VBtn>
        </template>
        <template v-else>
          <p class="text-body-2 text-medium-emphasis mb-6">
            Inicia sesión y pide un enlace nuevo desde tu perfil.
          </p>
          <VBtn
            block
            size="large"
            color="primary"
            rounded="xl"
            to="/auth/login"
          >
            Iniciar sesión
          </VBtn>
        </template>
      </template>

      <template v-else-if="state === 'taken'">
        <div class="auth-status-icon auth-status-icon--error mb-4">
          <VIcon
            icon="tabler-mail-x"
            size="40"
            color="error"
          />
        </div>
        <div class="text-h6 font-weight-bold mb-2">
          Este correo ya está en uso
        </div>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Otra cuenta ya verificó este correo. Si es tuyo, usa otro correo en tu perfil o escríbenos a soporte.
        </p>
        <VBtn
          block
          size="large"
          color="primary"
          rounded="xl"
          @click="goOn"
        >
          Continuar
        </VBtn>
      </template>

      <template v-else>
        <ApiErrorAlert
          :error="error"
          class="mb-4 text-start"
        />
        <VBtn
          block
          size="large"
          color="primary"
          rounded="xl"
          @click="verify"
        >
          Intentar de nuevo
        </VBtn>
      </template>
    </div>
  </AuthShell>
</template>
