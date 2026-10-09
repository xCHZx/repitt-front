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
</script>

<template>
  <VListItem
    class="px-4 py-2"
    :to="props.to"
  >
    <template #prepend>
      <div class="rank-num text-caption font-weight-bold text-medium-emphasis me-3">
        #{{ props.rank }}
      </div>
      <VAvatar
        size="36"
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
      <VChip size="x-small">
        {{ props.count }} {{ props.countLabel }}
      </VChip>
    </template>
  </VListItem>
</template>

<style scoped>
.rank-num {
  font-variant-numeric: tabular-nums;
  inline-size: 24px;
  text-align: center;
}
</style>
