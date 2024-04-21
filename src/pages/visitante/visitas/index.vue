<script lang="ts" setup>
import { getAllByCurrentVisitor } from '@/services/visitor/visits'

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getAllByCurrentVisitor()
  }
  catch (error) {
    console.error('Error getting data:', error)
  }
}

onMounted(() => {
  getData()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCardText class="text-center text-h3 font-weight-bold">
        Historial de Visitas
      </VCardText>
      <!-- 👉 Visitas  -->
      <div v-if="data?.visits_count >= 1">
        <VRow>
          <VCol cols="12">
            <VCardText class="text-center pt-2">
              <h5 class="text-h5">
                Total de Visitas: {{ data?.visits_count }}
              </h5>
            </VCardText>
            <VisitListItemFull :visits="data?.visits" />
          </VCol>
        </VRow>
      </div>
      <!-- Fin de Visitas  -->
    </VCol>
  </VRow>
</template>
