<script lang="ts" setup>
interface Props {
  firstName?: string
  lastName?: string
  qrPath?: string
  repittCode?: string
}

const props = defineProps<Props>()
</script>

<template>
  <VCard>
    <VCardTitle class="text-center py-5">
      <h2>
        {{ props?.firstName }} {{ props?.lastName }}
      </h2>
      <div class="pt-5">
        <VAlert
          color="primary"
          icon="tabler-eye"
          variant="tonal"
          density="compact"
          style="white-space: normal;"
          class="pb-0 text-left"
        >
          <p class="text-h6">
            Proporciona este código al negocio para que puedan registrar tu visita.
          </p>
        </VAlert>
      </div>
    </VCardTitle>
    <VCardText class="text-center">
      <VAvatar
        rounded
        size="300"
        color="white"
      >
        <VImg
          width="300"
          :src="props?.qrPath"
        />
      </VAvatar>
    </VCardText>
    <VCardText class="text-center mt-0">
      <h4>
        Código Repitt
      </h4>
      <div class="d-flex flex-wrap justify-center gap-x-5 mb-2 align">
        <VChip
          color="primary"
          size="large"
        >
          <VIcon
            start
            icon="tabler-barcode"
          />
          <h1>{{ props?.repittCode }}</h1>
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>
