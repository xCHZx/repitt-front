<script lang="ts" setup>
import Swal from 'sweetalert2'
import { getAllVisitsAsCurrentVisitor } from '@/services/visitor/visits'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getAllVisitsAsCurrentVisitor()
  }
  catch (error: any) {
    console.error('Error getting data:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.join('\n'),
    })
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
      <div v-else>
        <VCardText class="text-center pt-2">
          <h5 class="text-h5">
            No hay visitas para mostrar
          </h5>
        </VCardText>

        <!-- Fin de Visitas  -->
      </div>
    </VCol>
  </VRow>
</template>
