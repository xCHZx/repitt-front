<!--
  Customer sign-up (guide §2.5): name first, then the phone OTP flow. `firstName` goes in
  otp/verify (used only if the phone is new); `lastName` goes through PATCH /v1/me afterwards.
-->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import { meApi } from '@/api'
import type { OtpSession } from '@/api/types'
import AuthHeroLayout from '@/components/auth/AuthHeroLayout.vue'
import PhoneOtpFlow from '@/components/auth/PhoneOtpFlow.vue'
import ProfileNameForm from '@/components/auth/ProfileNameForm.vue'
import { useSessionStore } from '@/stores/session'
import { afterLoginRoute } from '@/utils/home'
import { requiredValidator } from '@core/utils/validators'

definePage({
  meta: {
    layout: 'blank',
    public: true,
    guestOnly: true,
  },
})

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const step = ref<'name' | 'phone' | 'askName'>('name')
const form = ref({ firstName: '', lastName: '' })
const finishing = ref(false)

function goHome() {
  router.replace(afterLoginRoute(route.query.redirect))
}

async function onNameSubmit(event: SubmitEventPromise) {
  const { valid } = await event
  if (valid)
    step.value = 'phone'
}

async function onVerified(result: OtpSession) {
  session.applySession(result)

  if (result.isNew && !result.user.firstName) {
    step.value = 'askName'

    return
  }

  const lastName = form.value.lastName.trim()
  if (result.isNew && lastName) {
    finishing.value = true
    try {
      session.me = await meApi.updateMe({ lastName })
    }
    catch {
      // Optional field: the account already exists, the last name can be added later in the profile
    }
    finally {
      finishing.value = false
    }
  }

  goHome()
}
</script>

<template>
  <AuthHeroLayout
    icon="tabler-rosette-discount-check"
    subtitle="Acumula sellos en tus negocios favoritos y canjea premios gratis"
    :benefits="['Gratis', 'Sin contraseña', 'Listo en segundos']"
  >
    <template #title>
      ¡Gana recompensas<br>sin complicaciones!
    </template>

    <ProfileNameForm
      v-if="step === 'askName'"
      @done="goHome"
    />

    <template v-else>
      <div class="text-h5 font-weight-bold mb-1">
        Crea tu cuenta
      </div>
      <p class="text-body-2 text-medium-emphasis mb-6">
        {{ step === 'name' ? 'Solo necesitas tu nombre y tu número de teléfono' : `Hola, ${form.firstName.trim()}. Ahora confirma tu teléfono.` }}
      </p>

      <VForm
        v-if="step === 'name'"
        validate-on="submit lazy"
        @submit.prevent="onNameSubmit"
      >
        <div class="d-flex flex-column gap-4">
          <VTextField
            v-model="form.firstName"
            autofocus
            label="Nombre *"
            placeholder="Tu nombre"
            autocomplete="given-name"
            variant="outlined"
            prepend-inner-icon="tabler-user"
            hide-details="auto"
            :rules="[requiredValidator]"
          />
          <VTextField
            v-model="form.lastName"
            label="Apellido (opcional)"
            placeholder="Tu apellido"
            autocomplete="family-name"
            variant="outlined"
            prepend-inner-icon="tabler-user"
            hide-details="auto"
          />
          <VBtn
            type="submit"
            size="large"
            block
            color="primary"
            rounded="xl"
            class="mt-2"
          >
            Continuar
          </VBtn>
        </div>
      </VForm>

      <template v-else>
        <PhoneOtpFlow
          :first-name="form.firstName"
          :class="{ 'opacity-50': finishing }"
          @verified="onVerified"
        />
        <VBtn
          variant="text"
          size="small"
          prepend-icon="tabler-arrow-left"
          class="mt-4"
          :disabled="finishing"
          @click="step = 'name'"
        >
          Cambiar mi nombre
        </VBtn>
      </template>

      <div class="text-center mt-6">
        <span class="text-medium-emphasis text-body-2">¿Ya tienes cuenta?</span>
        <RouterLink
          class="text-primary ms-1 text-body-2 font-weight-medium"
          to="/auth/login"
        >
          Inicia sesión
        </RouterLink>
      </div>

      <VDivider class="my-5" />

      <div class="text-center">
        <RouterLink
          class="text-medium-emphasis text-caption"
          to="/auth/registro/negocio"
        >
          ¿Eres dueño de un negocio? Regístrate aquí →
        </RouterLink>
      </div>
    </template>
  </AuthHeroLayout>
</template>
