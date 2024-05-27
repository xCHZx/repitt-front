<script lang="ts" setup>
interface Props {
  title?: string
  description?: string
  icon?: string
  url?: string
  accentColor?: string
  textAccentColor?: string
  isActive?: number
}

const props = defineProps<Props>()
</script>

<template>
  <VCard height="100">
    <VRow no-gutters>
      <VCol
        cols="2"
        :style="{ backgroundColor: props.accentColor || '#493599' }"
      >
        <div class="d-flex flex-column align-center py-8 h-200 justify-center">
          <VIcon

            :style="{ color: props.textAccentColor || '#fff' }"
            size="40"
            :icon="props.icon"
          />
        </div>
      </VCol>
      <VCol cols="10">
        <div class="align-center">
          <VCardItem class="px-3 pt-4 pb-0">
            <VCardTitle class="font-weight-bold text-h3">
              {{ props.title || '...' }}
            </VCardTitle>
          </VCardItem>
          <VCardTitle class="text-h5 px-3 pt-0">
            <span class="font-weight-medium ">
              {{ props.description || '...' }}
            </span>
            <div
              v-if="props.isActive"
              class="mt-n1"
            >
              <span
                class="font-weight-medium text-white rounded pa-1 text-xs"
                style="background: rgb(var(--v-theme-success)) !important;"
              >
                ACTIVA
              </span>
            </div>
            <div
              v-else
              class="mt-n1"
            >
              <span
                class="font-weight-medium text-white rounded pa-1 text-xs"
                style="background: rgb(var(--v-theme-error)) !important;"
              >
                INACTIVA
              </span>
            </div>
          </VCardTitle>
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>
