<script lang="ts" setup>
import { phoneChangeRequest, phoneChangeVerify } from '@/api/endpoints/me'
import type { Challenge } from '@/api/types'
import OtpCodeForm from '@/components/auth/OtpCodeForm.vue'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// Phone change (guide §2.12): POST /v1/me/phone/request { phone } → code to the NEW number →
// POST /v1/me/phone/verify { challengeId, code } → MeDto. Both need reauthentication (interceptor).
// 409 CONFLICT retry on verify → restart from the request (§2.13). Other sessions are revoked.

definePage({
  meta: {
    layout: 'visitor',
  },
})

const session = useSessionStore()

const step = ref<'phone' | 'code' | 'done'>('phone')
const phone = ref('')
const challenge = ref<Challenge | null>(null)
const requesting = ref(false)
const verifying = ref(false)

const requestErr = useApiError()
const verifyErr = useApiError()

const PHONE_FIELD_CODES = ['INVALID_PHONE', 'PHONE_TAKEN']

const phoneError = computed(() => {
  const e = requestErr.error.value
  if (!e)
    return undefined
  if (e.fieldErrors.phone)
    return e.fieldErrors.phone
  if (PHONE_FIELD_CODES.includes(e.error.code))
    return e.message

  return undefined
})

const canRequest = computed(() => phone.value.replace(/\D/g, '').length >= 10 && !requesting.value)

async function requestCode(isResend = false) {
  if (!isResend && !canRequest.value)
    return
  requesting.value = true
  requestErr.reset()
  if (!isResend)
    verifyErr.reset()
  try {
    challenge.value = await phoneChangeRequest({ phone: phone.value.trim() })
    verifyErr.reset()
    step.value = 'code'
  }
  catch (e) {
    const described = requestErr.capture(e)

    // On resend, surface the problem on the code screen (countdown for 429)
    if (isResend)
      verifyErr.capture(described.error)
    else
      step.value = 'phone'
  }
  finally {
    requesting.value = false
  }
}

const submitPhone = () => requestCode(false)
const resendCode = () => requestCode(true)

async function verify(code: string) {
  if (!challenge.value)
    return
  verifying.value = true
  verifyErr.reset()
  try {
    session.me = await phoneChangeVerify({ challengeId: challenge.value.challengeId, code })
    step.value = 'done'
  }
  catch (e) {
    const described = verifyErr.capture(e)
    const err = described.error

    // The code is spent: go back to the phone step with the reason
    if (err.code === 'PHONE_TAKEN' || err.isConflictRetry) {
      requestErr.capture(err)
      verifyErr.reset()
      challenge.value = null
      step.value = 'phone'
    }
  }
  finally {
    verifying.value = false
  }
}

function back() {
  challenge.value = null
  verifyErr.reset()
  step.value = 'phone'
}
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-5">
      <template v-if="step === 'phone'">
        <div class="text-h6 font-weight-bold mb-1">
          Cambiar teléfono
        </div>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Tu número actual es <strong>{{ session.me?.phone }}</strong>. Te enviaremos un código por SMS al número nuevo.
          Por seguridad, es posible que te pidamos confirmar tu identidad.
        </p>

        <VForm @submit.prevent="submitPhone">
          <VTextField
            v-model="phone"
            label="Número nuevo"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="10 dígitos"
            prepend-inner-icon="tabler-phone"
            :error-messages="phoneError"
            class="mb-4"
          />

          <VAlert
            v-if="requestErr.error.value?.error.isConflictRetry"
            color="warning"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4"
          >
            No pudimos completar el cambio. Pide un código nuevo para intentarlo otra vez.
          </VAlert>
          <ApiErrorAlert
            v-else-if="requestErr.error.value && !phoneError"
            :error="requestErr.error.value"
            class="mb-4"
          />

          <VBtn
            block
            size="large"
            type="submit"
            :loading="requesting"
            :disabled="!canRequest"
          >
            Enviar código
          </VBtn>
        </VForm>
      </template>

      <OtpCodeForm
        v-else-if="step === 'code'"
        :expires-at="challenge?.expiresAt"
        :destination="phone"
        :loading="verifying"
        :resending="requesting"
        :error="verifyErr.error.value"
        submit-label="Confirmar número"
        @submit="verify"
        @resend="resendCode"
        @back="back"
      />

      <div
        v-else
        class="text-center py-4"
      >
        <VIcon
          icon="tabler-circle-check"
          size="56"
          color="success"
          class="mb-3"
        />
        <div class="text-h6 font-weight-bold mb-1">
          Teléfono actualizado
        </div>
        <p class="text-body-2 text-medium-emphasis mb-5">
          Ahora tu número es <strong>{{ session.me?.phone }}</strong>. Cerramos tu sesión en los demás dispositivos.
        </p>
        <VBtn
          to="/visitante/perfil"
          variant="tonal"
          color="primary"
        >
          Volver a Mi cuenta
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
