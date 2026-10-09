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
  <VCard
    :to="to"
    class="quick-action"
  >
    <VCardText class="pa-4">
      <VIcon
        :icon="icon"
        :size="iconSize"
        class="quick-action__icon mb-2"
      />
      <div class="text-body-2 font-weight-bold">
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

<style lang="scss" scoped>
// Hover: solo cambia el color del borde (sin velo ni elevación)
.quick-action {
  transition: border-color 160ms var(--ease-out);

  &:hover {
    border-color: var(--enlace);
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.v-card__overlay) {
    display: none;
  }
}

.quick-action__icon {
  color: var(--acento);
}
</style>
