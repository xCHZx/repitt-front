<script setup lang="ts">
const features = [
  { icon: 'tabler-cards', text: 'Tarjetas de sellos para tus clientes' },
  { icon: 'tabler-qrcode', text: 'Registro de visitas por QR o teléfono' },
  { icon: 'tabler-gift', text: 'Canje de recompensas en mostrador' },
  { icon: 'tabler-users', text: 'Clientes con su historial' },
  { icon: 'tabler-chart-bar', text: 'Métricas de tu programa' },
  { icon: 'tabler-user-plus', text: 'Cajeros para tu equipo' },
]
</script>

<!-- The single Repitt plan (v1 has no plan catalog: checkout takes no planId). Price and billing details are shown by the Stripe checkout page. -->
<template>
  <VCard rounded="xl">
    <VCardText class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-h6 font-weight-bold">
            Plan Repitt
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Todo tu programa de lealtad en un solo plan
          </div>
        </div>
        <VIcon
          icon="tabler-crown"
          size="28"
          class="plan-features-accent"
        />
      </div>

      <VDivider class="mb-4" />

      <div class="plan-features-list">
        <div
          v-for="feature in features"
          :key="feature.text"
          class="plan-feature-item"
        >
          <VIcon
            icon="tabler-check"
            size="18"
            class="plan-features-accent flex-shrink-0"
          />
          <span class="text-body-2">{{ feature.text }}</span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
// Checks y corona en --acento (guía §2: acentos solo en piezas pequeñas).
.plan-features-accent {
  color: var(--acento);
}

.plan-features-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.plan-feature-item {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}
</style>
