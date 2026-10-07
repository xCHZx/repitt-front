<script setup lang="ts">
import { ref, watch } from 'vue'
import CounterCardPicker from './CounterCardPicker.vue'
import { cardAvailability } from './counter'
import type { StampCard } from '@/api/types'

// Scanned the customer's personal QR (repitt:u:…) without a chosen card: pick it, then stamp.

const props = defineProps<{
  cards: StampCard[]
  timeZone: string
  initialCardId?: string | null
}>()

const emit = defineEmits<{
  choose: [cardId: string]
  cancel: []
}>()

const open = defineModel<boolean>({ default: false })

const cardId = ref<string | null>(null)

watch(open, isOpen => {
  if (isOpen)
    cardId.value = props.initialCardId ?? null
})

function isStampable(id: string | null) {
  const card = props.cards.find(c => c.id === id)

  return !!card && cardAvailability(card, props.timeZone).stampable
}

function confirm() {
  if (!cardId.value || !isStampable(cardId.value))
    return
  open.value = false
  emit('choose', cardId.value)
}

function cancel() {
  open.value = false
  emit('cancel')
}
</script>

<template>
  <VDialog
    v-model="open"
    max-width="440"
    persistent
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <div class="text-center mb-5">
          <VAvatar
            color="primary"
            variant="tonal"
            size="56"
            class="mb-3"
          >
            <VIcon
              icon="tabler-user"
              size="28"
            />
          </VAvatar>
          <div class="text-h6 font-weight-bold mb-1">
            Cliente identificado
          </div>
          <div class="text-body-2 text-medium-emphasis">
            ¿En qué tarjeta va este sello?
          </div>
        </div>

        <CounterCardPicker
          v-model="cardId"
          :cards="props.cards"
          :time-zone="props.timeZone"
          class="mb-5"
        />

        <div class="d-flex gap-2">
          <VBtn
            variant="tonal"
            color="secondary"
            rounded="xl"
            class="flex-1-1"
            @click="cancel"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            rounded="xl"
            class="flex-1-1"
            prepend-icon="tabler-rosette-discount-check"
            :disabled="!isStampable(cardId)"
            @click="confirm"
          >
            Sellar
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
