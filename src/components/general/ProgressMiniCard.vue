<script lang="ts" setup>
interface Props {
  title: string
  mainNumber: number
  growth?: number
  icon: string
  color: string
}

const props = defineProps<Props>()
</script>

<template>
  <VCard class="logistics-card-statistics cursor-pointer">
    <VCardText class="py-3">
      <div class="d-flex align-center gap-x-4 mb-1 ">
        <VAvatar
          variant="tonal"
          :color="props.color"
          size="80"
          rounded
        >
          <VIcon
            :icon="props.icon"
            size="50"
          />
        </VAvatar>
        <div
          class="text-right"
          style="flex-grow: 1;"
        >
          <div class="font-weight-medium text-h5 mb-n3 pt-3 text-primary">
            {{ props.title }}
          </div>
          <div class="font-weight-bold text-h2">
            {{ props.mainNumber }}
          </div>
        </div>
      </div>
    </VCardText>
    <VDivider />
    <VCardText
      v-if="props.growth !== undefined"
      class="py-2"
    >
      <div class="d-flex gap-x-2 align-center">
        <div class="text-h4 font-weight-bold text-success">
          {{ (props.growth >= 0) ? '+' : '' }} {{ props.growth }}%
        </div>
        <div class="text-h5 text-disabled">
          este periodo
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
