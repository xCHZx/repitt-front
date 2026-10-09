<script setup lang="ts">
import { useTheme } from 'vuetify'

const props = defineProps<{
  title: string
  subtitle?: string
  name: string
  categories: string[]
  data: number[]
}>()

// ApexCharts escribe los colores como atributos SVG, que no aceptan var(): se lee el valor resuelto
// de cada token (src/styles/tokens.css). Guía §15: una serie en --enlace, el resto en neutros.
// Su parser de color falla con la sintaxis rgb(r g b / a%) de los tokens: el canvas la normaliza a
// #rrggbb o rgba(r, g, b, a).
const canvasColor = document.createElement('canvas').getContext('2d')

function apexColor(value: string) {
  if (!canvasColor || !value)
    return value
  canvasColor.fillStyle = value

  return canvasColor.fillStyle
}

function readTokens() {
  const css = getComputedStyle(document.documentElement)
  const token = (name: string) => css.getPropertyValue(name).trim()

  return {
    serie: apexColor(token('--enlace')),
    neutro: apexColor(token('--texto-2')),
    linea: apexColor(token('--linea')),
    familia: token('--f-texto'),
    tamano: token('--t-small'),
  }
}

const tokens = ref(readTokens())

// Los tokens cambian con <html data-theme>, que App.vue actualiza al cambiar el tema: se releen después.
const theme = useTheme()

watch(() => theme.global.name.value, () => {
  tokens.value = readTokens()
}, { flush: 'post' })

const series = computed(() => [{ name: props.name, data: props.data }])

const maxValue = computed(() => Math.max(...props.data, 1))

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    zoom: { enabled: false },
    parentHeightOffset: 0,
    fontFamily: tokens.value.familia,
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
      fontFamily: tokens.value.familia,
      fontSize: tokens.value.tamano,
      fontWeight: 700,
      colors: [tokens.value.neutro],
    },
  },
  colors: [tokens.value.serie],
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } },
  },
  grid: {
    strokeDashArray: 0,
    borderColor: tokens.value.linea,
  },
  xaxis: {
    categories: props.categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      hideOverlappingLabels: true,

      // Con --t-small las etiquetas de 12 meses se juntan: se giran siempre que hay más de 7
      rotateAlways: props.categories.length > 7,
      style: { colors: tokens.value.neutro, fontFamily: tokens.value.familia, fontSize: tokens.value.tamano },
    },
  },
  yaxis: {
    tickAmount: 4,
    min: 0,
    max: maxValue.value + Math.ceil(maxValue.value * 0.2) + 1,
    labels: {
      formatter: (value: number) => String(Math.round(value)),
      style: { colors: tokens.value.neutro, fontFamily: tokens.value.familia, fontSize: tokens.value.tamano },
    },
  },
  tooltip: {
    style: { fontFamily: tokens.value.familia, fontSize: tokens.value.tamano },
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
  <VCard
    rounded="xl"
    class="metrics-chart"
  >
    <VCardText class="pa-4 pb-0">
      <div class="section-label mb-1">
        <VIcon
          icon="tabler-chart-bar"
          size="13"
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

// Globo de la gráfica como superficie plana de la guía: borde --linea, sin sombra.
// Sin scoped (el globo lo crea ApexCharts); .metrics-chart lo limita a esta gráfica.
.metrics-chart .apexcharts-canvas .apexcharts-tooltip {
  border: 1px solid var(--linea);
  border-radius: var(--r-control);
  background: var(--superficie);
  box-shadow: none;
  color: var(--texto);

  .apexcharts-tooltip-title {
    border-color: var(--linea);
    background: var(--superficie);
    font-weight: 700;
  }
}
</style>
