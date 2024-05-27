<script lang="ts" setup>
import Swal from 'sweetalert2'
import { getGlobalMetrics } from '@/services/company/metrics'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const metrics = ref({
  activeUsers: 0,
  completedStampCards: {
    current: 0,
    previous: 0,
    growth: 0,
  },
  redeemedRewards: {
    current: 0,
    previous: 0,
    growth: 0,
  },
  visits: {
    current: 0,
    previous: 0,
    growth: 0,
  },
  topClients: [
    {
      user_id: 0,
      visits: 0,
      user: {
        first_name: '',
        last_name: '',
        repitt_code: '',
      },
    },
  ],
  visitsByMonth: [
    {
      month: 'No disponible',
      visits: 0,
    },
  ],
  mostVisitedMonth: {
    month: 'No disponible',
    visits: 0,
  },
})

const companyStore = useCompanyStore()

const chartColors = {
  line: {
    series1: '#493599',
  },
}

const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const series = computed(() => [
  {
    name: 'Visitas por Mes',
    data: metrics.value.visitsByMonth.map(item => item.visits),
  },
])

const xAxisCategories = computed(() => {
  console.log(metrics.value.visitsByMonth)

  return metrics.value.visitsByMonth.map(item => item.month)
})

const shipmentConfig = computed(() => ({
  chart: {
    type: 'bar',
    stacked: false,
    parentHeightOffset: 0,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 7,
      columnWidth: '35%',
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: true,

    // formatter(val: any) {
    //   return `${val}%`
    // },
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ['#777777'],
    },
  },

  grid: {
    strokeDashArray: 8,
    borderColor,
  },
  colors: [chartColors.line.series1],
  fill: {
    opacity: [1, 1],
  },

  xaxis: {
    tickAmount: 10,
    categories: xAxisCategories.value,
    labels: {
      style: {
        colors: labelColor,
        fontSize: '13px',
        fontWeight: 400,
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    tickAmount: 4,
    min: 0,
    max: metrics.value.mostVisitedMonth.visits + Math.round(metrics.value.mostVisitedMonth.visits * 0.2),
    labels: {
      style: {
        colors: labelColor,
        fontSize: '13px',
        fontWeight: 400,
      },

      // formatter(val: string) {
      //   return `${val}%`
      // },
    },
  },
  responsive: [
    {
      breakpoint: 1400,
      options: {
        chart: {
          height: 320,
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '10px',
            },
          },
        },
        legend: {
          itemMargin: {
            vertical: 0,
            horizontal: 10,
          },
          fontSize: '13px',
          offsetY: 12,
        },
      },
    },
    {
      breakpoint: 1025,
      options: {
        chart: {
          height: 415,
        },
        plotOptions: {
          bar: {
            columnWidth: '50%',
          },
        },
      },
    },
    {
      breakpoint: 982,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '30%',
          },
        },
      },
    },
    {
      breakpoint: 480,
      options: {
        chart: {
          height: 250,
        },
        legend: {
          offsetY: 7,
        },
      },
    },
  ],
}),
)

const getData = async () => {
  try {
    const payload = {
      business_id: companyStore.company?.id,
    }

    metrics.value = await getGlobalMetrics(payload)

    // console.log(metrics.value.visitsByMonth.map(item => item.month))
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
  }
}

onMounted(() => {
  getData()
})
</script>

<!--
  <template>
  <VRow>
  <VCol
  cols="12"
  md="3"
  >
  <ProgressMiniCard
  title="Visitas de Clientes"
  main-number="100"
  growth="10"
  icon="tabler-walk"
  color="primary"
  />
  </VCol>
  <VCol
  cols="12"
  md="3"
  >
  <ProgressMiniCard
  title="Tarjetas Completadas"
  main-number="2,300"
  growth="16"
  icon="tabler-cards"
  color="info"
  />
  </VCol>
  <VCol
  cols="12"
  md="3"
  >
  <ProgressMiniCard
  title="Recompensas Canjeadas"
  main-number="680"
  growth="8"
  icon="tabler-award"
  color="warning"
  />
  </VCol>
  <VCol
  cols="12"
  md="3"
  >
  <ProgressMiniCard
  title="Usuarios activos"
  main-number="250"
  growth="35"
  icon="tabler-users-group"
  color="error"
  />
  </VCol>
  </VRow>
  <VRow>
  <VCol
  cols="12"
  md="8"
  >
  <div
  style="background-color: white; border-radius: 8px;"
  class="pa-6"
  >
  <VCard style="background-color: #FFF2F7;">
  <VCardItem
  title="Serie de Datos 1"
  subtitle="Total number of $$$$$ 28,500"
  />

  <VCardText>
  <VueApexCharts
  id="shipment-statistics"
  type="bar"
  height="320"
  :options="shipmentConfig"
  :series="series"
  />
  </VCardText>
  </VCard>
  </div>
  </VCol>
  <VCol
  cols="12"
  md="4"
  >
  <div
  style="background-color: white; border-radius: 8px;"
  class="pa-6"
  >
  <VCardText>
  <div class="text-h4 font-weight-bold">
  Clientes más frecuentes
  </div>
  </VCardText>
  <VRow>
  <VCol
  cols="12"
  md="12"
  >
  <div class="py-2">
  <UserWithCountListItem
  first-name="Nombre"
  last-name="Apellido"
  visits="10"
  last-visit="24/09/2021"
  icon="tabler-number-1"
  />
  </div>
  <div class="py-2">
  <UserWithCountListItem
  first-name="Nombre"
  last-name="Apellido"
  visits="10"
  last-visit="24/09/2021"
  icon="tabler-number-2"
  />
  </div>
  <div class="py-2">
  <UserWithCountListItem
  first-name="Nombre"
  last-name="Apellido"
  visits="10"
  last-visit="24/09/2021"
  icon="tabler-number-3"
  />
  </div>
  </VCol>
  </VRow>
  </div>
  </VCol>
  </VRow>
  </template>
-->

<template>
  <VRow>
    <VCol
      cols="12"
      md="4"
    >
      <ProgressMiniCard
        title="Visitas de Clientes"
        :main-number="metrics.visits.current"
        :growth="metrics.visits.growth"
        icon="tabler-walk"
        color="primary"
        class="mb-4"
      />
      <ProgressMiniCard
        title="Tarjetas Completadas"
        :main-number="metrics.completedStampCards.current"
        :growth="metrics.completedStampCards.growth"
        icon="tabler-cards"
        color="info"
        class="mb-4"
      />
    </VCol>
    <VCol
      cols="12"
      md="4"
    >
      <ProgressMiniCard
        title="Recompensas Canjeadas"
        :main-number="metrics.redeemedRewards.current"
        :growth="metrics.redeemedRewards.growth"
        icon="tabler-award"
        color="warning"
        class="mb-4"
      />
      <ProgressMiniCard
        title="Usuarios activos totales"
        :main-number="metrics.activeUsers"
        icon="tabler-users-group"
        color="error"
        class="mb-4"
      />
    </VCol>
    <VCol
      cols="12"
      md="4"
    >
      <div
        style="background-color: white; border-radius: 8px;"
        class="pa-4"
      >
        <VCardText class="my-0 py-0">
          <div class="text-h4 font-weight-bold">
            Clientes más frecuentes
          </div>
        </VCardText>
        <VRow>
          <VCol
            cols="12"
            md="12"
          >
            <div
              v-for="client in metrics.topClients"
              :key="client.user_id"
              class="py-2"
            >
              <UserWithCountListItem
                :first-name="client.user.first_name"
                :last-name="client.user.last_name"
                :visits="client.visits"
                icon="tabler-number-1"
              />
            </div>
          </VCol>
        </VRow>
      </div>
    </VCol>
  </VRow>
  <VRow>
    <VCol
      cols="12"
      md="12"
    >
      <div
        style="background-color: white; border-radius: 8px;"
        class="pa-6"
      >
        <VCard style="background-color: #FFF2F7;">
          <VCardItem
            title="Visitas por mes"
            subtitle="Gente que ha visitado tu negocio y ha sellado su tarjeta."
          />

          <VCardText>
            <VueApexCharts
              id="shipment-statistics"
              type="bar"
              height="320"
              :options="shipmentConfig"
              :series="series"
            />
          </VCardText>
        </VCard>
      </div>
    </VCol>
    <VCol
      cols="12"
      md="4"
    />
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";

.v-btn-group--divided .v-btn:not(:last-child) {
  border-inline-end-color: rgba(var(--v-theme-primary), 0.5);
}

#shipment-statistics {
  .apexcharts-legend-text {
    font-size: 16px !important;
  }

  .apexcharts-legend-series {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 0.375rem;
    block-size: 83%;
    padding-block: 4px;
    padding-inline: 16px 12px;
  }
}
</style>
