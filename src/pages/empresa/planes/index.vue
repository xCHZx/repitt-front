<script setup lang="ts">
import { getBillingPortalUrl } from '@/services/subscription/subscription'
import { useAuthStore } from '@/stores/auth'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})

const authStore = useAuthStore()

const billingPortalUrl = ref()

const getBillingPortalLink = async () => {
  billingPortalUrl.value = await getBillingPortalUrl()
}

const goToBillingPortal = async () => {
  // window.open(await getBillingPortalUrl(), '_blank')
  window.open(billingPortalUrl.value, '_blank')
}

onMounted(() => {
  getBillingPortalLink()
})
</script>

<template>
  <div v-if="authStore.subscriptionStatus === 'active' || authStore.subscriptionStatus === 'trialing'">
    <VCardText>
      <div class="text-center text-h2 font-weight-bold">
        ¡Ya tienes una suscripción activa!
      </div>
    </VCardText>
    <VCardText>
      <div class="text-center text-h5">
        Accede a tu portal de administración de suscripciones aquí
      </div>
      <div class="text-center mt-4">
        <VBtn
          block
          color="primary"
          @click="goToBillingPortal"
        >
          Ir al panel
          <VIcon
            end
            icon="tabler-credit-card"
          />
        </VBtn>
      </div>
      <div class="text-center text-h6 mt-6">
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
