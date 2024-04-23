<script setup lang="ts">
interface Props {
  name?: string
  description?: string
  address?: string
  phone?: string
  segment?: string
  openingHours?: string
  logoPath?: string
  createdAt?: string
}

const props = defineProps<Props>()
</script>

<template>
  <VCard>
    <VCardText class="text-center pt-10">
      <!-- 👉 Avatar -->
      <VAvatar
        rounded
        :size="120"
        color="white"
        variant="tonal"
      >
        <VImg
          :src="props.logoPath"
          class="text-5xl font-weight-medium"
        />
      </VAvatar>

      <!-- 👉 Customer fullName -->
      <h5 class="text-h4 mt-3  text-weight font-weight-bold">
        {{ props.name }}
      </h5>

      <span
        class="font-weight-medium text-white rounded pa-1 text-xs mt-5"
        style="background-color: #493599;"
      >
        {{ props.segment }}
      </span>

      <h5 class="text-h5 mt-3 text-weight font-weight-bold">
        {{ props.description }}
      </h5>
      <h5 class="text-h5 mt-4">
        <VIcon
          start
          icon="tabler-map-pin"
          size="small"
          color="primary"
        />
        {{ props.address }}
      </h5>
      <h5 class="text-h5 mt-4">
        <VIcon
          start
          icon="tabler-phone"
          size="small"
          color="primary"
        />
        {{ props.phone }}
      </h5>
      <h5 class="text-h5 mt-4">
        <VIcon
          start
          icon="tabler-clock"
          size="small"
          color="primary"
        />
        {{ props.openingHours || 'No disponible' }}
      </h5>
    </VCardText>
  </VCard>
</template>
