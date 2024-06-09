<script lang="ts" setup>
interface Props {
  title?: string
  description?: string
  icon?: string
  url?: string
  accentColor?: string
  textAccentColor?: string
  completedDate?: string
  linkedUser?: string
}

const props = defineProps<Props>()
</script>

<template>
  <VCard height="100">
    <VRow no-gutters>
      <VCol
        cols="2"
        :style="{ backgroundColor: props.accentColor || '#493599' }"
      >
        <div class="d-flex flex-column align-center py-7 h-200 justify-center">
          <VIcon

            :style="{ color: props.textAccentColor || '#fff' }"
            size="40"
            :icon="props.icon"
          />
        </div>
      </VCol>
      <VCol cols="10">
        <div class="align-center">
          <VCardItem class="px-3 pt-2 pb-0">
            <VCardTitle class="font-weight-bold text-h4">
              {{ props.title || '...' }}
            </VCardTitle>
          </VCardItem>
          <VCardTitle class="text-h5 px-3 pt-0">
            <span class="font-weight-medium ">
              {{ props.description || '...' }}
            </span>
            <div class="text-h6">
              <VIcon
                size="small"
                icon="tabler-user"
                color="primary"
                class="mb-1"
              />
              {{ props.linkedUser || '...' }}
              <VIcon
                size="small"
                icon="tabler-calendar"
                color="primary"
                class="mb-1"
              />
              {{ props.completedDate || '...' }}
            </div>
          </VCardTitle>
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>
