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
  <VCard rounded="xl">
    <VCardText class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <VAvatar
          rounded="lg"
          size="36"
          :color="props.color"
          variant="tonal"
        >
          <VIcon
            :icon="props.icon"
            size="20"
          />
        </VAvatar>
        <VChip
          v-if="props.growth !== undefined"
          :color="props.growth >= 0 ? 'success' : 'error'"
          size="x-small"
          variant="tonal"
        >
          {{ growthText }}
        </VChip>
      </div>
      <div class="text-h4 font-weight-bold mb-1">
        {{ props.mainNumber }}
      </div>
      <div class="text-caption text-medium-emphasis">
        {{ props.title }}
      </div>
      <div
        v-if="props.caption"
        class="text-caption text-disabled"
      >
        {{ props.caption }}
      </div>
    </VCardText>
  </VCard>
</template>
