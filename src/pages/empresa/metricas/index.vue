<script lang="ts" setup>
import { getMetrics } from '@/api/endpoints/crm'
import type { Metrics, MetricsPeriod } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import MetricsBarChart from '@/components/crm/MetricsBarChart.vue'
import MetricsByCard from '@/components/crm/MetricsByCard.vue'
import MetricsTopCustomers from '@/components/crm/MetricsTopCustomers.vue'
import { bucketLabel, indicatorTiles, rangeLabel } from '@/components/crm/metricsFormat'
import ProgressMiniCard from '@/components/general/ProgressMiniCard.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

// Business metrics (guide §4.A.9): selected period + a second call with period=year for the yearly chart.

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const business = useBusinessStore()

const period = ref<MetricsPeriod>('month')

const periodOptions: { title: string; value: MetricsPeriod }[] = [
  { title: 'Hoy', value: 'day' },
  { title: 'Semana', value: 'week' },
  { title: 'Mes', value: 'month' },
  { title: 'Año', value: 'year' },
]

const SERIES_TITLE: Record<MetricsPeriod, string> = {
  day: 'Sellos por día',
  week: 'Sellos por día',
  month: 'Sellos por semana',
  year: 'Sellos por mes',
}

/** Loads one metrics query, cancelling the previous one (AbortController). */
function useMetricsQuery() {
  const data = ref<Metrics | null>(null)
  const isLoading = ref(false)
  const { error, capture, reset } = useApiError()

  let controller: AbortController | null = null

  async function load(p: MetricsPeriod) {
    const businessId = business.activeId
    if (!businessId)
      return
    controller?.abort()

    const current = new AbortController()

    controller = current
    isLoading.value = true
    reset()
    try {
      const result = await getMetrics(businessId, { period: p }, current.signal)
      if (!current.signal.aborted)
        data.value = result
    }
    catch (e) {
      // A cancelled request surfaces as a network error: ignore it
      if (!current.signal.aborted)
        capture(e)
    }
    finally {
      if (controller === current)
        isLoading.value = false
    }
  }

  const abort = () => controller?.abort()

  return { data, isLoading, error, load, abort }
}

const main = useMetricsQuery()
const yearly = useMetricsQuery()

const metrics = main.data

const tiles = computed(() => (metrics.value ? indicatorTiles(metrics.value.indicators) : []))

const periodSeries = computed(() => {
  const m = metrics.value
  if (!m || m.period === 'year' || m.series.length < 2)
    return null

  return {
    title: SERIES_TITLE[m.period],
    categories: m.series.map(p => bucketLabel(p.bucket, m.period, m.timezone)),
    data: m.series.map(p => p.stamps),
  }
})

const yearSeries = computed(() => {
  const m = yearly.data.value
  if (!m)
    return null

  return {
    categories: m.series.map(p => bucketLabel(p.bucket, 'year', m.timezone)),
    data: m.series.map(p => p.stamps),
  }
})

const loadAll = () => {
  main.load(period.value)
  yearly.load('year')
}

watch(period, value => main.load(value))
watch(() => business.activeId, loadAll)
onMounted(loadAll)
onBeforeUnmount(() => {
  main.abort()
  yearly.abort()
})
</script>

<template>
  <div>
    <!-- Header: label + period toggle -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-1">
      <div class="section-label">
        <VIcon
          icon="tabler-chart-bar"
          size="13"
          color="primary"
        />
        Resumen
      </div>
      <VBtnToggle
        v-model="period"
        mandatory
        variant="outlined"
        color="primary"
        density="compact"
        rounded="xl"
      >
        <VBtn
          v-for="opt in periodOptions"
          :key="opt.value"
          :value="opt.value"
          size="small"
        >
          {{ opt.title }}
        </VBtn>
      </VBtnToggle>
    </div>
    <div class="period-caption text-caption text-medium-emphasis mb-4">
      <template v-if="metrics && !main.error.value">
        {{ rangeLabel(metrics) }} · comparado con el periodo anterior
      </template>
    </div>

    <ApiErrorAlert
      :error="main.error.value"
      class="mb-4"
    >
      <VBtn
        size="small"
        variant="text"
        class="mt-1 px-0"
        @click="main.load(period)"
      >
        Reintentar
      </VBtn>
    </ApiErrorAlert>

    <!-- Skeleton -->
    <template v-if="main.isLoading.value && !metrics">
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
    </template>

    <!-- On error the previous period's data is hidden: the toggle already shows the new one -->
    <template v-else-if="metrics && !main.error.value">
      <VProgressLinear
        v-if="main.isLoading.value"
        indeterminate
        color="primary"
        rounded
        class="mb-2"
      />

      <!-- KPI cards -->
      <div class="stats-grid mb-4">
        <ProgressMiniCard
          v-for="tile in tiles"
          :key="tile.key"
          :title="tile.title"
          :main-number="tile.value"
          :growth="tile.growth"
          :icon="tile.icon"
          :color="tile.color"
          :caption="tile.caption"
        />
      </div>

      <MetricsBarChart
        v-if="periodSeries"
        :title="periodSeries.title"
        subtitle="Sellos registrados en el periodo"
        name="Sellos"
        :categories="periodSeries.categories"
        :data="periodSeries.data"
        class="mb-4"
      />

      <MetricsTopCustomers
        :customers="metrics.topCustomers"
        class="mb-4"
      />

      <MetricsByCard
        :cards="metrics.byCard"
        class="mb-4"
      />
    </template>

    <!-- Yearly chart (second call, period=year) -->
    <ApiErrorAlert
      :error="yearly.error.value"
      class="mb-4"
    >
      <VBtn
        size="small"
        variant="text"
        class="mt-1 px-0"
        @click="yearly.load('year')"
      >
        Reintentar
      </VBtn>
    </ApiErrorAlert>
    <VSkeletonLoader
      v-if="yearly.isLoading.value && !yearSeries"
      type="card"
      rounded="xl"
    />
    <MetricsBarChart
      v-else-if="yearSeries && !yearly.error.value"
      title="Sellos por mes"
      subtitle="Sellos registrados en el año actual"
      name="Sellos"
      :categories="yearSeries.categories"
      :data="yearSeries.data"
    />
  </div>
</template>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.period-caption {
  min-block-size: 1.25rem;
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
</style>
