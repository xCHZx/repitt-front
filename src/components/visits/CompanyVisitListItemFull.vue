<script setup lang="ts">
import type { LoyaltyEvent } from '@/api/types'
import { EVENT_TYPES, actorLabel, isDeletedCustomer } from '@/components/crm/eventLabels'
import { formatInstant, formatTime } from '@/utils/dates'

// Owner event log rows (guide §4.A.8): LoyaltyEventDto[] rendered in the business time zone.

interface Props {
  events: LoyaltyEvent[]

  /** stampCardId → card name (cards + archived cards, or the cards of a customer detail). */
  cardNames: Record<string, string>
  timezone: string

  /** Hide the link to the customer (e.g. inside the customer detail). */
  hideCustomerLink?: boolean
}

const props = defineProps<Props>()
const router = useRouter()

const cardName = (event: LoyaltyEvent) => props.cardNames[event.stampCardId] ?? 'Tarjeta'

const customerName = (event: LoyaltyEvent) =>
  isDeletedCustomer(event) ? 'Cliente dado de baja' : event.customer.displayName

const canOpenCycle = (event: LoyaltyEvent) => !isDeletedCustomer(event) && !!event.cycleId

const openCycle = (event: LoyaltyEvent) => {
  if (canOpenCycle(event))
    router.push(`/empresa/ciclos/${event.cycleId}`)
}
</script>

<template>
  <VCard rounded="xl">
    <VList density="compact">
      <template
        v-for="(event, index) in props.events"
        :key="event.id"
      >
        <VListItem
          class="py-3"
          :link="canOpenCycle(event)"
          @click="openCycle(event)"
        >
          <template #prepend>
            <VAvatar
              size="40"
              :color="EVENT_TYPES[event.type].color"
              variant="tonal"
              class="me-3"
            >
              <VIcon
                :icon="EVENT_TYPES[event.type].icon"
                size="20"
              />
            </VAvatar>
          </template>

          <VListItemTitle class="text-body-2 font-weight-bold d-flex align-center flex-wrap gap-1">
            <RouterLink
              v-if="!props.hideCustomerLink && !isDeletedCustomer(event)"
              :to="`/empresa/clientes/${event.customer.id}`"
              class="customer-link text-truncate"
              @click.stop
            >
              {{ customerName(event) }}
            </RouterLink>
            <span
              v-else
              class="text-truncate"
              :class="{ 'text-medium-emphasis': isDeletedCustomer(event) }"
            >
              {{ customerName(event) }}
            </span>
            <VChip
              v-if="event.isTest"
              size="x-small"
              color="info"
              variant="tonal"
            >
              Prueba
            </VChip>
            <VChip
              v-if="event.voidedByEventId"
              size="x-small"
              color="error"
              variant="tonal"
            >
              Anulado
            </VChip>
          </VListItemTitle>

          <VListItemSubtitle class="event-subtitle">
            <span class="font-weight-medium">
              {{ EVENT_TYPES[event.type].label }}
            </span>
            · {{ cardName(event) }}
          </VListItemSubtitle>

          <div class="d-flex align-center gap-1 text-caption text-medium-emphasis mt-1">
            <VIcon
              icon="tabler-user"
              size="13"
            />
            {{ actorLabel(event.actor) }}
          </div>

          <div
            v-if="event.reason"
            class="text-caption text-medium-emphasis mt-1"
          >
            Motivo: {{ event.reason }}
          </div>

          <template #append>
            <div class="d-flex flex-column align-end gap-1 ms-2">
              <span class="text-caption font-weight-medium text-no-wrap">
                {{ formatInstant(event.occurredAt, props.timezone, { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </span>
              <span class="text-caption text-medium-emphasis text-no-wrap">
                {{ formatTime(event.occurredAt, props.timezone) }}
              </span>
            </div>
          </template>
        </VListItem>
        <VDivider v-if="index < props.events.length - 1" />
      </template>
    </VList>
  </VCard>
</template>

<style lang="scss" scoped>
// Enlace dentro del texto (guía §8.1, discreto): subrayado de 1px en --enlace, 2px en hover.
.customer-link {
  color: inherit;
  text-decoration-color: var(--enlace);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;

  &:hover {
    text-decoration-thickness: 2px;
  }
}

.event-subtitle {
  white-space: normal;
}
</style>
