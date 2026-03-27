<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators'
import { registerVisitor } from '@/services/auth/auth'
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

const form = ref({ firstName: '', lastName: '', phone: '' })
const isLoading = ref(false)
const error = ref<string | null>(null)

const isSuccess = ref(false)

const onSubmit = async () => {
  error.value = null
  isLoading.value = true
  try {
    await registerVisitor({ firstName: form.value.firstName, lastName: form.value.lastName, phone: '+52' + form.value.phone })
    isSuccess.value = true
    localStorage.setItem('auth', JSON.stringify(authStore.$state))
    await new Promise(resolve => setTimeout(resolve, 1500))
    await router.push(authStore.authRole === 'Visitor' ? '/visitante' : '/404')
    location.reload()
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
  <div class="vr-page">
    <!-- Hero -->
    <div class="vr-hero">
      <div class="vr-hero__content">
        <!-- Cluster de íconos decorativos -->
        <div class="vr-hero__icons" aria-hidden="true">
          <VIcon
            icon="tabler-star-filled"
            size="18"
            class="vr-hero__star vr-hero__star--1"
          />
          <div class="vr-hero__badge">
            <VIcon icon="tabler-rosette-discount-check" size="48" />
          </div>
          <VIcon
            icon="tabler-star-filled"
            size="14"
            class="vr-hero__star vr-hero__star--2"
          />
        </div>

        <h1 class="vr-hero__title">
          ¡Gana recompensas<br>sin complicaciones!
        </h1>
        <p class="vr-hero__subtitle">
          Acumula sellos en tus negocios favoritos y canjea premios gratis
        </p>

        <!-- Beneficios -->
        <div class="vr-hero__benefits">
          <div class="vr-benefit">
            <VIcon icon="tabler-check" size="13" />
            Gratis
          </div>
          <div class="vr-benefit">
            <VIcon icon="tabler-check" size="13" />
            Sin contraseña
          </div>
          <div class="vr-benefit">
            <VIcon icon="tabler-check" size="13" />
            Listo en segundos
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="vr-form-section">
      <div class="vr-form-inner">
        <div class="text-h5 font-weight-bold mb-1">
          Crea tu cuenta
        </div>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Solo necesitas tu nombre, apellido y número de teléfono
        </p>

        <VAlert
          v-if="error"
          color="error"
          variant="tonal"
          rounded="lg"
          density="compact"
          icon="tabler-alert-triangle"
          class="mb-5"
        >
          {{ error }}
        </VAlert>

        <VForm @submit.prevent="onSubmit">
          <div class="d-flex flex-column" style="gap: 16px;">
            <VTextField
              v-model="form.firstName"
              label="Nombre"
              placeholder="Tu nombre"
              variant="outlined"
              prepend-inner-icon="tabler-user"
              hide-details="auto"
              :rules="[requiredValidator]"
              autofocus
            />

            <VTextField
              v-model="form.lastName"
              label="Apellido"
              placeholder="Tu apellido"
              variant="outlined"
              prepend-inner-icon="tabler-user"
              hide-details="auto"
              :rules="[requiredValidator]"
            />

            <VTextField
              v-model="form.phone"
              label="Teléfono"
              type="tel"
              placeholder="1234567890"
              variant="outlined"
              hide-details="auto"
              :rules="[requiredValidator]"
              class="phone-field"
            >
              <template #prepend-inner>
                <span class="text-body-2 text-medium-emphasis ps-1" style="white-space: nowrap;">🇲🇽 +52</span>
                <VDivider
                  vertical
                  class="mx-2 my-1"
                />
              </template>
            </VTextField>

            <VBtn
              type="submit"
              size="large"
              block
              :color="isSuccess ? 'success' : 'primary'"
              rounded="xl"
              :loading="isLoading"
              :disabled="isSuccess"
              class="mt-2"
            >
              <VIcon
                v-if="isSuccess"
                icon="tabler-check"
                start
              />
              {{ isSuccess ? '¡Listo, bienvenido!' : 'Empezar a ganar 🎉' }}
            </VBtn>
          </div>
        </VForm>

        <div class="text-center mt-6">
          <span class="text-medium-emphasis text-body-2">¿Ya tienes cuenta?</span>
          <a
            class="text-primary ms-1 text-body-2 font-weight-medium"
            href="/auth/login"
          >Inicia sesión</a>
        </div>

        <VDivider class="my-5" />

        <div class="text-center">
          <a
            class="text-medium-emphasis text-caption"
            href="/auth/registro/negocio"
          >¿Eres dueño de un negocio? Regístrate aquí →</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vr-page {
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
  min-block-size: 100dvh;
}

// ─── Hero ───────────────────────────────────────────────────
.vr-hero {
  flex-shrink: 0;
  background: linear-gradient(150deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  padding-block: 48px 80px;
  padding-inline: 24px;
  text-align: center;
}

.vr-hero__content {
  margin-inline: auto;
  max-inline-size: 400px;
}

.vr-hero__icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-block-end: 20px;
}

.vr-hero__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255 255 255 / 20%);
  block-size: 80px;
  color: white;
  inline-size: 80px;
}

.vr-hero__star {
  color: rgba(255 255 255 / 70%);

  &--1 {
    transform: translateY(-6px);
  }

  &--2 {
    transform: translateY(6px);
  }
}

.vr-hero__title {
  color: white;
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.25;
  margin-block-end: 12px;
}

.vr-hero__subtitle {
  color: rgba(255 255 255 / 85%);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-block-end: 24px;
}

.vr-hero__benefits {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.vr-benefit {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(255 255 255 / 18%);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  gap: 4px;
  padding-block: 4px;
  padding-inline: 12px;
}

// ─── Formulario ─────────────────────────────────────────────
.vr-form-section {
  flex: 1;
  border-radius: 28px 28px 0 0;
  background: rgb(var(--v-theme-surface));
  margin-block-start: -32px;
  padding-block: 8px 40px;
  padding-inline: 16px;
}

.vr-form-inner {
  margin-inline: auto;
  max-inline-size: 480px;
  padding-block-start: 32px;
}

</style>

<style>
.phone-field .v-field__prepend-inner {
  align-items: center;
  padding-inline-end: 0;
}
</style>
