<script lang="ts" setup>
interface Props {
  name?: string | null
  reward?: string | null
  requiredStamps?: number | null
  stampIcon?: string | null
  primaryColor?: string | null
  isActive?: boolean
  to?: string
}

const props = defineProps<Props>()

const accentColor = computed(() => props.primaryColor || '#6C3CE1')
</script>

<template>
  <VCard
    :to="to"
    rounded="xl"
    :style="{
      borderInlineStart: `4px solid ${accentColor}`,
      background: 'rgb(var(--v-theme-surface))',
    }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
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
            icon="tabler-cards"
            size="22"
            :style="{ color: accentColor }"
          />
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-body-1 font-weight-bold text-truncate">
            {{ name ?? 'Sin nombre' }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1 d-flex align-center gap-1">
            <VIcon
              icon="tabler-gift"
              size="13"
            />
            {{ reward || 'Sin recompensa' }}
          </div>
        </div>

        <div class="d-flex flex-column align-end gap-2">
          <VChip
            :color="isActive ? 'success' : 'default'"
            size="x-small"
            variant="tonal"
          >
            {{ isActive ? 'Activa' : 'Inactiva' }}
          </VChip>
          <span
            class="text-caption text-medium-emphasis"
            style="white-space: nowrap;"
          >
            {{ requiredStamps ?? '?' }} sellos requeridos
          </span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
