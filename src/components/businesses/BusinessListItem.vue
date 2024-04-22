<script setup lang="ts">
interface Props {
  businessName?: string
  segment?: string
  description?: string
  image?: string
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
        </VCardText>

        <VCardTitle class="text-h6 px-3 pt-1">
          <span class="font-weight-medium ">
            {{ props.description }}
          </span>
        </VCardTitle>
      </VCol>
    </VRow>
  </VCard>
</template>
