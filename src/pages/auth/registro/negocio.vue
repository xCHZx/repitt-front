<!--
  Owner registration in two steps (guide §2.6):
  POST /v1/auth/owner/register (202 challenge) → code → POST /v1/auth/owner/register/verify (201 session + business).
  Creating the business no longer opens Checkout: the trial starts when the first card is published.
-->
<script setup lang="ts">
import { authApi, publicApi } from '@/api'
import type { Category, Challenge } from '@/api/types'
import AuthHeroLayout from '@/components/auth/AuthHeroLayout.vue'
import OtpCodeForm from '@/components/auth/OtpCodeForm.vue'
import OwnerRegisterForm from '@/components/auth/OwnerRegisterForm.vue'
import { emptyOwnerRegisterForm, toOwnerRegisterBody } from '@/components/auth/ownerRegister'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'
import { homeRoute } from '@/utils/home'

definePage({
  meta: {
    layout: 'blank',
    public: true,
    guestOnly: true,
  },
})

const router = useRouter()
const session = useSessionStore()
const business = useBusinessStore()

const VISIBLE_FIELDS = ['firstName', 'lastName', 'phone', 'email', 'password', 'business.name', 'business.categoryId', 'business.timezone']

const step = ref<'form' | 'code'>('form')
const form = ref(emptyOwnerRegisterForm())
const challenge = ref<Challenge | null>(null)
const submitting = ref(false)
const verifying = ref(false)
const otpForm = ref<InstanceType<typeof OtpCodeForm> | null>(null)
const restartNotice = ref<string | null>(null)

const categories = ref<Category[]>([])
const categoriesLoading = ref(false)

const formError = useApiError()
const codeError = useApiError()
const categoriesError = useApiError()

const fieldMessages = computed<Record<string, string | undefined>>(() => {
  const e = formError.error.value
  if (!e)
    return {}

  const out: Record<string, string | undefined> = { ...e.fieldErrors }
  if (e.error.code === 'EMAIL_TAKEN')
    out.email = e.message
  if (e.error.code === 'PHONE_TAKEN' || e.error.code === 'INVALID_PHONE')
    out.phone = e.message

  return out
})

const showFormAlert = computed(() =>
  !!formError.error.value
  && formError.error.value.error.code !== 'ACCOUNT_SUSPENDED'
  && !Object.keys(fieldMessages.value).some(k => VISIBLE_FIELDS.includes(k)))

async function loadCategories() {
  categoriesError.reset()
  categoriesLoading.value = true
  try {
    categories.value = await publicApi.listCategories()
  }
  catch (e) {
    categoriesError.capture(e)
  }
  finally {
    categoriesLoading.value = false
  }
}

/** Step 1, also used to "resend" (a new register call issues a new challenge). */
async function register(): Promise<boolean> {
  try {
    challenge.value = await authApi.ownerRegister(toOwnerRegisterBody(form.value))

    return true
  }
  catch (e) {
    const err = formError.capture(e).error
    if (err.detailCode === 'categoryUnavailable') {
      form.value.categoryId = null
      loadCategories()
    }
    step.value = 'form'

    return false
  }
}

async function onSubmitForm() {
  formError.reset()
  codeError.reset()
  restartNotice.value = null
  submitting.value = true
  if (await register())
    step.value = 'code'
  submitting.value = false
}

async function onResend() {
  codeError.reset()
  submitting.value = true
  try {
    challenge.value = await authApi.ownerRegister(toOwnerRegisterBody(form.value))

    // Drop the stale digits so they are not sent against the new challenge
    otpForm.value?.reset()
  }
  catch (e) {
    // RATE_LIMITED → the code screen shows a countdown
    codeError.capture(e)
  }
  finally {
    submitting.value = false
  }
}

async function onVerify(code: string) {
  if (!challenge.value)
    return

  codeError.reset()
  verifying.value = true
  try {
    const res = await authApi.ownerRegisterVerify({ challengeId: challenge.value.challengeId, code })

    session.applySession(res)
    if (res.business) {
      business.upsert(res.business)
      business.select(res.business.id)
      await router.replace('/empresa')
    }
    else {
      await router.replace(homeRoute())
    }
  }
  catch (e) {
    const described = codeError.capture(e)
    const err = described.error

    if (err.isConflictRetry) {
      // The code is spent: start over from step 1 with a new code (§2.13)
      codeError.reset()
      challenge.value = null
      step.value = 'form'
      restartNotice.value = 'No pudimos confirmar tu registro. Revisa tus datos y vuelve a enviarlos para recibir un código nuevo.'
    }
    else if (err.code === 'EMAIL_TAKEN' || err.code === 'PHONE_TAKEN') {
      codeError.reset()
      formError.capture(e)
      challenge.value = null
      step.value = 'form'
    }
  }
  finally {
    verifying.value = false
  }
}

function backToForm() {
  codeError.reset()
  challenge.value = null
  step.value = 'form'
}

onMounted(loadCategories)
</script>

<template>
  <AuthHeroLayout
    icon="tabler-building-store"
    subtitle="Crea tu programa de fidelización y mantén a tus clientes volviendo"
    :benefits="['Fácil de usar', 'Sin límite de clientes', 'Listo en minutos']"
  >
    <template #title>
      ¡Haz crecer<br>tu negocio!
    </template>

    <template v-if="step === 'form'">
      <div class="text-h5 font-weight-bold mb-1">
        Registra tu negocio
      </div>
      <p class="text-body-2 text-medium-emphasis mb-5">
        Con tu cuenta también podrás acumular sellos como cliente.
      </p>

      <VAlert
        v-if="restartNotice"
        color="warning"
        variant="tonal"
        rounded="lg"
        density="compact"
        icon="tabler-refresh-alert"
        class="mb-5"
      >
        {{ restartNotice }}
      </VAlert>

      <ApiErrorAlert
        v-if="showFormAlert"
        :error="formError.error.value"
        class="mb-5"
      />

      <ApiErrorAlert
        :error="categoriesError.error.value"
        class="mb-5"
      >
        <VBtn
          variant="text"
          size="small"
          class="mt-1"
          @click="loadCategories"
        >
          Reintentar
        </VBtn>
      </ApiErrorAlert>

      <OwnerRegisterForm
        v-model="form"
        :categories="categories"
        :categories-loading="categoriesLoading"
        :loading="submitting"
        :errors="fieldMessages"
        @submit="onSubmitForm"
      />

      <div class="mt-6 text-body-2">
        <span class="text-medium-emphasis">¿Ya tienes una cuenta?</span>
        <RouterLink
          class="auth-link ms-1 font-weight-medium"
          to="/auth/login?modo=negocio"
        >
          Inicia sesión
        </RouterLink>
      </div>

      <VDivider class="my-5" />

      <div>
        <RouterLink
          class="auth-link text-body-2"
          to="/auth/registro/visitante"
        >
          ¿Solo quieres acumular recompensas? Regístrate como cliente →
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <div class="text-h5 font-weight-bold mb-1">
        Confirma tu teléfono
      </div>
      <p class="text-body-2 text-medium-emphasis mb-5">
        Es el último paso para crear tu cuenta y tu negocio.
      </p>

      <OtpCodeForm
        ref="otpForm"
        :expires-at="challenge?.expiresAt"
        :destination="form.phone"
        :loading="verifying"
        :resending="submitting"
        :error="codeError.error.value"
        submit-label="Crear cuenta"
        @submit="onVerify"
        @resend="onResend"
        @back="backToForm"
      />
    </template>
  </AuthHeroLayout>
</template>
