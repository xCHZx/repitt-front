<script lang="ts" setup>
const chartColors = {
  line: {
    series1: '#493599',
  },
}

const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const series = [
  {
    name: 'SerieDeDatos',
    data: [38, 45, 33, 38, 32, 48, 45, 40, 42, 37, 50],
  },
]

const shipmentConfig = {
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
    formatter(val: any) {
      return `${val}%`
    },
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
    categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Noviembre', 'Diciembre'],
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
    max: 60,
    labels: {
      style: {
        colors: labelColor,
        fontSize: '13px',
        fontWeight: 400,
      },
      formatter(val: string) {
        return `${val}%`
      },
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
}
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="3"
    >
      <ProgressMiniCard
        title="Visitas de Clientes"
        main-number="100"
        change="10"
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
        change="16"
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
        change="8"
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
        change="35"
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
