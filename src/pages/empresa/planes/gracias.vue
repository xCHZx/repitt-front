<script setup lang="ts">
import { getBusinessByRepittCodeAsCurrentCompany } from '@/services/company/businesses'
import { useCompanyStore } from '@/stores/company'

definePage({ meta: { layout: 'blank' } })

const companyStore = useCompanyStore()
const router = useRouter()

const isActivating = ref(true)
const MAX_ATTEMPTS = 10
const INTERVAL_MS = 3000

onMounted(async () => {
  const repittCode = companyStore.selectedCompany?.businessRepittCode
  if (!repittCode) {
    isActivating.value = false
    return
  }

  let attempts = 0
  const poll = async () => {
    try {
      const business = await getBusinessByRepittCodeAsCurrentCompany(repittCode)
      if (business?.isActive) {
        companyStore.selectCompany(business)
        isActivating.value = false
        return
      }
    }
    catch { /* silencioso */ }

    attempts++
    if (attempts < MAX_ATTEMPTS)
      setTimeout(poll, INTERVAL_MS)
    else
      isActivating.value = false // timeout — dejar pasar igual
  }

  poll()
})
</script>

<template>
  <div class="gracias-page">
    <div class="gracias-inner">
      <!-- Icono -->
      <div class="gracias-icon">
        <VIcon
          v-if="!isActivating"
          icon="tabler-crown"
          size="48"
          color="white"
        />
        <VProgressCircular
          v-else
          indeterminate
          color="white"
          size="48"
        />
      </div>

      <!-- Textos -->
      <h1 class="gracias-title">
        {{ isActivating ? 'Activando tu negocio...' : '¡Bienvenido al Plan Emprendedor!' }}
      </h1>
      <p class="gracias-subtitle">
        {{ isActivating ? 'Estamos confirmando tu pago con Stripe. Solo tomará unos segundos.' : 'Tu suscripción está activa. Ya tienes acceso completo a todas las funciones de Repitt.' }}
      </p>

      <!-- Features rápidos -->
      <div class="gracias-features">
        <div class="gracias-feature">
          <VIcon
            icon="tabler-cards"
            color="white"
            size="20"
          />
          <span>Tarjetas ilimitadas</span>
        </div>
        <div class="gracias-feature">
          <VIcon
            icon="tabler-users"
            color="white"
            size="20"
          />
          <span>Listado de Clientes</span>
        </div>
        <div class="gracias-feature">
          <VIcon
            icon="tabler-chart-bar"
            color="white"
            size="20"
          />
          <span>Métricas y reportes</span>
        </div>
      </div>

      <VBtn
        v-if="!isActivating"
        color="white"
        variant="elevated"
        size="large"
        rounded="lg"
        class="gracias-btn"
        @click="router.push('/empresa')"
      >
        Ir al inicio
        <VIcon
          icon="tabler-arrow-right"
          end
        />
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gracias-page {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  block-size: 100vh;
  inline-size: 100vw;
}

.gracias-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fade-up 0.5s ease both;
  max-inline-size: 360px;
  padding-inline: 24px;
  text-align: center;
}

.gracias-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  background: rgb(255 255 255 / 20%);
  block-size: 96px;
  inline-size: 96px;
  margin-block-end: 24px;
}

.gracias-title {
  animation: fade-up 0.5s ease 0.2s both;
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-block-end: 12px;
}

.gracias-subtitle {
  animation: fade-up 0.5s ease 0.3s both;
  color: rgb(255 255 255 / 80%);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-block-end: 28px;
}

.gracias-features {
  display: flex;
  flex-direction: column;
  animation: fade-up 0.5s ease 0.4s both;
  gap: 12px;
  inline-size: 100%;
  margin-block-end: 36px;
}

.gracias-feature {
  display: flex;
  align-items: center;
  background: rgb(255 255 255 / 15%);
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  gap: 10px;
  padding-block: 10px;
  padding-inline: 16px;
}

.gracias-btn {
  animation: fade-up 0.5s ease 0.5s both;
  color: rgb(var(--v-theme-primary));
  inline-size: 100%;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
