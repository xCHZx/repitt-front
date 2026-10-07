<!--
  Card status and its transitions (guide §4.A.5):
  draft → publish · published → pause · paused → resume · any non-archived → archive (terminal).
-->
<script setup lang="ts">
import CardStatusChip from './CardStatusChip.vue'
import type { CardAction } from './cardMeta'
import type { StampCard } from '@/api/types'

const props = defineProps<{
  card: StampCard
  busy: CardAction | null

  /** False when the entitlement doesn't allow publishing (the paywall is shown by the page). */
  canPublish: boolean
}>()

const emit = defineEmits<{
  (e: 'action', action: CardAction): void
}>()

const confirmArchive = ref(false)

const STATUS_TEXT = {
  draft: 'Tus clientes aún no la ven. Publícala cuando esté lista.',
  published: 'Tus clientes la ven y puedes registrar sellos.',
  paused: 'No se pueden registrar sellos nuevos. Lo ganado se sigue canjeando.',
  archived: 'Ya no se usa. Tus clientes aún pueden canjear las recompensas que ganaron.',
} as const

const primary = computed(() => {
  const { status, isExpired } = props.card
  if (status === 'draft')
    return { action: 'publish' as const, label: 'Publicar', icon: 'tabler-rocket', color: 'success', disabled: !props.canPublish || isExpired }
  if (status === 'published')
    return { action: 'pause' as const, label: 'Pausar', icon: 'tabler-player-pause', color: 'warning', disabled: false }
  if (status === 'paused')
    return { action: 'resume' as const, label: 'Reanudar', icon: 'tabler-player-play', color: 'success', disabled: isExpired }

  return null
})

function archive() {
  confirmArchive.value = false
  emit('action', 'archive')
}
</script>

<template>
  <VCard
    rounded="xl"
    class="mb-4"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center justify-space-between gap-2 mb-2">
        <span class="text-body-2 font-weight-bold">Estado</span>
        <CardStatusChip
          :status="props.card.status"
          :is-expired="props.card.isExpired"
          size="small"
        />
      </div>
      <div class="text-body-2 text-medium-emphasis">
        {{ STATUS_TEXT[props.card.status] }}
      </div>

      <div
        v-if="props.card.status !== 'archived'"
        class="d-flex flex-wrap gap-2 mt-4"
      >
        <VBtn
          v-if="primary"
          :color="primary.color"
          rounded="xl"
          :prepend-icon="primary.icon"
          :loading="props.busy === primary.action"
          :disabled="primary.disabled || (!!props.busy && props.busy !== primary.action)"
          class="flex-grow-1"
          @click="emit('action', primary.action)"
        >
          {{ primary.label }}
        </VBtn>
        <VBtn
          variant="tonal"
          color="secondary"
          rounded="xl"
          prepend-icon="tabler-archive"
          :loading="props.busy === 'archive'"
          :disabled="!!props.busy && props.busy !== 'archive'"
          class="flex-grow-1"
          @click="confirmArchive = true"
        >
          Archivar
        </VBtn>
      </div>
    </VCardText>
  </VCard>

  <VDialog
    v-model="confirmArchive"
    max-width="420"
  >
    <VCard rounded="xl">
      <VCardItem>
        <VCardTitle>¿Archivar «{{ props.card.name }}»?</VCardTitle>
      </VCardItem>
      <VCardText>
        Archivar es definitivo: la tarjeta no se puede volver a publicar ni registrar sellos nuevos.
        Tus clientes sí podrán canjear las recompensas que ya ganaron.
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn
          variant="text"
          @click="confirmArchive = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="error"
          variant="flat"
          @click="archive"
        >
          Archivar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
