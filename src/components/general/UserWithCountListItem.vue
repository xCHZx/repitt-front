<script setup lang="ts">
interface Props {
  firstName?: string
  lastName?: string
  visits?: number
  lastVisit?: string
  icon?: string

}

const props = defineProps<Props>()
</script>

<template>
  <VCard height="100">
    <VRow
      no-gutters
      class="mb-0 pb-0"
    >
      <VCol cols="3">
        <div class="ma-auto pa-3">
          <VAvatar
            variant="tonal"
            size="50"
            color="primary"
            class="vertical-align-middle"
          >
            <!--
              <VImg
              height="80"
              :src="props.image"
              class="vertical-align-middle"
              />
            -->
            <VIcon
              :icon="props.icon"
              size="30"
            />
          </VAvatar>
        </div>
      </VCol>
      <VCol cols="9">
        <VCardItem class="px-3 pt-3 pb-0">
          <VCardTitle class="font-weight-bold text-h5">
            {{ props.firstName }} {{ props.lastName }}
          </VCardTitle>
        </VCardItem>
        <VCardText class="d-flex justify-space-between align-centertext-subtitle-2 px-3 pb-1">
          <span
            class="font-weight-medium text-white rounded pa-1 text-xs"
            style="background-color: #493599;"
          >
            {{ props.visits }} visitas
          </span>
          <!--
            <span class="font-weight-medium ">
            Última Visita: {{ props.lastVisit }}
            </span>
          -->
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>
