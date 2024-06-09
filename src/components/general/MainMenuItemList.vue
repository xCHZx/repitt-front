<script lang="ts" setup>
interface Props {
  title?: string
  description?: string
  icon?: string
  url?: string
  accentColor?: string
  textAccentColor?: string
}

const props = defineProps<Props>()
</script>

<template>
  <VCard height="70">
    <VRow no-gutters>
      <VCol
        cols="2"
        :style="{ backgroundColor: props.accentColor || '#493599' }"
      >
        <div class="d-flex flex-column align-center py-5 h-200 justify-center">
          <VIcon

            :style="{ color: props.textAccentColor || '#fff' }"
            size="40"
            :icon="props.icon"
          />
        </div>
      </VCol>
      <VCol cols="10">
        <div class="align-center">
          <VCardItem class="px-3 pt-2 pb-0">
            <VCardTitle class="font-weight-bold text-h4">
              {{ props.title || '...' }}
            </VCardTitle>
          </VCardItem>
          <VCardTitle class="text-h6 px-3 pt-0 pb-0">
            <span class="font-weight-medium ">
              {{ props.description || '...' }}
            </span>
          </VCardTitle>
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>
