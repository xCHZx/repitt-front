<!--
  Card validity as local dates (YYYY-MM-DD, business zone). The end date is the last valid day.
  With locked rules: the start can't change and the end can only grow or be removed (§4.A.5).
-->
<script setup lang="ts">
import type { CardFormModel } from './cardForm'

const props = defineProps<{

  /** Today in the business zone (YYYY-MM-DD). */
  today: string
  locked: boolean

  /** `endsOn` read from the card when editing; undefined when creating. */
  originalEndsOn?: string | null
  fieldErrors: Record<string, string | undefined>
}>()

const form = defineModel<CardFormModel>({ required: true })

const YMD = /^\d{4}-\d{2}-\d{2}$/

/** Locked card without an end date: it can't get one now. */
const endLockedToNone = computed(() => props.locked && props.originalEndsOn === null)

const minEnd = computed(() => {
  const candidates = [form.value.startsAt, props.today]
  if (props.locked && props.originalEndsOn)
    candidates.push(props.originalEndsOn)

  return candidates.filter(Boolean).sort().pop() ?? props.today
})

const startRules = [(v: string) => YMD.test(v) || 'Elige la fecha de inicio']

const endRules = [
  (v: string) => form.value.noEnd || YMD.test(v) || 'Elige la fecha de fin o activa «Sin fecha de fin»',
  (v: string) => form.value.noEnd || !YMD.test(v) || v >= form.value.startsAt || 'La fecha de fin debe ser igual o posterior a la de inicio',
  (v: string) => form.value.noEnd || !YMD.test(v) || v === props.originalEndsOn || v >= props.today || 'La fecha de fin no puede estar en el pasado',
  (v: string) => form.value.noEnd || !props.locked || !props.originalEndsOn || v >= props.originalEndsOn || 'Solo puedes extender la fecha de fin',
]
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4 d-flex flex-column gap-4">
      <VTextField
        v-model="form.startsAt"
        type="date"
        label="Fecha de inicio"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="tabler-calendar"
        :disabled="props.locked"
        :rules="startRules"
        :error-messages="props.fieldErrors.startsAt"
      />

      <VSwitch
        v-model="form.noEnd"
        label="Sin fecha de fin"
        color="primary"
        density="compact"
        hide-details
        :disabled="endLockedToNone"
      />

      <VTextField
        v-if="!form.noEnd"
        v-model="form.endsAt"
        type="date"
        label="Último día válido"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="tabler-calendar-off"
        :min="minEnd"
        hint="La tarjeta vale hasta el final de ese día"
        persistent-hint
        :rules="endRules"
        :error-messages="props.fieldErrors.endsAt"
      />
      <div
        v-else-if="props.fieldErrors.endsAt"
        class="text-caption text-error"
      >
        {{ props.fieldErrors.endsAt }}
      </div>

      <div
        v-if="endLockedToNone"
        class="text-caption text-medium-emphasis"
      >
        Como la tarjeta ya tiene sellos de clientes, no se le puede poner fecha de fin.
      </div>
    </VCardText>
  </VCard>
</template>
