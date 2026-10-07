<!--
  Password reset by phone (guide §2.10):
  POST /v1/auth/password/forgot/otp (always 202) → code + new password → POST /v1/auth/password/reset/otp (204).
  - A common password is rejected before checking the code: the code stays valid, fix and resend.
  - A password with personal data is rejected after: the code is spent, request a new one.
  - 409 CONFLICT retry: restart from step 1 (§2.13).
-->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import { authApi } from '@/api'
import type { Challenge } from '@/api/types'
import NewPasswordFields from '@/components/auth/NewPasswordFields.vue'
import OtpCodeForm from '@/components/auth/OtpCodeForm.vue'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'

const emit = defineEmits<{
  done: []
}>()

const OTP_CODES = ['OTP_INVALID', 'OTP_EXPIRED', 'OTP_MAX_ATTEMPTS', 'NOT_FOUND', 'RATE_LIMITED']

const step = ref<'phone' | 'code'>('phone')
const phone = ref('')
const password = ref('')
const challenge = ref<Challenge | null>(null)
const requesting = ref(false)
const resetting = ref(false)
const otpForm = ref<InstanceType<typeof OtpCodeForm> | null>(null)
const restartNotice = ref<string | null>(null)
const passwordForm = ref<{ validate: () => Promise<{ valid: boolean }> }>()

const phoneError = useApiError()
const codeError = useApiError()
const passwordError = ref<string | undefined>()

const phoneFieldError = computed(() => {
  const e = phoneError.error.value
  if (!e)
    return undefined

  return e.error.code === 'INVALID_PHONE' ? e.message : e.fieldErrors.phone
})

const phoneRules = [
  (v: string) => v.replace(/\D/g, '').length >= 10 || 'Escribe tu teléfono a 10 dígitos',
]

async function requestCode() {
  phoneError.reset()
  codeError.reset()
  requesting.value = true
  try {
    challenge.value = await authApi.passwordForgotOtp({ phone: phone.value.trim() })

    // On resend, drop the stale digits so they are not sent against the new challenge
    otpForm.value?.reset()
    restartNotice.value = null
    step.value = 'code'
  }
  catch (e) {
    if (step.value === 'code')
      codeError.capture(e)
    else
      phoneError.capture(e)
  }
  finally {
    requesting.value = false
  }
}

async function onSubmitPhone(event: SubmitEventPromise) {
  const { valid } = await event
  if (valid)
    await requestCode()
}

function restart(notice: string) {
  codeError.reset()
  challenge.value = null
  step.value = 'phone'
  restartNotice.value = notice
}

async function onSubmitCode(code: string) {
  if (!challenge.value)
    return

  const { valid } = await passwordForm.value!.validate()
  if (!valid)
    return

  codeError.reset()
  passwordError.value = undefined
  resetting.value = true
  try {
    await authApi.passwordResetOtp({ challengeId: challenge.value.challengeId, code, password: password.value })
    emit('done')
  }
  catch (e) {
    const described = codeError.capture(e)
    const err = described.error

    if (err.isConflictRetry) {
      restart('No pudimos completar el cambio. Pide un código nuevo para intentarlo otra vez.')
    }

    // «repitt» is rejected before checking the code (still valid); the email or phone inside the
    // password is checked after it, so the code is spent and a new one is needed (backend, 2026-10-06)
    else if (err.detailCode === 'passwordContainsPersonalData' && !/repitt/i.test(password.value)) {
      password.value = ''
      restart(`${described.fieldErrors.password ?? described.message} Pide un código nuevo y elige otra contraseña.`)
    }
    else if (!OTP_CODES.includes(err.code) && (described.fieldErrors.password || err.code === 'VALIDATION_FAILED')) {
      // Rejected before checking the code: it is still valid
      passwordError.value = described.fieldErrors.password ?? described.message
      codeError.reset()
    }
  }
  finally {
    resetting.value = false
  }
}
</script>

<template>
  <template v-if="step === 'phone'">
    <p class="text-body-2 text-medium-emphasis mb-5">
      Escribe el teléfono de tu cuenta. Te enviaremos un código por SMS para elegir una contraseña nueva.
    </p>

    <VAlert
      v-if="restartNotice"
      color="warning"
      variant="tonal"
      rounded="lg"
      density="compact"
      icon="tabler-refresh-alert"
      class="mb-4"
    >
      {{ restartNotice }}
    </VAlert>

    <ApiErrorAlert
      v-if="!phoneFieldError"
      :error="phoneError.error.value"
      class="mb-4"
    />

    <VForm
      validate-on="submit lazy"
      @submit.prevent="onSubmitPhone"
    >
      <VTextField
        v-model="phone"
        autofocus
        label="Teléfono"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="55 1234 5678"
        prepend-inner-icon="tabler-phone"
        variant="outlined"
        hint="10 dígitos"
        persistent-hint
        :rules="phoneRules"
        :error-messages="phoneFieldError"
        class="mb-5"
      />
      <VBtn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="xl"
        :loading="requesting"
      >
        Enviar código
      </VBtn>
    </VForm>
  </template>

  <template v-else>
    <VForm
      ref="passwordForm"
      validate-on="submit lazy"
      class="mb-6"
      @submit.prevent
    >
      <NewPasswordFields
        v-model="password"
        :error-messages="passwordError"
        @update:model-value="passwordError = undefined"
      />
    </VForm>

    <OtpCodeForm
      ref="otpForm"
      :expires-at="challenge?.expiresAt"
      :destination="phone"
      :loading="resetting"
      :resending="requesting"
      :error="codeError.error.value"
      submit-label="Cambiar contraseña"
      @submit="onSubmitCode"
      @resend="requestCode"
      @back="restart('')"
    />
  </template>
</template>
