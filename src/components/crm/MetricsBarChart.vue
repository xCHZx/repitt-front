<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  name: string
  categories: string[]
  data: number[]
}>()

const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const series = computed(() => [{ name: props.name, data: props.data }])

const maxValue = computed(() => Math.max(...props.data, 1))

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    zoom: { enabled: false },
    parentHeightOffset: 0,
  },

  // No `borderRadius` on bars: ApexCharts crashes when a bar is 0
  plotOptions: {
    bar: {
      columnWidth: props.data.length > 14 ? '70%' : '45%',
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: props.data.length <= 14,
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
    categories: props.categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      hideOverlappingLabels: true,
      style: { colors: labelColor, fontSize: '12px' },
    },
  },
  yaxis: {
    tickAmount: 4,
    min: 0,
    max: maxValue.value + Math.ceil(maxValue.value * 0.2) + 1,
    labels: {
      formatter: (value: number) => String(Math.round(value)),
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
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4 pb-0">
      <div class="section-label mb-1">
        <VIcon
          icon="tabler-chart-bar"
          size="13"
          color="primary"
        />
        {{ props.title }}
      </div>
      <div
        v-if="props.subtitle"
        class="text-caption text-medium-emphasis"
      >
        {{ props.subtitle }}
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
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>

<style lang="scss" scoped>
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
