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
      density="comfortable"
      class="d-flex mb-5"
    >
      <VBtn
        value="email"
        class="recover-method"
        size="small"
      >
        <VIcon
          icon="tabler-mail"
          size="18"
          class="recover-method__icon"
        />
        Por correo
      </VBtn>
      <VBtn
        value="phone"
        class="recover-method"
        size="small"
      >
        <VIcon
          icon="tabler-device-mobile"
          size="18"
          class="recover-method__icon"
        />
        Por teléfono
      </VBtn>
    </VBtnToggle>

    <PasswordForgotEmail v-if="method === 'email'" />
    <PasswordResetPhone
      v-else
      @done="onPhoneResetDone"
    />

    <VDivider class="my-5" />

    <div class="text-body-2">
      <RouterLink
        to="/auth/login?modo=negocio"
        class="auth-link font-weight-medium"
      >
        ← Volver al inicio de sesión
      </RouterLink>
    </div>
  </AuthShell>
</template>

<style lang="scss" scoped>
// Dos fichas iguales. Por debajo de 400px el ícono se oculta para que «Por teléfono» quepa en la tarjeta.
.recover-method {
  flex: 1 1 0;
  min-inline-size: 0;
  padding-inline: var(--s-2) !important;
}

.recover-method__icon {
  margin-inline-end: var(--s-2);

  @media (max-width: 399.98px) {
    display: none;
  }
}
</style>
