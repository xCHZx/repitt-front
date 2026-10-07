<script setup lang="ts">
import { changePassword } from '@/api/endpoints/me'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// POST /v1/me/password { currentPassword, newPassword } → 204 (guide §2.12).
// 401 INVALID_CREDENTIALS is a field error on the current password; 400 rules on newPassword.
// Other sessions are revoked (this one stays).

const emit = defineEmits<{ saved: [] }>()

const isOpen = defineModel<boolean>({ required: true })

const session = useSessionStore()
const { error, fieldErrors, capture, reset } = useApiError()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const show = ref(false)
const saving = ref(false)

const MIN_LENGTH = 10

watch(isOpen, open => {
  if (!open)
    return
  reset()
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  show.value = false
})

const currentError = computed(() =>
  error.value?.error.code === 'INVALID_CREDENTIALS' ? 'La contraseña actual no es correcta' : fieldErrors.value.currentPassword)

const newError = computed(() => {
  if (fieldErrors.value.newPassword)
    return fieldErrors.value.newPassword
  if (newPassword.value && newPassword.value.length < MIN_LENGTH)
    return `Mínimo ${MIN_LENGTH} caracteres`

  return undefined
})

const confirmError = computed(() =>
  confirmPassword.value && confirmPassword.value !== newPassword.value ? 'Las contraseñas no coinciden' : undefined)

const canSave = computed(() =>
  !!currentPassword.value
  && newPassword.value.length >= MIN_LENGTH
  && newPassword.value === confirmPassword.value
  && !saving.value)

const showGeneralError = computed(() =>
  !!error.value && !currentError.value && !fieldErrors.value.newPassword)

async function save() {
  if (!canSave.value)
    return
  saving.value = true
  reset()
  try {
    await changePassword({ currentPassword: currentPassword.value, newPassword: newPassword.value })
    isOpen.value = false
    emit('saved')
  }
  catch (e) {
    const described = capture(e)

    // 403 FORBIDDEN: the account has no password (stale me)
    if (described.error.code === 'FORBIDDEN')
      await session.loadMe().catch(() => {})
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
      title="Cambiar contraseña"
    >
      <VCardText>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Al cambiarla cerraremos tu sesión en los demás dispositivos.
        </p>
        <VForm @submit.prevent="save">
          <VTextField
            v-model="currentPassword"
            label="Contraseña actual"
            :type="show ? 'text' : 'password'"
            autocomplete="current-password"
            prepend-inner-icon="tabler-lock"
            :error-messages="currentError"
            class="mb-4"
          />
          <VTextField
            v-model="newPassword"
            label="Nueva contraseña"
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            prepend-inner-icon="tabler-lock-plus"
            :append-inner-icon="show ? 'tabler-eye-off' : 'tabler-eye'"
            :error-messages="newError"
            hint="Mínimo 10 caracteres. Evita contraseñas comunes o con tus datos."
            persistent-hint
            class="mb-4"
            @click:append-inner="show = !show"
          />
          <VTextField
            v-model="confirmPassword"
            label="Confirma la nueva contraseña"
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            prepend-inner-icon="tabler-lock-check"
            :error-messages="confirmError"
            class="mb-2"
          />
          <ApiErrorAlert
            v-if="showGeneralError"
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
          :disabled="!canSave"
          @click="save"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
