<script setup lang="ts">
import { emailValidator, requiredValidator } from '@/@core/utils/validators'
import { onboardingUser } from '@/services/auth/auth'
import { getAllCategories } from '@/services/catalog/categories'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
    requiredRole: null,
  },
})

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const categoriesList = ref([{ title: 'Cargando categorías...', value: null as any }])

const ownerForm = ref({ firstName: '', lastName: '', phone: '', email: '', password: '' })
const businessForm = ref({ businessName: '', categories: null as any })
const isPasswordVisible = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const getCategories = async () => {
  try {
    const response = await getAllCategories()

    categoriesList.value = response.map((c: any) => ({
      title: c.name,
      value: { id: c.id, name: c.name },
    }))
  }
  catch {
    // silently ignore
  }
}

const isSuccess = ref(false)

const onFormSubmit = async () => {
  error.value = null
  isLoading.value = true
  try {
    await onboardingUser({
      firstName: ownerForm.value.firstName,
      lastName: ownerForm.value.lastName,
      email: ownerForm.value.email,
      password: ownerForm.value.password,
      phone: '+52' + ownerForm.value.phone,
      businessName: businessForm.value.businessName,
      categoryId: businessForm.value.categories?.id || null,
    })
    isSuccess.value = true
    localStorage.setItem('auth', JSON.stringify(authStore.$state))
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push({ path: '/empresa/planes', query: { welcome: 'true' } })
  }
  catch (e: any) {
    error.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  getCategories()
})
</script>

<template>
  <div class="nr-page">
    <!-- Hero -->
    <div class="nr-hero">
      <div class="nr-hero__content">
        <div class="nr-hero__icons" aria-hidden="true">
          <VIcon
            icon="tabler-star-filled"
            size="18"
            class="nr-hero__star nr-hero__star--1"
          />
          <div class="nr-hero__badge">
            <VIcon icon="tabler-building-store" size="48" />
          </div>
          <VIcon
            icon="tabler-star-filled"
            size="14"
            class="nr-hero__star nr-hero__star--2"
          />
        </div>

        <h1 class="nr-hero__title">
          ¡Haz crecer<br>tu negocio!
        </h1>
        <p class="nr-hero__subtitle">
          Crea tu programa de fidelización y mantén a tus clientes volviendo
        </p>

        <div class="nr-hero__benefits">
          <div class="nr-benefit">
            <VIcon icon="tabler-check" size="13" />
            Fácil de usar
          </div>
          <div class="nr-benefit">
            <VIcon icon="tabler-check" size="13" />
            Sin límite de clientes
          </div>
          <div class="nr-benefit">
            <VIcon icon="tabler-check" size="13" />
            Listo en minutos
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="nr-form-section">
      <div class="nr-form-inner">
        <div class="text-h5 font-weight-bold mb-1">
          Registra tu negocio
        </div>
        <p class="text-body-2 text-medium-emphasis mb-5">
          Al registrar tu negocio también se crea tu perfil de visitante
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

        <VForm @submit.prevent="onFormSubmit">
          <!-- Datos personales -->
          <div class="text-overline text-medium-emphasis mb-3">
            Tus datos
          </div>

          <div class="d-flex flex-column" style="gap: 16px;">
            <VRow>
              <VCol
                cols="12"
                md="6"
                class="pb-0"
              >
                <VTextField
                  v-model="ownerForm.firstName"
                  placeholder="Juan"
                  label="Nombre(s) *"
                  variant="outlined"
                  prepend-inner-icon="tabler-user"
                  hide-details="auto"
                  :rules="[requiredValidator]"
                  autofocus
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
                class="pb-0"
              >
                <VTextField
                  v-model="ownerForm.lastName"
                  placeholder="Pérez"
                  label="Apellido(s) *"
                  variant="outlined"
                  prepend-inner-icon="tabler-user"
                  hide-details="auto"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VTextField
              v-model="ownerForm.phone"
              placeholder="1234567890"
              label="Teléfono *"
              variant="outlined"
              class="phone-field"
              type="tel"
              hide-details="auto"
              :rules="[requiredValidator]"
            >
              <template #prepend-inner>
                <span class="text-body-2 text-medium-emphasis ps-1" style="white-space: nowrap;">🇲🇽 +52</span>
                <VDivider vertical class="mx-2 my-1" />
              </template>
            </VTextField>

            <VTextField
              v-model="ownerForm.email"
              type="email"
              variant="outlined"
              label="Email *"
              placeholder="tucorreo@ejemplo.com"
              prepend-inner-icon="tabler-mail"
              hide-details="auto"
              :rules="[requiredValidator, emailValidator]"
            />

            <VTextField
              v-model="ownerForm.password"
              autocomplete="on"
              variant="outlined"
              label="Contraseña *"
              placeholder="············"
              prepend-inner-icon="tabler-lock"
              hide-details="auto"
              :rules="[requiredValidator]"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
            />
          </div>

          <VDivider class="my-6" />

          <!-- Datos del negocio -->
          <div class="text-overline text-medium-emphasis mb-3">
            Tu negocio
          </div>

          <div class="d-flex flex-column" style="gap: 16px;">
            <VTextField
              v-model="businessForm.businessName"
              prepend-inner-icon="tabler-building-store"
              variant="outlined"
              label="Nombre del Negocio *"
              placeholder="Mi Café"
              hide-details="auto"
              :rules="[requiredValidator]"
            />

            <VSelect
              v-model="businessForm.categories"
              :items="categoriesList"
              label="Giro del Negocio *"
              prepend-inner-icon="tabler-tag"
              variant="outlined"
              hide-details="auto"
              :rules="[requiredValidator]"
            />
          </div>

          <VBtn
            type="submit"
            block
            size="large"
            :color="isSuccess ? 'success' : 'primary'"
            rounded="xl"
            :loading="isLoading"
            :disabled="isSuccess"
            class="mt-6"
          >
            <VIcon
              v-if="isSuccess"
              icon="tabler-check"
              start
            />
            {{ isSuccess ? '¡Cuenta creada!' : 'Crear cuenta' }}
          </VBtn>
        </VForm>

        <div class="text-center mt-6">
          <span class="text-medium-emphasis text-body-2">¿Ya tienes una cuenta?</span>
          <a
            class="text-primary ms-1 text-body-2 font-weight-medium"
            href="/auth/login"
          >Inicia sesión</a>
        </div>

        <VDivider class="my-5" />

        <div class="text-center">
          <a
            class="text-medium-emphasis text-caption"
            href="/auth/registro/visitante"
          >¿Solo quieres acumular recompensas? Regístrate como visitante →</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nr-page {
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
  min-block-size: 100dvh;
}

// ─── Hero ───────────────────────────────────────────────────
.nr-hero {
  flex-shrink: 0;
  background: linear-gradient(150deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  padding-block: 48px 80px;
  padding-inline: 24px;
  text-align: center;
}

.nr-hero__content {
  margin-inline: auto;
  max-inline-size: 400px;
}

.nr-hero__icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-block-end: 20px;
}

.nr-hero__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255 255 255 / 20%);
  block-size: 80px;
  color: white;
  inline-size: 80px;
}

.nr-hero__star {
  color: rgba(255 255 255 / 70%);

  &--1 {
    transform: translateY(-6px);
  }

  &--2 {
    transform: translateY(6px);
  }
}

.nr-hero__title {
  color: white;
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.25;
  margin-block-end: 12px;
}

.nr-hero__subtitle {
  color: rgba(255 255 255 / 85%);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-block-end: 24px;
}

.nr-hero__benefits {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.nr-benefit {
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
.nr-form-section {
  flex: 1;
  border-radius: 28px 28px 0 0;
  background: rgb(var(--v-theme-surface));
  margin-block-start: -32px;
  padding-block: 8px 48px;
  padding-inline: 16px;
}

.nr-form-inner {
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
