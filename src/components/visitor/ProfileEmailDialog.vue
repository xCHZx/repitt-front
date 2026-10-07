<script setup lang="ts">
import { updateMe } from '@/api/endpoints/me'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// PATCH /v1/me { email } (guide §2.12): needs reauthentication (the interceptor opens the step-up
// dialog on REAUTH_REQUIRED and retries). The new email stays unverified and a link is sent.
// 409 EMAIL_TAKEN → field error. Shares the email/resend rate limit (429).

const emit = defineEmits<{ saved: [email: string] }>()

const isOpen = defineModel<boolean>({ required: true })

const session = useSessionStore()
const { error, fieldErrors, capture, reset } = useApiError()

const email = ref('')
const saving = ref(false)

watch(isOpen, open => {
  if (!open)
    return
  reset()
  email.value = session.me?.email ?? ''
})

const EMAIL_RE = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

const trimmed = computed(() => email.value.trim())
const isValid = computed(() => EMAIL_RE.test(trimmed.value))
const unchanged = computed(() => trimmed.value.toLowerCase() === (session.me?.email ?? '').toLowerCase())

const emailError = computed(() => {
  if (fieldErrors.value.email)
    return fieldErrors.value.email
  if (error.value?.error.code === 'EMAIL_TAKEN')
    return error.value.message

  return undefined
})

async function save() {
  if (!isValid.value || unchanged.value || saving.value)
    return
  saving.value = true
  reset()
  try {
    session.me = await updateMe({ email: trimmed.value })
    isOpen.value = false
    emit('saved', trimmed.value)
  }
  catch (e) {
    capture(e)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="480"
  >
    <VCard
      rounded="xl"
      :title="session.me?.email ? 'Cambiar correo' : 'Agregar correo'"
    >
      <VCardText>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Te enviaremos un enlace para verificarlo. Por seguridad, es posible que te pidamos confirmar tu identidad.
        </p>
        <VForm @submit.prevent="save">
          <VTextField
            v-model="email"
            label="Correo electrónico"
            type="email"
            inputmode="email"
            autocomplete="email"
            prepend-inner-icon="tabler-mail"
            :error-messages="emailError"
            class="mb-2"
          />
          <ApiErrorAlert
            v-if="error && !emailError"
            :error="error"
          />
        </VForm>
      </VCardText>
      <VCardActions class="justify-end gap-2 pb-4 px-4">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isOpen = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="!isValid || unchanged"
          @click="save"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
