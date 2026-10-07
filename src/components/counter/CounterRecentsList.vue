<script setup lang="ts">
import { computed, ref } from 'vue'
import CounterVoidDialog from './CounterVoidDialog.vue'
import type { CounterRecent } from '@/composables/useCounterRecents'
import { useCounterRecents } from '@/composables/useCounterRecents'
import { useBusinessStore } from '@/stores/business'
import { formatTime } from '@/utils/dates'

// "Recientes" of this counter session with "Deshacer" for 15 min (§4.B.7). In memory only.

const props = withDefaults(defineProps<{
  limit?: number
}>(), {
  limit: 5,
})

const business = useBusinessStore()
const { recents, canUndo } = useCounterRecents()

const visible = computed(() => recents.value.slice(0, props.limit))

const voidOpen = ref(false)
const target = ref<CounterRecent | null>(null)
const snackbar = ref(false)

function undo(entry: CounterRecent) {
  target.value = entry
  voidOpen.value = true
}

function onVoided() {
  snackbar.value = true
}
</script>

<template>
  <div v-if="visible.length">
    <div class="counter-section-label mb-3">
      <VIcon
        icon="tabler-history"
        size="15"
      />
      Recientes
    </div>

    <VCard rounded="xl">
      <VList
        lines="two"
        density="comfortable"
        class="py-0"
      >
        <template
          v-for="(entry, i) in visible"
          :key="entry.eventId"
        >
          <VDivider v-if="i > 0" />
          <VListItem :class="{ 'counter-recent--voided': entry.voided }">
            <template #prepend>
              <VAvatar
                size="36"
                variant="tonal"
                :color="entry.type === 'redeem' ? 'success' : 'primary'"
              >
                <VIcon
                  :icon="entry.type === 'redeem' ? 'tabler-gift' : 'tabler-rosette-discount-check'"
                  size="20"
                />
              </VAvatar>
            </template>

            <VListItemTitle class="font-weight-medium">
              {{ entry.customerName }}
            </VListItemTitle>
            <VListItemSubtitle>
              {{ entry.type === 'redeem' ? 'Canje' : 'Sello' }} · {{ entry.cardName }} · {{ formatTime(new Date(entry.at).toISOString(), business.timezone) }}
            </VListItemSubtitle>

            <template #append>
              <VChip
                v-if="entry.voided"
                size="x-small"
                variant="tonal"
              >
                Deshecho
              </VChip>
              <VBtn
                v-else-if="canUndo(entry)"
                size="small"
                variant="text"
                color="error"
                prepend-icon="tabler-arrow-back-up"
                @click="undo(entry)"
              >
                Deshacer
              </VBtn>
              <VBtn
                icon="tabler-chevron-right"
                size="small"
                variant="text"
                aria-label="Ver ciclo"
                :to="`/empresa/ciclos/${entry.cycleId}`"
              />
            </template>
          </VListItem>
        </template>
      </VList>
    </VCard>

    <CounterVoidDialog
      v-model="voidOpen"
      :event-id="target?.eventId ?? null"
      :type="target?.type"
      :description="target ? `${target.customerName} · ${target.cardName}` : undefined"
      @voided="onVoided"
    />

    <VSnackbar
      v-model="snackbar"
      color="success"
      :timeout="3000"
    >
      Movimiento deshecho
    </VSnackbar>
  </div>
</template>

<style scoped>
.counter-recent--voided {
  opacity: 0.6;
}

.counter-section-label {
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
