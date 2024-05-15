<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})
</script>

<template>
  <div v-if="authStore.subscriptionStatus === 'active'">
    <VCardText>
      <div class="text-center text-h1 font-weight-bold">
        ¡Ya tienes una suscripción activa!
      </div>
      <div class="text-center text-h5">
        Si necesitas ayuda, por favor contáctanos al correo
        <VIcon
          class="mx-2"
          icon="tabler-mail"
        />
        <span class="text-primary">soporte@repitt.com</span>
      </div>
    </VCardText>
  </div>
  <div v-else>
    <PricingCard
      title="Planes de Suscripción"
      md="4"
    />
  </div>
</template>
