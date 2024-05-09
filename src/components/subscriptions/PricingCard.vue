<script setup lang="ts">
import safeBoxWithGoldenCoin from '@images/misc/3d-safe-box-with-golden-dollar-coins.png'

import { getCheckoutUrl } from '@/services/subscription/subscription'

const props = defineProps<Pricing>()

const router = useRouter()

const checkoutUrl = ref()

interface Pricing {
  title?: string
  xs?: number | string
  sm?: number | string
  md?: string | number
  lg?: string | number
  xl?: string | number
}

const annualMonthlyPlanPriceToggler = ref(true)

const pricingPlans = [
  // {
  //   name: 'Basic',
  //   tagLine: 'A simple start for everyone',
  //   logo: dollarCoinPiggyBank,
  //   monthlyPrice: 0,
  //   yearlyPrice: 0,
  //   isPopular: false,
  //   current: true,
  //   url: '/visitante',
  //   features: [
  //     '100 responses a month',
  //     'Unlimited forms and surveys',
  //     'Unlimited fields',
  //     'Basic form creation tools',
  //     'Up to 2 subdomains',
  //   ],
  // },
  {
    name: 'Básico',
    tagLine: 'Para pequeños negocios con necesidades limitadas',
    logo: safeBoxWithGoldenCoin,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    isPopular: true,
    current: false,
    url: checkoutUrl.value,
    features: [
      '1 tarjeta de recompensas personalizable',
      '1 negocio registrado',
      '1 usuario administrador',
      'Visitas ilimitadas',
      'Estadísticas sobre tus visitas y clientes',
      'Historial de visitas',
    ],
  },

  // {
  //   name: 'Enterprise',
  //   tagLine: 'Solution for big organizations',
  //   logo: spaceRocket,
  //   monthlyPrice: 99,
  //   yearlyPrice: 999,
  //   isPopular: false,
  //   current: false,
  //   url: '/visitante',
  //   features: [
  //     'PayPal payments',
  //     'Logic Jumps',
  //     'File upload with 5GB storage',
  //     'Custom domain support',
  //     'Stripe integration',
  //   ],
  // },
]

const getCheckout = async () => {
  checkoutUrl.value = await getCheckoutUrl()
}

// Falta implementar un argumento para pasar al back y seleccionar el checkout dependiendo del plan
const goToPage = async () => {
  window.open(await getCheckoutUrl(), '_blank')
}

onMounted(() => {
  getCheckout()
})
</script>

<template>
  <!-- 👉 Title and subtitle -->
  <div class="text-center">
    <h3 class="text-h3 pricing-title mb-2">
      {{ props.title ? props.title : 'Pricing Plans' }}
    </h3>
    <p class="mb-0">
      Aumenta las ventas de tu negocio con nuestro sistema de recompensas digital.
    </p>
    <p class="mb-2">
      Elige el plan que mejor se adapte a tus necesidades.
    </p>
  </div>

  <!-- 👉 Annual and monthly price toggler -->

  <div class="d-flex font-weight-medium text-body-1 align-center justify-center mx-auto mt-12 mb-6">
    <VLabel
      for="pricing-plan-toggle"
      class="me-3"
    >
      Mensual
    </VLabel>

    <div class="position-relative">
      <VSwitch
        id="pricing-plan-toggle"
        v-model="annualMonthlyPlanPriceToggler"
      >
        <template #label>
          <div class="text-body-1 font-weight-medium">
            Anual
          </div>
        </template>
      </VSwitch>

      <div class="save-upto-chip position-absolute align-center d-none d-md-flex gap-1">
        <VIcon
          icon="tabler-corner-left-down"
          size="24"
          class="flip-in-rtl mt-2 text-disabled"
        />
        <VChip
          label
          color="primary"
          size="small"
        >
          Paga menos en el plan Anual
        </VChip>
      </div>
    </div>
  </div>

  <!-- SECTION pricing plans -->
  <VRow>
    <VCol
      v-for="plan in pricingPlans"
      :key="plan.logo"
      v-bind="props"
      cols="12"
    >
      <!-- 👉  Card -->
      <VCard
        flat
        border
        :class="plan.isPopular ? 'border-primary border-opacity-100' : ''"
      >
        <VCardText
          style="block-size: 3.75rem;"
          class="text-end"
        >
          <!-- 👉 Popular -->
          <VChip
            v-show="plan.isPopular"
            label
            color="primary"
            size="small"
          >
            Popular
          </VChip>
        </VCardText>

        <!-- 👉 Plan logo -->
        <VCardText>
          <VImg
            :height="120"
            :width="120"
            :src="plan.logo"
            class="mx-auto mb-5"
          />

          <!-- 👉 Plan name -->
          <h4 class="text-h4 mb-1 text-center">
            {{ plan.name }}
          </h4>
          <p class="mb-0 text-body-1 text-center">
            {{ plan.tagLine }}
          </p>

          <!-- 👉 Plan price  -->

          <div class="position-relative">
            <div class="d-flex justify-center pt-5 pb-10">
              <div class="text-body-1 align-self-start font-weight-medium">
                $
              </div>
              <h1 class="text-h1 font-weight-medium text-primary">
                {{ annualMonthlyPlanPriceToggler ? Math.floor(Number(plan.yearlyPrice) / 12) : plan.monthlyPrice }}
              </h1>
              <div class="text-body-1 font-weight-medium align-self-end">
                /al mes
              </div>
            </div>

            <!-- 👉 Annual Price -->
            <span
              v-show="annualMonthlyPlanPriceToggler"
              class="annual-price-text position-absolute text-caption text-disabled pb-4"
            >
              {{ plan.yearlyPrice === 0 ? 'free' : `$${plan.yearlyPrice}/Al año` }}
            </span>
          </div>

          <!-- 👉 Plan features -->

          <VList class="card-list mb-4">
            <VListItem
              v-for="feature in plan.features"
              :key="feature"
            >
              <template #prepend>
                <VIcon
                  size="8"
                  icon="tabler-circle-filled"
                  color="rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity))"
                />
              </template>

              <VListItemTitle class="text-body-1">
                {{ feature }}
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Plan actions -->
          <VBtn
            block
            :color="plan.current ? 'success' : 'primary'"
            :variant="plan.isPopular ? 'elevated' : 'tonal'"
            :active="false"
            @click="goToPage"
          >
            {{ plan.yearlyPrice === 0 ? 'Your Current Plan' : 'Adquirir' }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <!-- !SECTION  -->
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}

.save-upto-chip {
  inset-block-start: -2.4rem;
  inset-inline-end: -6rem;
}

.annual-price-text {
  inset-block-end: 3%;
  inset-inline-start: 50%;
  transform: translateX(-50%);
}
</style>
