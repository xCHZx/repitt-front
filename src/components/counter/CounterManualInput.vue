<script setup lang="ts">
import { computed, ref } from 'vue'
import { normalizeUserCode } from './counter'

// Manual capture at the counter: the customer's 8-char code (from their QR screen) or their phone.
// Codes are sent without dashes: "repitt:u:ABCD2345" (§1.3). Phones are sent as typed (§1.5).

const props = defineProps<{
  loading?: boolean

  /** The chosen card is missing (needed for a user code or a phone). */
  needsCard?: boolean
}>()

const emit = defineEmits<{
  submit: [input: { kind: 'code'; code: string } | { kind: 'phone'; phone: string }]
}>()

const mode = ref<'code' | 'phone'>('code')
const codeInput = ref('')
const phoneInput = ref('')

const userCode = computed(() => normalizeUserCode(codeInput.value))

const codeHint = computed(() => {
  const len = codeInput.value.replace(/[\s-]+/g, '').length
  if (len === 0)
    return 'Son 8 letras o números; aparece bajo el QR del cliente.'
  if (len === 8 && !userCode.value)
    return 'Revisa el código: no usa 0, O, 1 ni I.'

  return `${len} de 8 caracteres`
})

const canSubmit = computed(() => {
  if (props.needsCard)
    return false

  return mode.value === 'code' ? !!userCode.value : phoneInput.value.replace(/\D/g, '').length >= 10
})

function submit() {
  if (!canSubmit.value || props.loading)
    return
  if (mode.value === 'code' && userCode.value)
    emit('submit', { kind: 'code', code: `repitt:u:${userCode.value}` })
  else if (mode.value === 'phone')
    emit('submit', { kind: 'phone', phone: phoneInput.value.trim() })
}

function reset() {
  codeInput.value = ''
  phoneInput.value = ''
}

defineExpose({ reset })
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4">
      <VBtnToggle
        v-model="mode"
        mandatory
        density="compact"
        rounded="lg"
        color="primary"
        class="mb-4 w-100"
      >
        <VBtn
          value="code"
          prepend-icon="tabler-keyboard"
          class="flex-1-1"
        >
          Código
        </VBtn>
        <VBtn
          value="phone"
          prepend-icon="tabler-phone"
          class="flex-1-1"
        >
          Teléfono
        </VBtn>
      </VBtnToggle>

      <form @submit.prevent="submit">
        <VTextField
          v-if="mode === 'code'"
          v-model="codeInput"
          label="Código del cliente"
          placeholder="ABCD2345"
          prepend-inner-icon="tabler-keyboard"
          variant="outlined"
          autocapitalize="characters"
          autocomplete="off"
          spellcheck="false"
          maxlength="12"
          :hint="codeHint"
          persistent-hint
          class="counter-code-field"
        />

        <VTextField
          v-else
          v-model="phoneInput"
          label="Teléfono del cliente"
          placeholder="55 1234 5678"
          prepend-inner-icon="tabler-phone"
          variant="outlined"
          type="tel"
          inputmode="tel"
          autocomplete="off"
          maxlength="20"
          hint="Solo clientes ya registrados en tu negocio."
          persistent-hint
        />

        <div
          v-if="props.needsCard"
          class="text-caption text-warning mt-3"
        >
          Elige primero la tarjeta a sellar.
        </div>

        <VBtn
          block
          type="submit"
          color="primary"
          rounded="xl"
          class="mt-4"
          prepend-icon="tabler-rosette-discount-check"
          :disabled="!canSubmit"
          :loading="props.loading"
        >
          Sellar
        </VBtn>
      </form>
    </VCardText>
  </VCard>
</template>

<style>
.counter-code-field input {
  font-family: monospace;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
</style>
