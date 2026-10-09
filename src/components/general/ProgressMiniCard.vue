<script lang="ts" setup>
interface Props {
  title: string
  mainNumber: number | string

  /** Percentage (already ×100); undefined hides the chip. */
  growth?: number
  icon: string
  color: string

  /** Small text under the title (e.g. the previous period value). */
  caption?: string
}

const props = defineProps<Props>()

const growthText = computed(() => {
  if (props.growth === undefined)
    return ''
  const value = Math.round(props.growth * 10) / 10

  return `${value >= 0 ? '+' : ''}${value.toLocaleString('es-MX')}%`
})
</script>

<template>
  <VCard>
    <VCardText class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <VAvatar
          size="36"
          :color="props.color"
          variant="tonal"
        >
          <VIcon
            :icon="props.icon"
            size="20"
          />
        </VAvatar>
        <!-- Neutral chip (guide §15): the sign in the text says whether it went up or down -->
        <VChip
          v-if="props.growth !== undefined"
          size="x-small"
        >
          {{ growthText }}
        </VChip>
      </div>
      <div class="cifra text-h4 mb-1">
        {{ props.mainNumber }}
      </div>
      <div class="text-caption text-medium-emphasis">
        {{ props.title }}
      </div>
      <div
        v-if="props.caption"
        class="text-caption text-medium-emphasis"
      >
        {{ props.caption }}
      </div>
    </VCardText>
  </VCard>
</template>
