<script setup lang="ts">
interface Props {
  visits: any[]
}

const props = defineProps<Props>()
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
        <div class="d-flex align-center">
          <div>
            <h6 class="text-h6">
              Visitaste este negocio el:
            </h6>
            <h5 class="text-h5">
              <VIcon
                size="small"
                icon="tabler-calendar"
                color="primary"
              />
              {{ visit?.created_at }}
            </h5>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
