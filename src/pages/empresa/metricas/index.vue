<script lang="ts" setup>
import { getGlobalMetrics } from '@/services/company/metrics'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const companyStore = useCompanyStore()
const timePeriod = ref('month')
const isLoading = ref(false)
const error = ref<string | null>(null)

const timePeriodOptions = [
  { title: 'Día', value: 'day' },
  { title: 'Semana', value: 'week' },
  { title: 'Mes', value: 'month' },
  { title: 'Año', value: 'year' },
]

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const metrics = ref({
  activeUsers: 0,
  completedStampCards: { current: 0, previous: 0, growth: null as number | null },
  redeemedRewards: { current: 0, previous: 0, growth: null as number | null },
  visits: { current: 0, previous: 0, growth: null as number | null },
  topClients: [] as { userId: number; firstName: string; lastName: string; repittCode: string; visitsCount: number }[],
  visitsByMonth: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, visitsCount: 0 })),
})

const statCards = computed(() => [
  {
    title: 'Visitas',
    value: metrics.value.visits.current,
    growth: metrics.value.visits.growth,
    icon: 'tabler-walk',
    color: 'primary',
  },
  {
    title: 'Tarjetas completadas',
    value: metrics.value.completedStampCards.current,
    growth: metrics.value.completedStampCards.growth,
    icon: 'tabler-cards',
    color: 'info',
  },
  {
    title: 'Recompensas canjeadas',
    value: metrics.value.redeemedRewards.current,
    growth: metrics.value.redeemedRewards.growth,
    icon: 'tabler-gift',
    color: 'success',
  },
  {
    title: 'Clientes activos',
    value: metrics.value.activeUsers,
    growth: null,
    icon: 'tabler-users-group',
    color: 'warning',
  },
])

// Chart
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const series = computed(() => [
  {
    name: 'Visitas',
    data: metrics.value.visitsByMonth.map(item => item.visitsCount),
  },
])

const maxVisits = computed(() =>
  Math.max(...metrics.value.visitsByMonth.map(i => i.visitsCount), 1),
)

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    zoom: { enabled: false },
    parentHeightOffset: 0,
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: true,
    offsetY: -18,
    style: {
      fontSize: '11px',
      colors: [labelColor],
    },
  },
  colors: ['#6C3CE1'],
  grid: {
    strokeDashArray: 6,
    borderColor,
  },
  xaxis: {
    categories: metrics.value.visitsByMonth.map(i => monthNames[i.month - 1]),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: labelColor, fontSize: '12px' },
    },
  },
  yaxis: {
    tickAmount: 4,
    min: 0,
    max: maxVisits.value + Math.ceil(maxVisits.value * 0.2) + 1,
    labels: {
      style: { colors: labelColor, fontSize: '12px' },
    },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { height: 200 },
        plotOptions: { bar: { columnWidth: '60%' } },
      },
    },
  ],
}))

// Top clients rank colors
const rankColor = (index: number) => {
  if (index === 0) return 'warning'
  if (index === 1) return 'secondary'
  if (index === 2) return 'error'
  return 'default'
}

const getData = async () => {
  if (!companyStore.selectedCompany?.id)
    return
  isLoading.value = true
  error.value = null
  try {
    metrics.value = await getGlobalMetrics(companyStore.selectedCompany.id, timePeriod.value)
  }
  catch (e: any) {
    error.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isLoading.value = false
  }
}

watch(timePeriod, () => getData())
onMounted(() => { getData() })
</script>

<template>
  <!-- Inactive -->
  <VAlert
    v-if="!companyStore.selectedCompany?.isActive"
    color="error"
    variant="tonal"
    rounded="xl"
    icon="tabler-lock"
    class="mb-4"
  >
    Las métricas no están disponibles mientras tu negocio esté <strong>inactivo</strong>.
  </VAlert>

  <template v-else>
    <!-- Header: label + period toggle -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="section-label">
        <VIcon
          icon="tabler-chart-bar"
          size="13"
          color="primary"
        />
        Resumen
      </div>
      <VBtnToggle
        v-model="timePeriod"
        mandatory
        variant="outlined"
        color="primary"
        density="compact"
        rounded="xl"
      >
        <VBtn
          v-for="opt in timePeriodOptions"
          :key="opt.value"
          :value="opt.value"
          size="small"
        >
          {{ opt.title }}
        </VBtn>
      </VBtnToggle>
    </div>

    <!-- Error -->
    <VAlert
      v-if="error"
      color="error"
      variant="tonal"
      rounded="lg"
      density="compact"
      icon="tabler-alert-triangle"
      class="mb-4"
    >
      {{ error }}
    </VAlert>

    <!-- Skeleton -->
    <template v-if="isLoading">
      <div class="stats-grid mb-4">
        <VSkeletonLoader
          v-for="n in 4"
          :key="n"
          type="card"
          rounded="xl"
        />
      </div>
      <VSkeletonLoader
        type="card"
        rounded="xl"
        class="mb-4"
      />
      <VSkeletonLoader
        type="list-item-avatar-three-line, list-item-avatar-three-line, list-item-avatar-three-line"
        rounded="xl"
      />
    </template>

    <template v-else>
      <!-- KPI cards 2x2 -->
      <div class="stats-grid mb-4">
        <VCard
          v-for="card in statCards"
          :key="card.title"
          rounded="xl"
        >
          <VCardText class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <VAvatar
                rounded="lg"
                size="36"
                :color="card.color"
                variant="tonal"
              >
                <VIcon
                  :icon="card.icon"
                  size="20"
                />
              </VAvatar>
              <VChip
                v-if="card.growth !== null"
                :color="card.growth >= 0 ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
              >
                {{ card.growth >= 0 ? '+' : '' }}{{ card.growth }}%
              </VChip>
            </div>
            <div class="text-h4 font-weight-bold mb-1">
              {{ card.value }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ card.title }}
            </div>
          </VCardText>
        </VCard>
      </div>

      <!-- Chart -->
      <VCard
        rounded="xl"
        class="mb-4"
      >
        <VCardText class="pa-4 pb-0">
          <div class="section-label mb-1">
            <VIcon
              icon="tabler-chart-bar"
              size="13"
              color="primary"
            />
            Visitas por mes
          </div>
          <div class="text-caption text-medium-emphasis">
            Sellos registrados en el año actual
          </div>
        </VCardText>
        <VCardText class="pa-2 pt-0">
          <VueApexCharts
            type="bar"
            height="240"
            :options="chartOptions"
            :series="series"
          />
        </VCardText>
      </VCard>

      <!-- Top clients -->
      <VCard rounded="xl">
        <VCardText class="pa-4 pb-2">
          <div class="section-label">
            <VIcon
              icon="tabler-crown"
              size="13"
              color="primary"
            />
            Clientes más frecuentes
          </div>
        </VCardText>

        <VList v-if="metrics.topClients.length">
          <template
            v-for="(client, index) in metrics.topClients"
            :key="client.userId"
          >
            <VListItem class="px-4 py-2">
              <template #prepend>
                <div
                  class="rank-num text-caption font-weight-bold me-3"
                  :style="{ color: `rgb(var(--v-theme-${rankColor(index)}))` }"
                >
                  #{{ index + 1 }}
                </div>
                <VAvatar
                  rounded="lg"
                  size="36"
                  color="primary"
                  variant="tonal"
                >
                  <span class="text-caption font-weight-bold">
                    {{ client.firstName?.charAt(0).toUpperCase() }}
                  </span>
                </VAvatar>
              </template>

              <VListItemTitle class="text-body-2 font-weight-bold">
                {{ client.firstName }} {{ client.lastName }}
              </VListItemTitle>
              <VListItemSubtitle class="text-caption">
                {{ client.repittCode }}
              </VListItemSubtitle>

              <template #append>
                <VChip
                  :color="rankColor(index)"
                  size="x-small"
                  variant="tonal"
                >
                  {{ client.visitsCount }} visitas
                </VChip>
              </template>
            </VListItem>
            <VDivider v-if="index < metrics.topClients.length - 1" />
          </template>
        </VList>

        <VCardText
          v-else
          class="text-center text-medium-emphasis py-8"
        >
          <VIcon
            icon="tabler-users-group"
            size="36"
            class="mb-2 d-block mx-auto"
            style="opacity: 0.3;"
          />
          Sin datos para este período
        </VCardText>
      </VCard>
    </template>
  </template>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 600;
  gap: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rank-num {
  inline-size: 24px;
  text-align: center;
}
</style>
