<!--
  "Continuar con teléfono" (guide §2.5): visitors, new customers and cashiers.
  POST /v1/auth/otp/request → code screen → POST /v1/auth/otp/verify. Emits the session; the parent
  applies it and decides where to go.
-->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import { authApi } from '@/api'
import type { Challenge, OtpSession } from '@/api/types'
import OtpCodeForm from '@/components/auth/OtpCodeForm.vue'
import PrivacyConsentNote from '@/components/auth/PrivacyConsentNote.vue'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'

const props = withDefaults(defineProps<{

  /** Only used by the backend when the phone is new (§2.5). */
  firstName?: string
  submitLabel?: string
}>(), {
  firstName: undefined,
  submitLabel: 'Enviar código',
})

const emit = defineEmits<{
  verified: [session: OtpSession]
  step: [step: 'phone' | 'code']
}>()

const step = ref<'phone' | 'code'>('phone')
const phone = ref('')
const challenge = ref<Challenge | null>(null)
const requesting = ref(false)
const verifying = ref(false)
const otpForm = ref<InstanceType<typeof OtpCodeForm> | null>(null)

const { error, capture, reset } = useApiError()

const phoneError = computed(() => {
  const e = error.value
  if (!e || step.value !== 'phone')
    return undefined
  if (e.error.code === 'INVALID_PHONE')
    return e.message

  return e.fieldErrors.phone
})

const showAlert = computed(() => step.value === 'phone' && !!error.value && !phoneError.value)

watch(step, value => emit('step', value))

const phoneRules = [
  (v: string) => v.replace(/\D/g, '').length >= 10 || 'Escribe tu teléfono a 10 dígitos',
]

async function requestCode() {
  reset()
  requesting.value = true
  try {
    challenge.value = await authApi.otpRequest({ phone: phone.value.trim() })

    // On resend, drop the stale digits so they are not sent against the new challenge
    otpForm.value?.reset()
    step.value = 'code'
  }
  catch (e) {
    // ACCOUNT_SUSPENDED is routed by the interceptor
    capture(e)
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

async function verify(code: string) {
  if (!challenge.value)
    return
  reset()
  verifying.value = true
  try {
    const session = await authApi.otpVerify({
      challengeId: challenge.value.challengeId,
      code,
      ...(props.firstName?.trim() ? { firstName: props.firstName.trim() } : {}),
    })

    emit('verified', session)
  }
  catch (e) {
    capture(e)
  }
  finally {
    verifying.value = false
  }
}

function backToPhone() {
  reset()
  challenge.value = null
  step.value = 'phone'
}
</script>

<template>
  <div class="phone-otp-flow">
    <template v-if="step === 'phone'">
      <ApiErrorAlert
        v-if="showAlert"
        :error="error"
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
          :error-messages="phoneError"
          class="mb-4"
        />

        <PrivacyConsentNote class="mb-5" />

        <VBtn
          type="submit"
          block
          size="large"
          color="primary"
          rounded="xl"
          :loading="requesting"
        >
          {{ props.submitLabel }}
        </VBtn>
      </VForm>
    </template>

    <OtpCodeForm
      v-else
      ref="otpForm"
      :expires-at="challenge?.expiresAt"
      :destination="phone"
      :loading="verifying"
      :resending="requesting"
      :error="error"
      submit-label="Continuar"
      @submit="verify"
      @resend="requestCode"
      @back="backToPhone"
    />
  </div>
</template>
