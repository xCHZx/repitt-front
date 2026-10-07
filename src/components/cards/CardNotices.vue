<!-- Informational notices on the card detail: just created, trial start, expired, not started yet. -->
<script setup lang="ts">
import type { StampCard } from '@/api/types'
import { formatLocalDate } from '@/utils/dates'

const props = defineProps<{
  card: StampCard
  justCreated: boolean

  /** Business still in `pre_trial`: the first publish starts the trial. */
  preTrial: boolean

  /** Today in the business zone (YYYY-MM-DD). */
  today: string
}>()

const notices = computed(() => {
  const { card } = props
  const list: { key: string; color: string; icon: string; text: string }[] = []

  if (props.justCreated && card.status === 'draft')
    list.push({ key: 'created', color: 'success', icon: 'tabler-circle-check', text: '¡Tarjeta creada como borrador! Publícala ahora para que tus clientes la vean.' })
  if (props.preTrial && card.status === 'draft')
    list.push({ key: 'trial', color: 'info', icon: 'tabler-info-circle', text: 'Al publicar tu primera tarjeta inicia tu periodo de prueba.' })
  if (card.status !== 'archived') {
    if (card.isExpired)
      list.push({ key: 'expired', color: 'error', icon: 'tabler-calendar-x', text: `Esta tarjeta venció el ${formatLocalDate(card.endsOn)}. Para volver a usarla, extiende la fecha de fin.` })
    else if (card.startsOn > props.today)
      list.push({ key: 'not-started', color: 'info', icon: 'tabler-calendar-time', text: `La tarjeta empieza el ${formatLocalDate(card.startsOn)}: antes no se pueden registrar sellos.` })
  }

  return list
})
</script>

<template>
  <div v-if="notices.length">
    <VAlert
      v-for="notice in notices"
      :key="notice.key"
      :color="notice.color"
      variant="tonal"
      rounded="xl"
      density="compact"
      :icon="notice.icon"
      class="mb-4"
    >
      {{ notice.text }}
    </VAlert>
  </div>
</template>
