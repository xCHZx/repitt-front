<script setup lang="ts">
interface Props {
  businessName: string
  segment: string
  reward: string
  visitsCount: number
  requiredStamps: number
  image: string
  isCompleted?: number
  isRedeemed?: number
}

const props = defineProps<Props>()
</script>

<template>
  <VCard
    height="100"
    :class="{ glow: props.isCompleted === 1 && props.isRedeemed === 0 }"
  >
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
      <VCol cols="7">
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
            {{ props.reward }}
          </span>
        </VCardTitle>
      </VCol>
      <VCol
        cols="2"
        style="background-color: #493599;"
      >
        <div class="d-flex flex-column align-center py-10 h-200 justify-center">
          <p class="mb-8">
            <sup class="text-h4 font-weight-medium text-white">
              {{ props.visitsCount }}/{{ props.requiredStamps }}
            </sup>
          </p>
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>

<style scoped>
.glow {
  /* -webkit-box-shadow:0px 0px 105px 45px rgba(45, 255, 150, 0.5);
-moz-box-shadow: 0px 0px 105px 45px rgba(45, 255, 150, 0.5); */
box-shadow: 0px 0px 20px 10px rgba(45, 255, 150, 0.5);
}
</style>
