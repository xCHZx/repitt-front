<script setup lang="ts">
interface Props {
  visits: any[]
}

const props = defineProps<Props>()

const formatDate = (date: string, options: any) => {
  return new Date(date).toLocaleDateString('es-ES', options)
}
</script>

<template>
  <div
    v-for="visit in props.visits"
    :key="visit.id"
  >
    <VCard
      flat
      class="mt-3"
    >
      <VCardText>
        <div class="d-flex align-center ma-n3">
          <div>
            <h5 class="text-h5">
              <VAvatar
                size="x-small"
                color="primary"
                variant="tonal"
              >
                <VImg
                  :src="visit?.stamp_card?.business?.logo_path"
                  class="text-5xl font-weight-medium"
                />
              </VAvatar>
              {{ visit?.stamp_card?.business?.name }}
            </h5>
            <h6 class="text-h6">
              {{ visit?.stamp_card?.name }}
            </h6>
            <h5 class="text-h5">
              <VIcon
                size="small"
                icon="tabler-calendar"
                color="primary"
                class="mb-1"
              />
              {{ formatDate(visit?.created_at) }}
            </h5>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
