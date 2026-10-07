<script lang="ts" setup>
import { computed } from 'vue'
import type { PendingRedemption } from '@/api/types'
import { DEFAULT_CARD_COLOR } from '@/components/counter/counter'
import { formatInstant } from '@/utils/dates'

// One pending redemption (§4.B.5): reward, card, customer and completion date. The body links to
// the cycle detail; "Canjear" redeems from the list (no code).

const props = defineProps<{
  item: PendingRedemption
  timeZone: string

  /** From GET …/cards; null when the card is archived or not listed (default style). */
  primaryColor?: string | null
  iconUrl?: string | null
}>()

const emit = defineEmits<{
  redeem: []
}>()

const accentColor = computed(() => props.primaryColor || DEFAULT_CARD_COLOR)
const completed = computed(() => formatInstant(props.item.cycle.completedAt, props.timeZone))
</script>

<template>
  <VCard
    rounded="xl"
    :style="{
      borderInlineStart: `4px solid ${accentColor}`,
      background: `linear-gradient(to right, ${accentColor}10, transparent 55%)`,
    }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <RouterLink
          :to="`/empresa/ciclos/${props.item.cycle.id}`"
          class="pending-item__link d-flex align-center gap-3 flex-grow-1 overflow-hidden"
        >
          <VAvatar
            rounded="lg"
            size="44"
            :style="{ background: `${accentColor}20` }"
          >
            <VImg
              v-if="props.iconUrl"
              :src="props.iconUrl"
            />
            <VIcon
              v-else
              icon="tabler-gift"
              size="22"
              :style="{ color: accentColor }"
            />
          </VAvatar>

          <div class="flex-grow-1 overflow-hidden">
            <div
              class="text-body-1 font-weight-bold text-truncate"
              :style="{ color: accentColor }"
            >
              {{ props.item.card.reward }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate mt-1">
              {{ props.item.card.name }}
            </div>
            <div class="d-flex flex-wrap align-center column-gap-3 mt-1">
              <div class="d-flex align-center gap-1 text-caption text-high-emphasis text-truncate">
                <VIcon
                  icon="tabler-user"
                  size="13"
                />
                {{ props.item.customer.displayName }}
              </div>
              <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
                <VIcon
                  icon="tabler-calendar"
                  size="13"
                />
                {{ completed }}
              </div>
              <VChip
                v-if="props.item.cycle.isTest"
                size="x-small"
                color="info"
                variant="tonal"
              >
                Prueba
              </VChip>
            </div>
          </div>
        </RouterLink>

        <VBtn
          size="small"
          variant="flat"
          color="success"
          rounded="xl"
          prepend-icon="tabler-gift"
          class="font-weight-bold flex-shrink-0"
          @click="emit('redeem')"
        >
          Canjear
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.pending-item__link {
  color: inherit;
  text-decoration: none;
}
</style>
