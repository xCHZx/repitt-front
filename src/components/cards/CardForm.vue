<!-- Fields shared by the create and edit card pages (wrap it in a <VForm>). -->
<script setup lang="ts">
import CardAppearanceFields from './CardAppearanceFields.vue'
import CardListItem from './CardListItem.vue'
import CardRulesFields from './CardRulesFields.vue'
import CardValidityFields from './CardValidityFields.vue'
import { iconChoicePreview } from './cardIcons'
import type { IconChoice } from './cardIcons'
import { CARD_LIMITS } from './cardForm'
import type { CardFormModel } from './cardForm'
import { useBusinessStore } from '@/stores/business'
import { formatInstant } from '@/utils/dates'

const props = defineProps<{
  today: string
  fieldErrors: Record<string, string | undefined>
  rulesLockedAt?: string | null
  originalEndsOn?: string | null
  existingIconUrl?: string | null
}>()

const form = defineModel<CardFormModel>({ required: true })
const icon = defineModel<IconChoice | null>('icon', { required: true })

const business = useBusinessStore()

const locked = computed(() => !!props.rulesLockedAt)

const previewIcon = computed(() => iconChoicePreview(icon.value, form.value.primaryColor) ?? props.existingIconUrl ?? null)

const required = (label: string) => (v: string) => !!v?.trim() || `Escribe ${label}`
const maxLen = (n: number) => (v: string) => (v ?? '').trim().length <= n || `Máximo ${n} caracteres`
</script>

<template>
  <div>
    <!-- Vista previa -->
    <div class="card-form-label mb-3">
      <VIcon
        icon="tabler-eye"
        size="15"
      />
      Vista previa
    </div>
    <CardListItem
      :name="form.name || 'Nombre de la tarjeta'"
      :reward="form.reward || 'Tu recompensa aquí'"
      :required-stamps="form.requiredStamps"
      :primary-color="form.primaryColor"
      :icon-url="previewIcon"
      :is-expired="false"
      class="mb-6"
    />

    <!-- Reglas congeladas -->
    <VAlert
      v-if="locked"
      color="info"
      variant="tonal"
      rounded="xl"
      density="compact"
      icon="tabler-lock"
      class="mb-5"
    >
      Esta tarjeta tiene sellos de clientes desde el {{ formatInstant(props.rulesLockedAt, business.timezone) }}.
      Para proteger su avance, ya no puedes cambiar los sellos requeridos, la espera entre sellos, los ciclos
      ni la fecha de inicio; la fecha de fin solo se puede extender o quitar.
    </VAlert>

    <!-- Básico -->
    <div class="card-form-label mb-3">
      <VIcon
        icon="tabler-forms"
        size="15"
      />
      Básico
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VCardText class="pa-4 d-flex flex-column gap-4">
        <VTextField
          v-model="form.name"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-cards"
          label="Nombre de la tarjeta"
          placeholder="Ej: Café Fidelidad"
          :counter="CARD_LIMITS.name"
          :rules="[required('el nombre'), maxLen(CARD_LIMITS.name)]"
          :error-messages="props.fieldErrors.name"
        />
        <VTextField
          v-model="form.reward"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-gift"
          label="Recompensa"
          placeholder="Ej: Un americano gratis"
          :counter="CARD_LIMITS.reward"
          :rules="[required('la recompensa'), maxLen(CARD_LIMITS.reward)]"
          :error-messages="props.fieldErrors.reward"
        />
        <VTextField
          v-model="form.description"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-text-plus"
          label="Descripción (opcional)"
          placeholder="Ej: Junta 8 sellos y el siguiente café es gratis"
          :counter="CARD_LIMITS.description"
          :rules="[maxLen(CARD_LIMITS.description)]"
          :error-messages="props.fieldErrors.description"
        />
      </VCardText>
    </VCard>

    <!-- Reglas -->
    <div class="card-form-label mb-3">
      <VIcon
        icon="tabler-settings"
        size="15"
      />
      Reglas
    </div>
    <CardRulesFields
      v-model="form"
      :locked="locked"
      :field-errors="props.fieldErrors"
      class="mb-5"
    />

    <!-- Apariencia -->
    <div class="card-form-label mb-3">
      <VIcon
        icon="tabler-palette"
        size="15"
      />
      Apariencia
    </div>
    <CardAppearanceFields
      v-model:color="form.primaryColor"
      v-model:icon="icon"
      :existing-icon-url="props.existingIconUrl"
      :color-error="props.fieldErrors.primaryColor"
      class="mb-5"
    />

    <!-- Vigencia -->
    <div class="card-form-label mb-3">
      <VIcon
        icon="tabler-calendar"
        size="15"
      />
      Vigencia
    </div>
    <CardValidityFields
      v-model="form"
      :today="props.today"
      :locked="locked"
      :original-ends-on="props.originalEndsOn"
      :field-errors="props.fieldErrors"
      class="mb-6"
    />
  </div>
</template>

<style>
.card-form-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
