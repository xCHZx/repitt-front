<script setup lang="ts">
import { recoverPassword } from '@/services/auth/auth'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
    requiredRole: null,
  },
})

const router = useRouter()
const route = useRoute()

const token = route.query.token as string

const password = ref('')
const passwordConfirmation = ref('')
const isPasswordVisible = ref(false)
const isConfirmVisible = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const onSubmit = async () => {
  error.value = null

  if (!password.value || !passwordConfirmation.value) {
    error.value = 'Completa ambos campos.'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  isLoading.value = true
  try {
    await recoverPassword({ password: password.value, token })
    success.value = true
  }
  catch (e: any) {
    error.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <!-- Brand -->
    <div class="auth-brand">
      <img
        src="@/assets/images/logo-v2.png"
        alt="Repitt"
        class="brand-logo"
      >
    </div>

    <!-- Card -->
    <VCard
      rounded="xl"
      class="auth-card"
      elevation="2"
    >
      <VCardText class="pa-6">
        <!-- Success state -->
        <template v-if="success">
          <div class="text-center mb-6">
            <div class="success-icon mb-4">
              <VIcon
                icon="tabler-lock-check"
                size="40"
                color="success"
              />
            </div>
            <div class="text-h6 font-weight-bold mb-2">
              Contraseña actualizada
            </div>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Tu contraseña fue restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>
          <VBtn
            block
            size="large"
            color="primary"
            rounded="xl"
            @click="router.push('/auth/login')"
          >
            Ir al inicio de sesión
          </VBtn>
        </template>

        <!-- Form state -->
        <template v-else>
          <div class="text-h6 font-weight-bold mb-1">
            Nueva contraseña
          </div>
          <p class="text-body-2 text-medium-emphasis mb-5">
            Elige una nueva contraseña para tu cuenta.
          </p>

          <VAlert
            v-if="error"
            color="error"
            variant="tonal"
            rounded="lg"
            density="compact"
            icon="tabler-alert-triangle"
            class="mb-4"
          >
            {{ error }}
          </VAlert>

          <VForm @submit.prevent="onSubmit">
            <AppTextField
              v-model="password"
              autofocus
              label="Nueva contraseña"
              placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
              prepend-inner-icon="tabler-lock"
              class="mb-4"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
            />
            <AppTextField
              v-model="passwordConfirmation"
              label="Confirmar contraseña"
              placeholder="············"
              :type="isConfirmVisible ? 'text' : 'password'"
              :append-inner-icon="isConfirmVisible ? 'tabler-eye-off' : 'tabler-eye'"
              prepend-inner-icon="tabler-lock-check"
              class="mb-5"
              @click:append-inner="isConfirmVisible = !isConfirmVisible"
            />
            <VBtn
              type="submit"
              block
              size="large"
              color="primary"
              rounded="xl"
              :loading="isLoading"
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
      </VCardText>
    </VCard>

    <div class="text-center mt-6">
      <span class="text-caption text-disabled">Repitt © 2026</span>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, rgba(var(--v-theme-primary), 0.07) 0%, rgb(var(--v-theme-background)) 45%);
  min-block-size: 100vh;
  padding-block: 32px;
  padding-inline: 16px;
}

.auth-brand {
  margin-block-end: 28px;
  text-align: center;
}

.brand-logo {
  block-size: auto;
  inline-size: 160px;
}

.auth-card {
  inline-size: 100%;
  max-inline-size: 420px;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--v-theme-success), 0.1);
  block-size: 80px;
  inline-size: 80px;
}
</style>
