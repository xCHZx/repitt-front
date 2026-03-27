<script setup lang="ts">
interface Props {
  visits: any[]
  stampCardId?: string | number
}

const props = defineProps<Props>()
const router = useRouter()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const initial = (visit: any) => {
  return String(visit?.customer?.firstName || '?').charAt(0).toUpperCase()
}

const goToUserStampCard = (visit: any) => {
  const scId = props.stampCardId ?? visit?.stampCard?.id
  router.push(`/empresa/tarjetas/${scId}/tarjetas-de-usuario/${visit.userStampCardId}`)
}
</script>

<template>
  <VCard rounded="xl">
    <VList density="compact">
      <template
        v-for="(visit, index) in visits"
        :key="visit.id"
      >
        <VListItem
          class="py-3"
          style="cursor: pointer;"
          @click="goToUserStampCard(visit)"
        >
          <template #prepend>
            <VAvatar
              size="40"
              color="primary"
              variant="tonal"
              class="me-3"
            >
              <span class="text-body-2 font-weight-bold">{{ initial(visit) }}</span>
            </VAvatar>
          </template>

          <VListItemTitle class="text-body-2 font-weight-bold">
            {{ visit?.customer?.firstName }} {{ visit?.customer?.lastName }}
          </VListItemTitle>
          <VListItemSubtitle>
            <span
              v-if="visit?.stampCard?.name"
              class="me-2"
            >{{ visit.stampCard.name }}</span>
            <span class="text-disabled">{{ visit?.customer?.repittCode }}</span>
          </VListItemSubtitle>

          <template #append>
            <div class="d-flex flex-column align-end gap-1">
              <span class="text-caption font-weight-medium">{{ formatDate(visit?.createdAt) }}</span>
              <span class="text-caption text-medium-emphasis">{{ formatTime(visit?.createdAt) }}</span>
            </div>
          </template>
        </VListItem>
        <VDivider v-if="index < visits.length - 1" />
      </template>
    </VList>
  </VCard>
</template>
