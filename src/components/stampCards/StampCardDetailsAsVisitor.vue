<script setup lang="ts">
interface Props {
  businessName: string
  reward: string
  requiredStamps: number
  visitsCount: number
  image: string
  startDate: string
  endDate: string
  visits: any[]
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
          src="https://i.pinimg.com/originals/aa/92/89/aa9289de1ed2865bccd7c7457f246482.jpg"
          class="text-5xl font-weight-medium"
        />
      </VAvatar>

      <!-- 👉 Customer fullName -->
      <h5 class="text-h4 mt-3 text-weight font-weight-bold">
        {{ props.businessName || '...' }}
      </h5>
      <h5 class="text-h5 mt-4">
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
              <div v-if="stamp <= props.visitsCount">
                <VImg
                  src="https://i.pinimg.com/originals/aa/92/89/aa9289de1ed2865bccd7c7457f246482.jpg"
                  class="text-5xl font-weight-medium"
                  style="margin-top: 5px; margin-left: 3px;"
                />
              </div>
            </VAvatar>
          </div>
        </div>
      </div>
    </VCardText>

    <VCardText class="text-center pt-12">
      <h5 class="text-h5 mt-3">
        {{ props.visitsCount || '...' }} / {{ props.requiredStamps || '...' }}
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
              {{ props.startDate || '...' }} - {{ props.endDate || '...' }}
            </span>
          </h6>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
