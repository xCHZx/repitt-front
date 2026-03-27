<script setup lang="ts">
interface Props {
  name?: string | null
  description?: string | null
  categoryName?: string | null
  logoSrc?: string | null
}

const props = defineProps<Props>()

const initial = computed(() => String(props.name || 'R').charAt(0).toUpperCase())
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-5 d-flex align-center gap-4">
      <VAvatar
        rounded="lg"
        size="64"
        color="primary"
        variant="tonal"
      >
        <VImg
          v-if="logoSrc"
          :src="logoSrc"
          cover
        />
        <span
          v-else
          class="text-h4 font-weight-bold"
        >{{ initial }}</span>
      </VAvatar>
      <div class="flex-grow-1 overflow-hidden">
        <div class="text-h6 font-weight-bold text-truncate">
          {{ name || 'Nombre del negocio' }}
        </div>
        <VChip
          v-if="categoryName"
          size="x-small"
          color="primary"
          variant="tonal"
          class="mt-1"
        >
          {{ categoryName }}
        </VChip>
        <div
          v-if="description"
          class="text-caption text-medium-emphasis mt-1 text-truncate"
        >
          {{ description }}
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
