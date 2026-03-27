<script lang="ts" setup>
interface Props {
  reward?: string | null
  stampCardName?: string | null
  customerName?: string | null
  completedDate?: string | null
  primaryColor?: string | null
  stampIcon?: string | null
}

const props = defineProps<Props>()

const accentColor = computed(() => props.primaryColor || '#6C3CE1')

const formatDate = (date?: string | null) => {
  if (!date)
    return '—'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
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
        <!-- Icon -->
        <VAvatar
          rounded="lg"
          size="44"
          :style="{ background: `${accentColor}20` }"
        >
          <VImg
            v-if="stampIcon"
            :src="stampIcon"
          />
          <VIcon
            v-else
            icon="tabler-gift"
            size="22"
            :style="{ color: accentColor }"
          />
        </VAvatar>

        <!-- Info -->
        <div class="flex-grow-1 overflow-hidden">
          <div
            class="text-body-1 font-weight-bold text-truncate"
            :style="{ color: accentColor }"
          >
            {{ reward || 'Sin recompensa definida' }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate mt-1">
            {{ stampCardName || '—' }}
          </div>
          <div class="d-flex align-center gap-3 mt-1">
            <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
              <VIcon
                icon="tabler-user"
                size="13"
              />
              {{ customerName || '—' }}
            </div>
            <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
              <VIcon
                icon="tabler-calendar"
                size="13"
              />
              {{ formatDate(completedDate) }}
            </div>
          </div>
        </div>

        <!-- Badge -->
        <VChip
          size="small"
          variant="flat"
          color="success"
          prepend-icon="tabler-gift"
          class="font-weight-bold flex-shrink-0"
        >
          Canjear
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>
