<!--
  Step 1 of owner registration (guide §2.6): owner + business data, privacy notice and the
  UI-only "acepto" checkbox (§9). The page owns the API calls.
-->
<script setup lang="ts">
import type { SubmitEventPromise } from 'vuetify'
import type { Category } from '@/api/types'
import NewPasswordFields from '@/components/auth/NewPasswordFields.vue'
import PrivacyConsentNote from '@/components/auth/PrivacyConsentNote.vue'
import type { OwnerRegisterFormState } from '@/components/auth/ownerRegister'
import { MEXICO_TIMEZONES } from '@/utils/dates'
import { emailValidator, requiredValidator } from '@core/utils/validators'

const props = defineProps<{
  categories: Category[]
  categoriesLoading: boolean
  loading: boolean

  /** Field → message, keyed by the API field names (`business.categoryId`, `password`…). */
  errors: Record<string, string | undefined>
}>()

const emit = defineEmits<{
  submit: []
}>()

const form = defineModel<OwnerRegisterFormState>({ required: true })

const categoryItems = computed(() => props.categories.map(c => ({ title: c.name, value: c.id })))
const timezoneItems = MEXICO_TIMEZONES.map(t => ({ title: t.title, value: t.value }))

const phoneRules = [
  (v: string) => v.replace(/\D/g, '').length >= 10 || 'Escribe tu teléfono a 10 dígitos',
]

async function onSubmit(event: SubmitEventPromise) {
  const { valid } = await event
  if (valid && form.value.acceptsPrivacy)
    emit('submit')
}
</script>

<template>
  <VForm
    validate-on="submit lazy"
    @submit.prevent="onSubmit"
  >
    <div class="text-overline text-medium-emphasis mb-3">
      Tus datos
    </div>

    <div class="d-flex flex-column gap-4">
      <VRow>
        <VCol
          cols="12"
          md="6"
          class="pb-0"
        >
          <VTextField
            v-model="form.firstName"
            placeholder="Juan"
            label="Nombre(s) *"
            autocomplete="given-name"
            variant="outlined"
            prepend-inner-icon="tabler-user"
            hide-details="auto"
            :rules="[requiredValidator]"
            :error-messages="props.errors.firstName"
            autofocus
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
          class="pb-0"
        >
          <VTextField
            v-model="form.lastName"
            placeholder="Pérez"
            label="Apellido(s)"
            autocomplete="family-name"
            variant="outlined"
            prepend-inner-icon="tabler-user"
            hide-details="auto"
            :error-messages="props.errors.lastName"
          />
        </VCol>
      </VRow>

      <VTextField
        v-model="form.phone"
        placeholder="55 1234 5678"
        label="Teléfono celular *"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        variant="outlined"
        prepend-inner-icon="tabler-phone"
        hint="10 dígitos. Te enviaremos un código por SMS."
        persistent-hint
        :rules="phoneRules"
        :error-messages="props.errors.phone"
      />

      <VTextField
        v-model="form.email"
        type="email"
        autocomplete="email"
        variant="outlined"
        label="Correo *"
        placeholder="tucorreo@ejemplo.com"
        prepend-inner-icon="tabler-mail"
        hide-details="auto"
        :rules="[requiredValidator, emailValidator]"
        :error-messages="props.errors.email"
      />

      <NewPasswordFields
        v-model="form.password"
        label="Contraseña *"
        :confirm="false"
        :error-messages="props.errors.password"
      />
    </div>

    <VDivider class="my-6" />

    <div class="text-overline text-medium-emphasis mb-3">
      Tu negocio
    </div>

    <div class="d-flex flex-column gap-4">
      <VTextField
        v-model="form.businessName"
        prepend-inner-icon="tabler-building-store"
        variant="outlined"
        label="Nombre del negocio *"
        placeholder="Mi Café"
        hide-details="auto"
        :rules="[requiredValidator]"
        :error-messages="props.errors['business.name']"
      />

      <VSelect
        v-model="form.categoryId"
        :items="categoryItems"
        :loading="props.categoriesLoading"
        label="Giro del negocio *"
        prepend-inner-icon="tabler-tag"
        variant="outlined"
        hide-details="auto"
        :rules="[requiredValidator]"
        :error-messages="props.errors['business.categoryId']"
      />

      <VSelect
        v-model="form.timezone"
        :items="timezoneItems"
        label="Zona horaria *"
        prepend-inner-icon="tabler-clock"
        variant="outlined"
        hide-details="auto"
        :error-messages="props.errors['business.timezone']"
      />
    </div>

    <VDivider class="my-6" />

    <PrivacyConsentNote
      text="Al crear tu cuenta aceptas el aviso de privacidad de Repitt."
      class="mb-2"
    />
    <VCheckbox
      v-model="form.acceptsPrivacy"
      label="Acepto el aviso de privacidad"
      density="compact"
      hide-details
    />

    <VBtn
      type="submit"
      block
      size="large"
      color="primary"
      rounded="xl"
      :loading="props.loading"
      :disabled="!form.acceptsPrivacy"
      class="mt-6"
    >
      Crear cuenta
    </VBtn>
  </VForm>
</template>
