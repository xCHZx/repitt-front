<script setup lang="ts">
interface Props {
  businessName?: string
  segment?: string
  description?: string
  image?: string
  isActive?: number
}

const props = defineProps<Props>()
</script>

<template>
  <VCard height="100">
    <VRow no-gutters>
      <VCol cols="3">
        <div class="ma-auto pa-3">
          <VImg
            height="80"
            :src="props.image"
            class="vertical-align-middle"
          />
        </div>
      </VCol>
      <VCol cols="9">
        <VCardItem class="px-3 pt-3 pb-0">
          <VCardTitle class="font-weight-bold text-h5">
            {{ props.businessName }}
          </VCardTitle>
        </VCardItem>
        <VCardText class="text-subtitle-2 px-3 pb-1">
          <span
            class="font-weight-medium text-white rounded pa-1 text-xs"
            style="background-color: #493599;"
          >
            {{ props.segment }}
          </span>
          <div
            v-if="props.isActive"
            class="mt-1"
          >
            <span
              class="font-weight-medium text-white rounded pa-1 text-xs"
              style="background: rgb(var(--v-theme-success)) !important;"
            >
              ACTIVO
            </span>
          </div>
          <div
            v-else
            class="mt-1"
          >
            <span
              class="font-weight-medium text-white rounded pa-1 text-xs"
              style="background: rgb(var(--v-theme-error)) !important;"
            >
              INACTIVO
            </span>
          </div>
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>
