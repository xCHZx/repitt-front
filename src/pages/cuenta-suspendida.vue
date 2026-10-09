<!-- Suspended account (guide §3.5): fixed screen, no retries, no API calls. -->
<script setup lang="ts">
import AuthShell from '@/components/auth/AuthShell.vue'
import { useSessionStore } from '@/stores/session'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()
const session = useSessionStore()

function goToLogin() {
  // Local only: leaves the "suspended" state so the router lets the login screen through
  session.clear()
  router.replace('/auth/login')
}
</script>

<template>
  <AuthShell>
    <div>
      <div class="auth-status-icon auth-status-icon--error mb-4">
        <VIcon
          icon="tabler-user-off"
          size="32"
        />
      </div>
      <div class="text-h6 font-weight-bold mb-2">
        Tu cuenta está suspendida
      </div>
      <p class="text-body-2 text-medium-emphasis mb-2">
        Por ahora no puedes usar Repitt con esta cuenta.
      </p>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Si crees que se trata de un error, escríbenos a soporte desde el correo o el teléfono de tu cuenta y con gusto lo revisamos.
      </p>
      <VBtn
        block
        size="large"
        variant="tonal"
        @click="goToLogin"
      >
        Ir al inicio de sesión
      </VBtn>
    </div>
  </AuthShell>
</template>
