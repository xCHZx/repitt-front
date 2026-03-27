<script lang="ts" setup>
import { getAllVisitsAsCurrentVisitor } from '@/services/visitor/visits'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
    layout: 'visitor',
  },
})

const totalVisits = ref(0)
const visits = ref<any[]>([])

const getData = async () => {
  try {
    const response = await getAllVisitsAsCurrentVisitor()

    totalVisits.value = response?.totalVisits ?? 0
    visits.value = response?.visits ?? []
  }
  catch (error: any) {
    console.error('Error getting data:', error)
  }
}

const groupedVisits = computed(() => {
  const groups: Record<string, any[]> = {}

  for (const visit of visits.value) {
    const label = new Date(visit.createdAt).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    })
    if (!groups[label]) groups[label] = []
    groups[label].push(visit)
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }))
})

onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    <!-- Empty state -->
    <div
      v-if="visits.length === 0"
      class="text-center py-12"
    >
      <VIcon
        icon="tabler-walk"
        size="56"
        color="medium-emphasis"
        class="mb-4"
        style="opacity: 0.35;"
      />
      <div class="text-h6 font-weight-bold mb-1">
        Aún no tienes visitas
      </div>
      <div class="text-body-2 text-medium-emphasis">
        Cada vez que visites un negocio aparecerá aquí
      </div>
    </div>

    <template v-else>
      <!-- Stat total -->
      <div class="d-flex align-center gap-2 mb-5">
        <VIcon icon="tabler-walk" size="16" color="primary" />
        <span class="text-body-2 text-medium-emphasis">
          <strong class="text-primary">{{ totalVisits }}</strong> visitas en total
        </span>
      </div>

      <!-- Grupos por mes -->
      <template
        v-for="group in groupedVisits"
        :key="group.label"
      >
        <div class="month-label">
          {{ group.label }}
        </div>

        <div class="d-flex flex-column gap-2 mb-5">
          <VisitListItemFull
            v-for="visit in group.items"
            :key="visit.id"
            :visit="visit"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.month-label {
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-block-end: 10px;
  text-transform: uppercase;
}
</style>
