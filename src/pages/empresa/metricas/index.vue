<script lang="ts" setup>
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
</template>
