<!--
  New password (+ optional confirmation) with the v1 rules (guide §1.6): at least 10 characters,
  no composition rules; common passwords and ones containing personal data are rejected by the API.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  confirm?: boolean
  errorMessages?: string | string[]
  autofocus?: boolean
}>(), {
  label: 'Nueva contraseña',
  confirm: true,
  errorMessages: undefined,
  autofocus: false,
})

const password = defineModel<string>({ required: true })
const confirmation = ref('')
const visible = ref(false)

const MIN_LENGTH = 10

const passwordRules = [
  (v: string) => !!v || 'Escribe una contraseña',
  (v: string) => v.length >= MIN_LENGTH || `Usa al menos ${MIN_LENGTH} caracteres`,
]

const confirmRules = [
  (v: string) => v === password.value || 'Las contraseñas no coinciden',
]
</script>

<template>
  <div class="d-flex flex-column gap-4">
    <VTextField
      v-model="password"
      :label="props.label"
      :autofocus="props.autofocus"
      placeholder="············"
      autocomplete="new-password"
      variant="outlined"
      prepend-inner-icon="tabler-lock"
      :type="visible ? 'text' : 'password'"
      :append-inner-icon="visible ? 'tabler-eye-off' : 'tabler-eye'"
      hint="Mínimo 10 caracteres. Una frase larga es más segura. No uses tu correo, tu teléfono ni «repitt»."
      persistent-hint
      :rules="passwordRules"
      :error-messages="props.errorMessages"
      @click:append-inner="visible = !visible"
    />
    <VTextField
      v-if="props.confirm"
      v-model="confirmation"
      label="Confirma la contraseña"
      placeholder="············"
      autocomplete="new-password"
      variant="outlined"
      prepend-inner-icon="tabler-lock-check"
      :type="visible ? 'text' : 'password'"
      :rules="confirmRules"
    />
  </div>
</template>
