<script setup lang="ts">
import { EVENT_ICONS, EVENT_LABELS } from './counter'
import type { LoyaltyEvent } from '@/api/types'
import { withinVoidWindow } from '@/composables/useCounterRecents'
import { formatDateTime } from '@/utils/dates'

// Events of a cycle (§4.B.6), chronological, in the business zone. "Deshacer" only on own events
// (actor.isSelf) inside the void window (§4.B.7).

const props = defineProps<{
  events: LoyaltyEvent[]
  timeZone: string

  /** Epoch ms, ticking (re-evaluates the undo window). */
  now: number
}>()

const emit = defineEmits<{
  undo: [event: LoyaltyEvent]
}>()

const CHANNELS: Record<LoyaltyEvent['channel'], string> = {
  qr_user: 'QR del cliente',
  qr_card: 'QR de la tarjeta',
  phone: 'Teléfono',
  counter_enroll: 'Alta en mostrador',
  pending_list: 'Sin código',
}

const ROLES: Record<LoyaltyEvent['actor']['role'], string> = {
  owner: 'Dueño',
  cashier: 'Cajero',
  admin: 'Soporte Repitt',
}

function actorName(e: LoyaltyEvent) {
  if (e.actor.isSelf)
    return 'Tú'

  return e.actor.displayName || ROLES[e.actor.role]
}

function color(e: LoyaltyEvent) {
  if (e.type === 'redeem')
    return 'success'
  if (e.type.startsWith('void_'))
    return 'error'

  return 'primary'
}

function canUndo(e: LoyaltyEvent) {
  return e.actor.isSelf
    && (e.type === 'stamp' || e.type === 'redeem')
    && !e.voidedByEventId
    && withinVoidWindow(e.occurredAt, props.now)
}
</script>

<template>
  <VCard rounded="xl">
    <VList
      lines="two"
      density="comfortable"
      class="py-0"
    >
      <template
        v-for="(e, i) in props.events"
        :key="e.id"
      >
        <VDivider v-if="i > 0" />
        <VListItem :class="{ 'cycle-event--voided': !!e.voidedByEventId }">
          <template #prepend>
            <VAvatar
              size="36"
              variant="tonal"
              :color="color(e)"
            >
              <VIcon
                :icon="EVENT_ICONS[e.type]"
                size="20"
              />
            </VAvatar>
          </template>

          <VListItemTitle class="d-flex align-center gap-2">
            <span class="font-weight-medium">{{ EVENT_LABELS[e.type] }}</span>
            <VChip
              v-if="e.voidedByEventId"
              size="x-small"
              variant="tonal"
            >
              Anulado
            </VChip>
          </VListItemTitle>
          <VListItemSubtitle>
            {{ formatDateTime(e.occurredAt, props.timeZone) }} · {{ actorName(e) }} · {{ CHANNELS[e.channel] }}
          </VListItemSubtitle>
          <div
            v-if="e.reason"
            class="text-caption text-medium-emphasis mt-1"
          >
            Motivo: {{ e.reason }}
          </div>

          <template
            v-if="canUndo(e)"
            #append
          >
            <VBtn
              size="small"
              variant="text"
              color="error"
              prepend-icon="tabler-arrow-back-up"
              @click="emit('undo', e)"
            >
              Deshacer
            </VBtn>
          </template>
        </VListItem>
      </template>
    </VList>
  </VCard>
</template>

<style scoped>
.cycle-event--voided {
  opacity: 0.65;
}
</style>
