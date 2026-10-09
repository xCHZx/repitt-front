<script setup lang="ts">
import { emailResend } from '@/api/endpoints/auth'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// "Verify your email" banner (guide §2.11): shown while me.email !== null && me.emailVerifiedAt === null.
// POST /v1/auth/email/resend → 202 sent · 204 already verified (reload me) · 403 FORBIDDEN no email · 429 countdown.

const session = useSessionStore()
const { error, capture, reset } = useApiError()

const sending = ref(false)
const sent = ref(false)
const blockedUntil = ref(0)
const now = ref(Date.now())

let timer: ReturnType<typeof setInterval> | undefined

const waitSeconds = computed(() => Math.max(0, Math.ceil((blockedUntil.value - now.value) / 1000)))

const waitLabel = computed(() => waitSeconds.value < 120
  ? `${waitSeconds.value} s`
  : `${Math.ceil(waitSeconds.value / 60)} min`)

function startCountdown(ms: number) {
  blockedUntil.value = Date.now() + ms
  clearInterval(timer)
  timer = setInterval(() => {
    now.value = Date.now()
    if (waitSeconds.value === 0)
      clearInterval(timer)
  }, 1000)
  now.value = Date.now()
}

onBeforeUnmount(() => clearInterval(timer))

async function resend() {
  sending.value = true
  sent.value = false
  reset()
  try {
    const res = await emailResend()
    if (res)
      sent.value = true
    else
      await session.loadMe() // 204: already verified
  }
  catch (e) {
    const described = capture(e)
    const err = described.error
    if (err.code === 'RATE_LIMITED') {
      startCountdown(err.retryAfterMs ?? 120_000)
    }
    else if (err.code === 'FORBIDDEN') {
      // The account no longer has an email (another account claimed it): refresh me
      reset()
      await session.loadMe().catch(() => {})
    }
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <VAlert
    v-if="session.emailPendingVerification"
    color="warning"
    variant="tonal"
    rounded="lg"
    density="compact"
    icon="tabler-mail-exclamation"
  >
    <div class="text-body-2">
      Verifica tu correo <strong>{{ session.me?.email }}</strong>. Te enviamos un enlace para confirmarlo.
    </div>
    <div
      v-if="sent"
      class="text-caption mt-1"
    >
      Listo, te enviamos un nuevo enlace. Revisa tu bandeja de entrada y spam.
    </div>
    <ApiErrorAlert
      v-if="error && error.error.code !== 'RATE_LIMITED'"
      :error="error"
      class="mt-2"
    />
    <VBtn
      size="small"
      variant="text"
      color="primary"
      class="mt-1 px-0"
      :loading="sending"
      :disabled="waitSeconds > 0"
      @click="resend"
    >
      {{ waitSeconds > 0 ? `Reenviar en ${waitLabel}` : 'Reenviar correo' }}
    </VBtn>
  </VAlert>
</template>
