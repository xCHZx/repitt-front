<!--
  Card rules: stamps to complete, hours between stamps, cycles per customer.
  Disabled once the rules are locked (first real stamp, §4.A.5).
-->
<script setup lang="ts">
import { CARD_LIMITS } from './cardForm'
import type { CardFormModel } from './cardForm'
import { tint } from './cardMeta'

const props = defineProps<{
  locked: boolean
  fieldErrors: Record<string, string | undefined>
}>()

const form = defineModel<CardFormModel>({ required: true })

const { stamps, cooldown, cycles } = CARD_LIMITS

const intInRange = (min: number, max: number) => (v: unknown) => {
  const n = Number(v)

  return (v !== '' && Number.isInteger(n) && n >= min && n <= max) || `Escribe un número entero entre ${min} y ${max}`
}
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4">
      <!-- Sellos requeridos -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-body-2 font-weight-medium">Sellos para completar</span>
        <VChip
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ form.requiredStamps }} {{ form.requiredStamps === 1 ? 'sello' : 'sellos' }}
        </VChip>
      </div>
      <div
        v-if="form.requiredStamps <= 12"
        class="dots-preview mb-2"
      >
        <div
          v-for="i in form.requiredStamps"
          :key="i"
          class="dot-mini"
          :style="{ '--c': tint(form.primaryColor, '') }"
        />
      </div>
      <VSlider
        v-model="form.requiredStamps"
        :min="stamps.min"
        :max="stamps.max"
        :step="1"
        thumb-label
        thumb-size="20"
        :color="tint(form.primaryColor, '')"
        :disabled="props.locked"
        :error-messages="props.fieldErrors.requiredStamps"
        :hide-details="!props.fieldErrors.requiredStamps"
        class="mb-5"
      />

      <VDivider class="mb-5" />

      <!-- Horas entre sellos -->
      <div class="text-body-2 font-weight-medium mb-1">
        Horas mínimas entre sellos
      </div>
      <div class="text-caption text-medium-emphasis mb-3">
        Evita que el mismo cliente acumule dos sellos seguidos. 0 = sin espera.
      </div>
      <VTextField
        v-model.number="form.cooldownHours"
        type="number"
        inputmode="numeric"
        :min="cooldown.min"
        :max="cooldown.max"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="tabler-clock"
        suffix="horas"
        :disabled="props.locked"
        :rules="[intInRange(cooldown.min, cooldown.max)]"
        :error-messages="props.fieldErrors.cooldownHours"
        class="mb-5"
      />

      <VDivider class="mb-5" />

      <!-- Ciclos por cliente -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-body-2 font-weight-medium">Ciclos por cliente</span>
        <VSwitch
          v-model="form.unlimitedCycles"
          label="Sin límite"
          color="primary"
          density="compact"
          hide-details
          :disabled="props.locked"
        />
      </div>
      <div class="text-caption text-medium-emphasis mb-3">
        Cuántas veces puede completar y canjear esta tarjeta cada cliente
      </div>
      <VTextField
        v-if="!form.unlimitedCycles"
        v-model.number="form.maxCycles"
        type="number"
        inputmode="numeric"
        :min="cycles.min"
        :max="cycles.max"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="tabler-repeat"
        suffix="veces"
        :disabled="props.locked"
        :rules="[intInRange(cycles.min, cycles.max)]"
        :error-messages="props.fieldErrors.maxCycles"
      />
      <div
        v-else-if="props.fieldErrors.maxCycles"
        class="text-caption text-error"
      >
        {{ props.fieldErrors.maxCycles }}
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.dots-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
  margin-block-end: var(--s-1);
}

// Sello vacío de la guía (§8.9): punteado del color de la tarjeta al 35%.
.dot-mini {
  border: 2px dotted color-mix(in srgb, var(--c) 35%, transparent);
  border-radius: 50%;
  block-size: 20px;
  inline-size: 20px;
}
</style>
