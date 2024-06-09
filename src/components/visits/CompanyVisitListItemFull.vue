<script setup lang="ts">
interface Props {
  visits: any[]
  businessLogo: string
  businessName: string
}
const props = defineProps<Props>()
const router = useRouter()

const formatDate = (date: string, options: any) => {
  return new Date(date).toLocaleDateString('es-ES', options)
}

const goToUserStampCard = (stampCardId: string, userStampCardId: string) => {
  // console.log('goToUserStampCard', stampCardId, userStampCardId)
  router.push(`/empresa/tarjetas/${stampCardId}/tarjetas-de-usuario/${userStampCardId}`)
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
      @click="goToUserStampCard(visit?.visitable_id, visit?.user_stamp_card_id)"
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
                  :src="props.businessLogo"
                  class="text-5xl font-weight-medium"
                />
              </VAvatar>
              {{ props.businessName }}
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
              <VIcon
                size="small"
                icon="tabler-user"
                color="primary"
                class="mb-1"
              />
              {{ visit?.user?.first_name }} {{ visit?.user?.last_name }}
            </h5>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
