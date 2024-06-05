<script setup lang="ts">
import Swal from 'sweetalert2'
import { getBusinessByIdAsVisitor } from '@/services/visitor/business'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,

    // requiredRole: ['Visitor', 'Owner'],
  },
})

const router = useRouter()
const route: any = useRoute()

const data: any = ref({})
const businessId = route.params.id

const getData = async () => {
  try {
    data.value = await getBusinessByIdAsVisitor(businessId)
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed)
        router.push('/auth/login')
    })
  }
}

const goToRegister = () => {
  router.push('/auth/registro')
}

onMounted(() => {
  getData()
})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-8">
    <VRow>
      <VCol cols="12">
        <VCardItem class="justify-center">
          <template #prepend>
            <div class="d-flex">
              <VNodeRenderer :nodes="themeConfig.app.logo" />
            </div>
          </template>

          <VCardTitle
            class="font-weight-bold text-capitalize text-h5 py-1"
            style="color: rgb(var(--v-global-theme-primary))"
          >
            {{ themeConfig.app.title }}
          </VCardTitle>
        </VCardItem>

        <BusinessDetails
          :name="data?.name"
          :description="data?.description"
          :address="data?.address"
          :phone="data?.phone"
          :segment="data?.segment?.name"
          :opening-hours="data?.opening_hours"
          :logo-path="data?.logo_path"
          :created-at="data?.created_at"
        />
        <div v-if="!data?.is_active">
          <VAlert
            color="error"
            icon="tabler-alert-triangle"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
            class="pb-2 text-left mb-6 mt-2"
          >
            <p class="mb-0">
              Negocio <strong>INACTIVO.</strong>
            </p>
          </VAlert>
        </div>

        <VCardText
          v-if="data?.is_active"
          class="text-center pt-4"
        >
          <VIcon
            icon="tabler-award"
            size="1.5rem"
            class="mb-2"
          />
          <span
            v-if="data?.stamp_cards?.length > 0"
            class="text-h4"
          >
            Recompensas de este negocio
          </span>
        </VCardText>

        <div
          v-for="stampCard in data?.stamp_cards"
          :key="stampCard.id"
          class="mt-4"
        >
          <StampCardListItemAsBusiness
            :title="stampCard.reward"
            :description="`${stampCard.required_stamps} visitas para esta recompensa`"
            icon="tabler-gift"
            accent-color="#E0D9FF"
            text-accent-color="#493599"
            :is-active="stampCard.is_active"
          />
        </div>

        <div
          v-if="data?.is_active"
          class="mt-5"
        >
          <VBtn
            block
            color="success"
            @click="goToRegister"
          >
            ¡Quiero ser parte de las recompensas!
            <VIcon
              end
              icon="tabler-award-filled"
            />
          </VBtn>
        </div>
      </VCol>
    </VRow>
  </div>
</template>

<style lang = "scss" scoped>
  .auth-wrapper {
    // background-color: #E0D9FF;
    // background-image: url('https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg');
    // // background-size: cover;
    // background-position: center center;
    // background-repeat: repeat;

    background: rgb(224,217,255);
    background: linear-gradient(135deg, rgba(224,217,255,1) 0%, rgba(248,247,250,1) 100%);
  }
</style>
