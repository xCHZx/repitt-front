<script setup lang="ts">
interface Props {
  businessName: string
  reward: string
  requiredStamps: number
  visitsCount: number
  businessImage: string
  startDate: string
  endDate: string
  stampIcon: string
  stampCardName: string
  description: string | null
}

const props = defineProps<Props>()

const convertDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
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
          :src="props.businessImage"
          class="text-5xl font-weight-medium"
        />
      </VAvatar>

      <!-- 👉 Customer fullName -->
      <h5 class="text-h5 mt-3 text-weight">
        {{ props.businessName || '...' }}
      </h5>
      <h5 class="text-h4 mt-3 text-weight font-weight-bold">
        {{ props.stampCardName || '...' }}
      </h5>
      <h5 class="text-h5 mt-4">
        <VIcon icon="tabler-gift" />
        {{ props.reward || '...' }}
      </h5>

      <div class="d-flex flex-wrap justify-center gap-x-5 mt-5 align">
        <div
          v-for="stamp in props.requiredStamps"
          :key="stamp"
          class="inline-flex justify-center"
        >
          <div class="py-2">
            <VAvatar
              rounded="xl"
              color="primary"
              variant="tonal"
              style="display: inline-block; overflow: visible;"
            >
              <VImg
                :src="props.stampIcon"
                class="text-5xl font-weight-medium"
                style="margin-top: 5px; margin-left: 3px; background-color: white;"
              />
            </VAvatar>
          </div>
        </div>
      </div>
    </VCardText>

    <VCardText class="text-center pt-12">
      <h5 class="text-h5 mt-3">
        Descripción: {{ props.description || 'No disponible' }}
      </h5>
    </VCardText>
    <VCardText class="text-center pt-12">
      <h5 class="text-h5 mt-3">
        <VIcon
          color="primary"
          icon="tabler-walk"
        />
        Visitas: {{ props.visitsCount || 'No disponible' }}
      </h5>
    </VCardText>

    <!-- 👉 Customer Details -->
    <VCardText>
      <VDivider class="my-3" />

      <VList class="card-list mt-2">
        <VListItem>
          <h6 class="text-h6">
            Vigencia:
            <span class="text-body-1 d-inline-block">
              {{ convertDate(props.startDate) || '...' }} - {{ convertDate(props.endDate) || '...' }}
            </span>
          </h6>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
