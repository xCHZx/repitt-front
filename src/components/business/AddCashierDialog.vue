<script setup lang="ts">
import { createMember } from '@/api/endpoints/businesses'
import type { Member } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

// Add a cashier (guide §4.A.6): POST …/members { phone, displayName, role: 'cashier' }.

const emit = defineEmits<{
  created: [member: Member]
  suspended: []
}>()

const model = defineModel<boolean>({ default: false })

const business = useBusinessStore()
const session = useSessionStore()
const { error, fieldErrors, capture, reset } = useApiError()

const phone = ref('')
const displayName = ref('')
const isSaving = ref(false)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }>; resetValidation: () => void } | null>(null)

const PHONE_FIELD_DETAILS = ['ownerPhone', 'alreadyMember']

/** INVALID_PHONE and 409 ownerPhone / alreadyMember are shown under the phone field. */
const phoneError = computed(() => {
  const e = error.value
  if (!e)
    return undefined
  if (e.error.code === 'CONFLICT' && PHONE_FIELD_DETAILS.includes(e.error.detailCode ?? ''))
    return e.message
  if (e.error.code === 'INVALID_PHONE')
    return e.fieldErrors.phone || e.message

  return fieldErrors.value.phone
})

const showGeneralError = computed(() => !!error.value && !phoneError.value)

const isReauthCancelled = computed(() => error.value?.error.code === 'REAUTH_REQUIRED')

/** Without a verified email the API asks for the password again here (403 REAUTH_REQUIRED). */
const emailUnverified = computed(() => !session.me?.emailVerifiedAt)

// Wording depends on whether there is an email to verify at all
const emailTip = computed(() => session.emailPendingVerification
  ? 'Si verificas tu correo, no tendrás que confirmar tu contraseña en este paso desde tu siguiente inicio de sesión.'
  : 'Si agregas y verificas un correo en tu perfil, no tendrás que confirmar tu contraseña en este paso desde tu siguiente inicio de sesión.')

watch(model, open => {
  if (open) {
    phone.value = ''
    displayName.value = ''
    reset()
    formRef.value?.resetValidation()
  }
})

const required = (v: string) => !!v?.trim() || 'Requerido'

async function submit() {
  const result = await formRef.value?.validate()
  if ((result && !result.valid) || !business.activeId)
    return

  reset()
  isSaving.value = true
  try {
    const member = await createMember(business.activeId, {
      phone: phone.value.trim(),
      displayName: displayName.value.trim(),
      role: 'cashier',
    })

    emit('created', member)
    model.value = false
  }
  catch (e) {
    const err = capture(e)
    if (err.error.code === 'CONFLICT' && err.error.detailCode === 'businessSuspended')
      emit('suspended')
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="model"
    max-width="420"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <div class="text-h6 font-weight-bold mb-1">
          Agregar cajero
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Entrará con su teléfono, sin contraseña, y solo podrá registrar visitas y canjear recompensas.
        </div>

        <VForm
          ref="formRef"
          @submit.prevent="submit"
        >
          <div class="d-flex flex-column gap-4">
            <VTextField
              v-model="displayName"
              label="Nombre *"
              placeholder="Ej: Luis"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="tabler-user"
              maxlength="100"
              :rules="[required]"
              :error-messages="fieldErrors.displayName"
              :disabled="isSaving"
              hide-details="auto"
            />
            <VTextField
              v-model="phone"
              label="Teléfono *"
              placeholder="Ej: 55 9876 5432"
              type="tel"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="tabler-phone"
              :rules="[required]"
              :error-messages="phoneError"
              :disabled="isSaving"
              hide-details="auto"
            />
          </div>

          <div
            v-if="emailUnverified"
            class="text-caption text-medium-emphasis mt-3"
          >
            Es posible que te pidamos tu contraseña para confirmar. {{ emailTip }}
          </div>

          <ApiErrorAlert
            v-if="showGeneralError"
            :error="error"
            class="mt-4"
          >
            <div
              v-if="isReauthCancelled"
              class="mt-1"
            >
              {{ emailTip }}
            </div>
          </ApiErrorAlert>

          <div class="d-flex gap-3 mt-5">
            <VBtn
              block
              variant="tonal"
              color="secondary"
              :disabled="isSaving"
              @click="model = false"
            >
              Cancelar
            </VBtn>
            <VBtn
              block
              type="submit"
              color="primary"
              :loading="isSaving"
            >
              Agregar
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
