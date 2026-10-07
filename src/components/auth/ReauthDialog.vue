<script setup lang="ts">
// Global step-up / reauthentication dialog (guide §2.8–§2.9), mounted once in App.vue.
// Opened by the API interceptor (PASSWORD_REQUIRED, REAUTH_REQUIRED) or by ensureReauthenticated().
// - password: POST /v1/auth/step-up → new access token (amr=pwd), reauthenticated 10 min.
// - otp (account without password): step-up/otp/request → code → step-up/otp/verify (204).
import { stepUp, stepUpOtpRequest, stepUpOtpVerify } from '@/api/endpoints/auth'
import { toApiError } from '@/api/errors'
import type { Challenge } from '@/api/types'
import OtpCodeForm from '@/components/auth/OtpCodeForm.vue'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { settleReauth, useReauthState } from '@/composables/useReauth'
import { useSessionStore } from '@/stores/session'

const state = useReauthState()
const session = useSessionStore()
const { error, capture, reset } = useApiError()

const method = ref<'password' | 'otp'>('password')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const resending = ref(false)
const challenge = ref<Challenge | null>(null)

watch(() => state.open, open => {
  if (!open)
    return
  reset()
  password.value = ''
  challenge.value = null
  method.value = state.method
  if (method.value === 'otp')
    requestCode()
})

async function requestCode() {
  resending.value = true
  reset()
  try {
    challenge.value = await stepUpOtpRequest()
  }
  catch (e) {
    // The account has a password: OTP step-up is not allowed, use the password
    if (toApiError(e).code === 'PASSWORD_REQUIRED')
      method.value = 'password'
    else
      capture(e)
  }
  finally {
    resending.value = false
  }
}

async function submitPassword() {
  if (!password.value)
    return
  loading.value = true
  reset()
  try {
    const token = await stepUp({ password: password.value })
    session.setAccess(token)
    session.markReauthenticated()
    settleReauth(true)
  }
  catch (e) {
    capture(e)
  }
  finally {
    loading.value = false
  }
}

async function submitCode(code: string) {
  if (!challenge.value)
    return
  loading.value = true
  reset()
  try {
    await stepUpOtpVerify({ challengeId: challenge.value.challengeId, code })
    session.markReauthenticated()
    settleReauth(true)
  }
  catch (e) {
    const err = capture(e)

    // The challenge is not from this session or the phone changed: ask for another one
    if (err.error.code === 'NOT_FOUND')
      challenge.value = null
  }
  finally {
    loading.value = false
  }
}

const cancel = () => settleReauth(false)

const passwordError = computed(() => error.value?.error.code === 'INVALID_CREDENTIALS' ? 'Contraseña incorrecta' : undefined)
</script>

<template>
  <VDialog
    :model-value="state.open"
    max-width="420"
    persistent
  >
    <VCard rounded="xl">
      <VCardItem>
        <VCardTitle>Confirma que eres tú</VCardTitle>
        <VCardSubtitle class="text-wrap">
          Por seguridad, necesitamos verificar tu identidad para continuar.
        </VCardSubtitle>
      </VCardItem>

      <VCardText v-if="method === 'password'">
        <VForm @submit.prevent="submitPassword">
          <AppTextField
            v-model="password"
            label="Contraseña"
            autocomplete="current-password"
            autofocus
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'tabler-eye-off' : 'tabler-eye'"
            :error-messages="passwordError"
            @click:append-inner="showPassword = !showPassword"
          />
          <ApiErrorAlert
            v-if="!passwordError"
            :error="error"
            class="mt-3"
          />
          <div class="d-flex gap-3 justify-end mt-5">
            <VBtn
              variant="text"
              @click="cancel"
            >
              Cancelar
            </VBtn>
            <VBtn
              type="submit"
              :loading="loading"
              :disabled="!password"
            >
              Continuar
            </VBtn>
          </div>
        </VForm>
      </VCardText>

      <VCardText v-else>
        <OtpCodeForm
          v-if="challenge"
          :expires-at="challenge.expiresAt"
          destination="tu teléfono"
          :loading="loading"
          :resending="resending"
          :error="error"
          submit-label="Confirmar"
          @submit="submitCode"
          @resend="requestCode"
          @back="cancel"
        />
        <div
          v-else
          class="d-flex flex-column gap-4"
        >
          <ApiErrorAlert :error="error" />
          <div class="d-flex gap-3 justify-end">
            <VBtn
              variant="text"
              @click="cancel"
            >
              Cancelar
            </VBtn>
            <VBtn
              :loading="resending"
              @click="requestCode"
            >
              Enviar código
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
