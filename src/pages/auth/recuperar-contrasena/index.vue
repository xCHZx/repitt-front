<!--
  Password recovery (guide §2.10): by email link or by phone code. A successful reset revokes
  every session and does not sign in: go to login.
-->
<script setup lang="ts">
import AuthShell from '@/components/auth/AuthShell.vue'
import PasswordForgotEmail from '@/components/auth/PasswordForgotEmail.vue'
import PasswordResetPhone from '@/components/auth/PasswordResetPhone.vue'
import { useSessionStore } from '@/stores/session'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()
const session = useSessionStore()

const method = ref<'email' | 'phone'>('email')

function onPhoneResetDone() {
  // 204 revoked every session, including this one if there was any
  session.clear()
  router.replace({ path: '/auth/login', query: { reset: '1' } })
}
</script>

<template>
  <AuthShell>
    <div class="text-h6 font-weight-bold mb-4">
      Recuperar contraseña
    </div>

    <VBtnToggle
      v-model="method"
      mandatory
      divided
      color="primary"
      variant="outlined"
      rounded="xl"
      density="comfortable"
      class="d-flex mb-5"
    >
      <VBtn
        value="email"
        class="flex-grow-1"
        prepend-icon="tabler-mail"
      >
        Por correo
      </VBtn>
      <VBtn
        value="phone"
        class="flex-grow-1"
        prepend-icon="tabler-device-mobile"
      >
        Por teléfono
      </VBtn>
    </VBtnToggle>

    <PasswordForgotEmail v-if="method === 'email'" />
    <PasswordResetPhone
      v-else
      @done="onPhoneResetDone"
    />

    <VDivider class="my-5" />

    <div class="text-center text-body-2">
      <RouterLink
        to="/auth/login?modo=negocio"
        class="text-primary font-weight-medium"
      >
        ← Volver al inicio de sesión
      </RouterLink>
    </div>
  </AuthShell>
</template>
