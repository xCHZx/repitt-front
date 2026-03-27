<script setup lang="ts">
interface Props {
  icon: string
  label: string
  caption?: string
  to: string
  iconSize?: number
}

withDefaults(defineProps<Props>(), {
  iconSize: 32,
})
</script>

<template>
  <VCard rounded="xl" :to="to">
    <VCardText class="text-center pa-4">
      <VIcon
        :icon="icon"
        :size="iconSize"
        color="primary"
        class="mb-2"
      />
      <div class="text-body-2 font-weight-semibold">
        {{ label }}
      </div>
      <div
        v-if="caption"
        class="text-caption text-medium-emphasis"
      >
        {{ caption }}
      </div>
    </VCardText>
  </VCard>
</template>
