<script setup lang="ts">
interface Props {
  rank: number
  displayName: string
  subtitle?: string
  count: number
  countLabel: string
  to?: string
}

const props = defineProps<Props>()

const rankColor = computed(() => {
  if (props.rank === 1)
    return 'warning'
  if (props.rank === 2)
    return 'secondary'
  if (props.rank === 3)
    return 'error'

  return 'default'
})
</script>

<template>
  <VListItem
    class="px-4 py-2"
    :to="props.to"
  >
    <template #prepend>
      <div
        class="rank-num text-caption font-weight-bold me-3"
        :class="rankColor === 'default' ? 'text-medium-emphasis' : `text-${rankColor}`"
      >
        #{{ props.rank }}
      </div>
      <VAvatar
        rounded="lg"
        size="36"
        color="primary"
        variant="tonal"
      >
        <span class="text-caption font-weight-bold">
          {{ props.displayName.charAt(0).toUpperCase() || '?' }}
        </span>
      </VAvatar>
    </template>

    <VListItemTitle class="text-body-2 font-weight-bold">
      {{ props.displayName }}
    </VListItemTitle>
    <VListItemSubtitle
      v-if="props.subtitle"
      class="text-caption"
    >
      {{ props.subtitle }}
    </VListItemSubtitle>

    <template #append>
      <VChip
        :color="rankColor"
        size="x-small"
        variant="tonal"
      >
        {{ props.count }} {{ props.countLabel }}
      </VChip>
    </template>
  </VListItem>
</template>

<style scoped>
.rank-num {
  inline-size: 24px;
  text-align: center;
}
</style>
