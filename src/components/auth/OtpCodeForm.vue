<script setup lang="ts">
// Code screen shared by the six OTP flows (guide §2.14).
// The parent owns the API calls; this component shows the input, the expiry countdown and the
// resend button, and interprets OTP errors through `error`:
//   400 OTP_INVALID (details.attemptsLeft) · 410 OTP_EXPIRED · 429 OTP_MAX_ATTEMPTS → enable resend
//   404 NOT_FOUND → challenge gone: ask for a new code · 429 RATE_LIMITED on resend → countdown
import type { DescribedError } from '@/api/messages'

const props = withDefaults(defineProps<{
  /** ISO instant when the current code expires (ChallengeDto.expiresAt). */
  expiresAt: string | null | undefined
  /** Where the code was sent, already masked or formatted for display. */
  destination?: string
  loading?: boolean
  resending?: boolean
  error?: DescribedError | null
  submitLabel?: string
}>(), {
  destination: '',
  loading: false,
  resending: false,
  error: null,
  submitLabel: 'Verificar',
})

const emit = defineEmits<{
  submit: [code: string]
  resend: []
  back: []
}>()

const code = ref('')
const now = ref(Date.now())

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => clearInterval(timer))

const secondsLeft = computed(() => {
  if (!props.expiresAt)
    return 0

  return Math.max(0, Math.ceil((new Date(props.expiresAt).getTime() - now.value) / 1000))
})

const countdown = computed(() => {
  const s = secondsLeft.value

  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

const resendBlockedUntil = ref(0)

watch(() => props.error, err => {
  if (err?.error.code === 'RATE_LIMITED' && err.error.retryAfterMs)
    resendBlockedUntil.value = Date.now() + err.error.retryAfterMs
  if (err?.error.code === 'OTP_INVALID')
    code.value = ''
})

const resendWait = computed(() => Math.max(0, Math.ceil((resendBlockedUntil.value - now.value) / 1000)))

const attemptsLeft = computed(() => props.error?.error.code === 'OTP_INVALID'
  ? props.error.error.detailObj?.attemptsLeft
  : undefined)

const mustResend = computed(() => {
  const c = props.error?.error.code

  return secondsLeft.value === 0 || c === 'OTP_EXPIRED' || c === 'OTP_MAX_ATTEMPTS' || c === 'NOT_FOUND'
})

const errorText = computed(() => {
  const e = props.error
  if (!e)
    return ''
  if (e.error.code === 'OTP_INVALID')
    return attemptsLeft.value !== undefined ? `Código incorrecto. Te quedan ${attemptsLeft.value} intentos.` : 'Código incorrecto.'
  if (e.error.code === 'NOT_FOUND')
    return 'Este código ya no es válido. Pide uno nuevo.'

  return e.message
})

const canSubmit = computed(() => code.value.length === 6 && !mustResend.value && !props.loading)

function submit() {
  if (canSubmit.value)
    emit('submit', code.value)
}

watch(code, value => {
  if (value.length === 6)
    submit()
})

defineExpose({ reset: () => (code.value = '') })
</script>

<template>
  <div class="otp-code-form d-flex flex-column gap-4">
    <div class="text-body-1">
      Escribe el código de 6 dígitos que enviamos
      <template v-if="props.destination">
        a <strong>{{ props.destination }}</strong>
      </template>
      por SMS.
    </div>

    <VOtpInput
      v-model="code"
      length="6"
      type="number"
      :disabled="props.loading"
      autofocus
    />

    <div
      v-if="errorText"
      class="text-error text-body-2"
    >
      {{ errorText }}
      <div
        v-if="props.error?.requestId && !['OTP_INVALID', 'OTP_EXPIRED', 'OTP_MAX_ATTEMPTS', 'NOT_FOUND'].includes(props.error.error.code)"
        class="text-caption text-medium-emphasis"
      >
        Folio de soporte: {{ props.error.requestId }}
      </div>
    </div>

    <div
      v-if="!mustResend"
      class="text-body-2 text-medium-emphasis"
    >
      El código vence en {{ countdown }}
    </div>

    <VBtn
      block
      size="large"
      :loading="props.loading"
      :disabled="!canSubmit"
      @click="submit"
    >
      {{ props.submitLabel }}
    </VBtn>

    <div class="d-flex justify-space-between align-center">
      <VBtn
        variant="text"
        size="small"
        prepend-icon="tabler-arrow-left"
        @click="emit('back')"
      >
        Cambiar datos
      </VBtn>
      <VBtn
        variant="text"
        size="small"
        :loading="props.resending"
        :disabled="resendWait > 0"
        @click="emit('resend')"
      >
        {{ resendWait > 0 ? `Reenviar en ${resendWait} s` : 'Reenviar código' }}
      </VBtn>
    </div>
  </div>
</template>
