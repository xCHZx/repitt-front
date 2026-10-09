<!--
  Login (guide §2.5, §2.7): "Continuar con teléfono" (visitors and cashiers, OTP) or
  "Tengo un negocio" (email + password).
-->
<script setup lang="ts">
import type { OtpSession } from '@/api/types'
import AuthShell from '@/components/auth/AuthShell.vue'
import OwnerLoginForm from '@/components/auth/OwnerLoginForm.vue'
import PhoneOtpFlow from '@/components/auth/PhoneOtpFlow.vue'
import ProfileNameForm from '@/components/auth/ProfileNameForm.vue'
import { useSessionStore } from '@/stores/session'
import { afterLoginRoute } from '@/utils/home'

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

type Mode = 'phone' | 'owner'

const passwordWasReset = route.query.reset === '1'
const mode = ref<Mode>(passwordWasReset || route.query.modo === 'negocio' ? 'owner' : 'phone')
const phoneStep = ref<'phone' | 'code'>('phone')
const askName = ref(false)

const modes: { value: Mode; icon: string; title: string; subtitle: string }[] = [
  { value: 'phone', icon: 'tabler-device-mobile', title: 'Continuar con teléfono', subtitle: 'Clientes y cajeros' },
  { value: 'owner', icon: 'tabler-building-store', title: 'Tengo un negocio', subtitle: 'Entra con tu correo' },
]

function goHome() {
  router.replace(afterLoginRoute(route.query.redirect))
}

// The boot could not reach the server (network / 5xx): the session may still be alive (§2.2)
const isRetryingBoot = ref(false)

async function retryBoot() {
  isRetryingBoot.value = true
  await session.retryBoot()
  isRetryingBoot.value = false

  if (session.status === 'suspended')
    router.replace('/cuenta-suspendida')
  else if (session.isAuthenticated)
    goHome()
}

function onPhoneVerified(result: OtpSession) {
  session.applySession(result)

  // New phone without a name yet: ask for it before going home (§2.5)
  if (result.isNew && !result.user.firstName)
    askName.value = true
  else
    goHome()
}
</script>

<template>
  <AuthShell>
    <ProfileNameForm
      v-if="askName"
      @done="goHome"
    />

    <template v-else>
      <VAlert
        v-if="session.status === 'unavailable'"
        color="warning"
        variant="tonal"
        rounded="lg"
        density="compact"
        icon="tabler-wifi-off"
        class="mb-4"
      >
        No pudimos conectar con el servidor para recuperar tu sesión.
        <!-- Acción debajo del texto (como en el registro): a 375px, en #append dejaba el texto en una columna de ~130px -->
        <div>
          <VBtn
            size="small"
            variant="text"
            class="mt-1"
            :loading="isRetryingBoot"
            @click="retryBoot"
          >
            Reintentar
          </VBtn>
        </div>
      </VAlert>

      <div
        v-if="phoneStep === 'phone'"
        class="type-cards mb-6"
      >
        <VCard
          v-for="m in modes"
          :key="m.value"
          class="type-card"
          :class="{ 'type-card--active': mode === m.value }"
          role="button"
          :aria-pressed="mode === m.value"
          @click="mode = m.value"
        >
          <VIcon
            v-if="mode === m.value"
            icon="tabler-circle-check-filled"
            size="24"
            class="type-card__check"
          />
          <VCardText class="pa-4">
            <div class="type-card__icon mb-3">
              <VIcon
                :icon="m.icon"
                size="24"
              />
            </div>
            <div class="text-body-2 font-weight-bold mb-1">
              {{ m.title }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ m.subtitle }}
            </div>
          </VCardText>
        </VCard>
      </div>

      <VAlert
        v-if="passwordWasReset && mode === 'owner'"
        color="success"
        variant="tonal"
        rounded="lg"
        density="compact"
        icon="tabler-lock-check"
        class="mb-4"
      >
        Tu contraseña se actualizó. Inicia sesión con la nueva.
      </VAlert>

      <PhoneOtpFlow
        v-if="mode === 'phone'"
        @step="phoneStep = $event"
        @verified="onPhoneVerified"
      />
      <OwnerLoginForm
        v-else
        @success="goHome"
      />

      <template v-if="phoneStep === 'phone'">
        <VDivider class="my-5" />

        <div class="text-body-2">
          ¿Tienes un negocio y aún no tienes cuenta?
          <RouterLink
            to="/auth/registro/negocio"
            class="auth-link font-weight-bold ms-1"
          >
            Regístralo
          </RouterLink>
        </div>
      </template>
    </template>
  </AuthShell>
</template>

<style scoped lang="scss">
.type-cards {
  display: grid;
  gap: var(--s-3);
  grid-template-columns: 1fr 1fr;
}

// Opción de formulario en lenguaje tonal (guía §8.4): elegida = borde --enlace + fondo
// --violeta-suave, texto en --texto e ícono en --enlace. Sin sombra ni anillo.
.type-card {
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: border-color 160ms var(--ease-out), background-color 160ms var(--ease-out);

  &:hover {
    border-color: var(--borde-control);
  }

  // Doble clase: gana al borde --linea de `:root body .v-card` (src/styles/vuetify.scss)
  &.type-card--active,
  &.type-card--active:hover {
    border-color: var(--enlace);
    background-color: var(--violeta-suave);
    color: var(--texto);
  }

  // Sin velo de hover de Vuetify: el hover cambia el borde
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.v-card__overlay) {
    display: none;
  }

  &__check {
    position: absolute;
    color: var(--enlace);
    inset-block-start: var(--s-2);
    inset-inline-end: var(--s-2);
  }
}

.type-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-control);
  background: var(--violeta-suave);
  block-size: var(--s-7);
  color: var(--enlace);
  inline-size: var(--s-7);
}

.type-card--active .type-card__icon {
  background: transparent;
}
</style>
