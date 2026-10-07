<script setup lang="ts">
import { MAX_SLOTS_PER_DAY, WEEK_DAYS } from './businessForm'
import type { WeekDay } from './businessForm'
import type { OpeningHours, OpeningHoursSlot } from '@/api/types'

// Structured opening hours (guide §4.A.1): per day up to 4 `HH:MM` slots, absent day = closed.
// Field errors come with dotted paths (`openingHours.mon.0.open` or `mon.0.open`).

const props = withDefaults(defineProps<{
  errors?: Record<string, string | undefined>
  prefix?: string
  disabled?: boolean
}>(), {
  errors: () => ({}),
  prefix: 'openingHours.',
  disabled: false,
})

const model = defineModel<OpeningHours>({ required: true })

const slotsOf = (day: WeekDay): OpeningHoursSlot[] => model.value[day] ?? []

function setDay(day: WeekDay, slots: OpeningHoursSlot[]) {
  const next: OpeningHours = { ...model.value }
  if (slots.length)
    next[day] = slots
  else
    delete next[day]
  model.value = next
}

function toggleDay(day: WeekDay, open: boolean | null) {
  setDay(day, open ? [{ open: '09:00', close: '18:00' }] : [])
}

function addSlot(day: WeekDay) {
  const slots = slotsOf(day)
  if (slots.length >= MAX_SLOTS_PER_DAY)
    return
  const last = slots[slots.length - 1]

  setDay(day, [...slots, { open: last?.close ?? '09:00', close: '20:00' }])
}

function removeSlot(day: WeekDay, index: number) {
  setDay(day, slotsOf(day).filter((_, i) => i !== index))
}

function updateSlot(day: WeekDay, index: number, key: keyof OpeningHoursSlot, value: string) {
  setDay(day, slotsOf(day).map((s, i) => i === index ? { ...s, [key]: value } : s))
}

function errorAt(path: string): string | undefined {
  return props.errors[`${props.prefix}${path}`] ?? props.errors[path]
}

const generalError = computed(() => {
  const own = props.errors[props.prefix.replace(/\.$/, '')]
  if (own)
    return own

  return WEEK_DAYS.map(d => errorAt(d.key)).find(Boolean)
})
</script>

<template>
  <div class="opening-hours-editor">
    <div
      v-for="day in WEEK_DAYS"
      :key="day.key"
      class="ohe-day"
    >
      <div class="d-flex align-center justify-space-between">
        <span class="text-body-2 font-weight-medium">{{ day.label }}</span>
        <div class="d-flex align-center gap-2">
          <span class="text-caption text-medium-emphasis">
            {{ slotsOf(day.key).length ? 'Abierto' : 'Cerrado' }}
          </span>
          <VSwitch
            :model-value="slotsOf(day.key).length > 0"
            :disabled="props.disabled"
            density="compact"
            color="primary"
            hide-details
            inset
            @update:model-value="toggleDay(day.key, $event)"
          />
        </div>
      </div>

      <div
        v-for="(slot, i) in slotsOf(day.key)"
        :key="i"
        class="d-flex align-start gap-2 mt-2"
      >
        <VTextField
          :model-value="slot.open"
          type="time"
          label="Abre"
          variant="outlined"
          density="compact"
          :disabled="props.disabled"
          :error-messages="errorAt(`${day.key}.${i}.open`)"
          hide-details="auto"
          @update:model-value="updateSlot(day.key, i, 'open', $event)"
        />
        <VTextField
          :model-value="slot.close"
          type="time"
          label="Cierra"
          variant="outlined"
          density="compact"
          :disabled="props.disabled"
          :error-messages="errorAt(`${day.key}.${i}.close`)"
          hide-details="auto"
          @update:model-value="updateSlot(day.key, i, 'close', $event)"
        />
        <VBtn
          icon
          variant="text"
          size="small"
          color="secondary"
          :disabled="props.disabled"
          aria-label="Quitar horario"
          @click="removeSlot(day.key, i)"
        >
          <VIcon
            icon="tabler-trash"
            size="18"
          />
        </VBtn>
      </div>

      <VBtn
        v-if="slotsOf(day.key).length && slotsOf(day.key).length < MAX_SLOTS_PER_DAY"
        variant="text"
        size="small"
        color="primary"
        prepend-icon="tabler-plus"
        class="mt-1 px-1"
        :disabled="props.disabled"
        @click="addSlot(day.key)"
      >
        Agregar horario
      </VBtn>
    </div>

    <div
      v-if="generalError"
      class="text-caption text-error mt-2"
    >
      {{ generalError }}
    </div>
  </div>
</template>

<style scoped>
.ohe-day {
  padding-block: 8px;
}

.ohe-day + .ohe-day {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
