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
      <div
        v-if="phoneStep === 'phone'"
        class="type-cards mb-6"
      >
        <VCard
          v-for="m in modes"
          :key="m.value"
          rounded="xl"
          class="type-card"
          :class="{ 'type-card--active': mode === m.value }"
          role="button"
          :aria-pressed="mode === m.value"
          @click="mode = m.value"
        >
          <VIcon
            v-if="mode === m.value"
            icon="tabler-circle-check-filled"
            color="primary"
            size="28"
            class="type-card__check"
          />
          <VCardText class="pa-4 text-center">
            <div
              class="type-card__icon mb-3"
              :class="{ 'type-card__icon--active': mode === m.value }"
            >
              <VIcon
                :icon="m.icon"
                size="28"
                color="primary"
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

        <div class="text-center text-body-2">
          ¿Tienes un negocio y aún no tienes cuenta?
          <RouterLink
            to="/auth/registro/negocio"
            class="text-primary font-weight-bold ms-1"
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
    inset-block-start: -10px;
    inset-inline-end: -10px;
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
</style>
