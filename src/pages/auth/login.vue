<script setup lang="ts">
import { loginUser, loginVisitor } from '@/services/auth/auth'
import { useAuthStore } from '@/stores/auth'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
    requiredRole: null,
  },
})

const authStore = useAuthStore()
const router = useRouter()

const selectedUserType = ref<'visitor' | 'owner'>('visitor')
const ownerForm = ref({ email: '', password: '' })
const visitorPhone = ref('')
const isPasswordVisible = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const redirecting = ref(false)
const redirectAfterLogin = async () => {
  redirecting.value = true
  // Forzar escritura síncrona a localStorage antes del reload
  // El plugin de persistencia de Pinia escribe async (via watch), lo que causa
  // que location.reload() recargue antes de que el token esté persistido.
  localStorage.setItem('auth', JSON.stringify(authStore.$state))

  await new Promise(resolve => setTimeout(resolve, 900))

  if (authStore.authRole === 'Owner')
    await router.push('/empresa')
  else if (authStore.authRole === 'Visitor')
    await router.push('/visitante')
  else
    await router.push('/404')

  location.reload()
}

const onSubmit = async () => {
  error.value = null
  isLoading.value = true
  try {
    if (selectedUserType.value === 'visitor')
      await loginVisitor('+52' + visitorPhone.value)
    else
      await loginUser(ownerForm.value)

    await redirectAfterLogin()
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
        <!-- Redirecting state -->
        <template v-if="redirecting">
          <div class="text-center py-8">
            <div class="success-icon mb-4">
              <VIcon
                icon="tabler-circle-check-filled"
                size="48"
                color="success"
              />
            </div>
            <div class="text-h6 font-weight-bold mb-1">
              ¡Bienvenido/a!
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Iniciando sesión...
            </p>
          </div>
        </template>

        <!-- Type selector -->
        <template v-else>
        <div class="type-cards mb-6">
          <VCard
            rounded="xl"
            class="type-card"
            :class="{ 'type-card--active': selectedUserType === 'visitor' }"
            :style="selectedUserType === 'visitor' ? { boxShadow: '0 0 0 3px rgba(var(--v-theme-primary), 0.15), 0 4px 20px rgba(var(--v-theme-primary), 0.3)' } : {}"
            @click="selectedUserType = 'visitor'"
          >
            <VIcon
              v-if="selectedUserType === 'visitor'"
              icon="tabler-circle-check-filled"
              color="primary"
              size="36"
              class="type-card__check"
            />
            <VCardText class="pa-4 text-center">
              <div
                class="type-card__icon mb-3"
                :class="{ 'type-card__icon--active': selectedUserType === 'visitor' }"
              >
                <VIcon
                  icon="tabler-user-heart"
                  size="28"
                  color="primary"
                />
              </div>
              <div class="text-body-2 font-weight-bold mb-1">
                Soy visitante
              </div>
              <div class="text-caption text-medium-emphasis">
                Accede con tu teléfono
              </div>
            </VCardText>
          </VCard>

          <VCard
            rounded="xl"
            class="type-card"
            :class="{ 'type-card--active': selectedUserType === 'owner' }"
            :style="selectedUserType === 'owner' ? { boxShadow: '0 0 0 3px rgba(var(--v-theme-primary), 0.15), 0 4px 20px rgba(var(--v-theme-primary), 0.3)' } : {}"
            @click="selectedUserType = 'owner'"
          >
            <VIcon
              v-if="selectedUserType === 'owner'"
              icon="tabler-circle-check-filled"
              color="primary"
              size="36"
              class="type-card__check"
            />
            <VCardText class="pa-4 text-center">
              <div
                class="type-card__icon mb-3"
                :class="{ 'type-card__icon--active': selectedUserType === 'owner' }"
              >
                <VIcon
                  icon="tabler-building-store"
                  size="28"
                  color="primary"
                />
              </div>
              <div class="text-body-2 font-weight-bold mb-1">
                Tengo un negocio
              </div>
              <div class="text-caption text-medium-emphasis">
                Accede con tu email
              </div>
            </VCardText>
          </VCard>
        </div>

        <!-- Error -->
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
          <!-- Visitor: teléfono -->
          <template v-if="selectedUserType === 'visitor'">
            <VTextField
              v-model="visitorPhone"
              autofocus
              label="Teléfono"
              type="tel"
              placeholder="1234567890"
              variant="outlined"
              hide-details
              class="phone-field mb-2"
            >
              <template #prepend-inner>
                <span class="text-body-2 text-medium-emphasis ps-1" style="white-space: nowrap;">🇲🇽 +52</span>
                <VDivider
                  vertical
                  class="mx-2 my-1"
                />
              </template>
            </VTextField>
            <p class="text-caption text-medium-emphasis mb-5">
              ¿Tienes un negocio en Repitt?
              <span
                class="text-primary font-weight-medium"
                style="cursor: pointer;"
                @click="selectedUserType = 'owner'"
              >Accede con tu email</span>
            </p>
          </template>

          <!-- Owner: email + contraseña -->
          <template v-else>
            <AppTextField
              v-model="ownerForm.email"
              autofocus
              label="Email"
              type="email"
              placeholder="hola@negocio.com"
              prepend-inner-icon="tabler-mail"
              class="mb-4"
            />
            <AppTextField
              v-model="ownerForm.password"
              label="Contraseña"
              placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
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
          </template>

          <VBtn
            type="submit"
            block
            size="large"
            color="primary"
            rounded="xl"
            :loading="isLoading"
          >
            Entrar
          </VBtn>
        </VForm>

        <VDivider class="my-5" />

        <div class="text-center text-body-2">
          ¿No tienes cuenta?
          <RouterLink
            to="/auth/registro"
            class="text-primary font-weight-bold ms-1"
          >
            Regístrate
          </RouterLink>
        </div>
        </template>
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

.type-cards {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.type-card {
  position: relative;
  overflow: visible;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &--active {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.15), 0 4px 20px rgba(var(--v-theme-primary), 0.25);
  }

  &__check {
    position: absolute;
    inset-block-start: -12px;
    inset-inline-end: -12px;
  }
}

.type-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  block-size: 56px;
  inline-size: 56px;
  transition: background 0.2s ease;

  &--active {
    background: rgba(var(--v-theme-primary), 0.15);
  }
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--v-theme-success), 0.1);
  block-size: 88px;
  inline-size: 88px;
}
</style>

<style>
.phone-field .v-field__prepend-inner {
  align-items: center;
  padding-inline-end: 0;
}
</style>
