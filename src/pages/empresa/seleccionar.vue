<script lang="ts" setup>
import { getAllByCurrentCompany } from '@/services/company/businesses'
import { getCurrentVisitorData } from '@/services/visitor/users'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: true,
  },
})

const authStore = useAuthStore()

const router = useRouter()

const businesses: any = ref({})
const user: any = ref({})

const companyStore = useCompanyStore()

const getData = async () => {
  try {
    businesses.value = await getAllByCurrentCompany()
    user.value = await getCurrentVisitorData()
  }
  catch (error) {
    console.error('Error getting data:', error)
  }
}

const goToVisitorHome = () => {
  console.log('goToVisitorHome')

  router.push('/visitante')
}

const goToBusiness = (business: any) => {
  companyStore.selectCompany(business)

  console.log('goToBusiness', business)

  router.push('/empresa/')
}

const goToCreateBusiness = () => {
  console.log('goToCreateBusiness')

  router.push('/empresa/crear')
}

const logout = () => {
  console.log('logout')
  authStore.logout()
  router.push('auth/login')
}

onMounted(() => {
  getData()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCardText>
        <div class="text-center text-h5">
          Perfil de Negocio
        </div>
      </VCardText>
      <div
        v-for="business in businesses"
        :key="business.name"
        class="py-3"
      >
        <BusinessListItem
          :image="business.logo_path"
          :business-name="business.name"
          :segment="business.segment.name"
          :description="business.description"
          @click="goToBusiness(business)"
        />
      </div>
      <VDivider class="my-5" />
      <div>
        <VCardText>
          <div class="text-center text-h5">
            Perfil de Visitante
          </div>
        </VCardText>
        <MainMenuItemList
          :title="user?.first_name"
          :description="user?.repitt_code"
          icon="tabler-user"
          url="/visitante/"
          @click="goToVisitorHome"
        />
      </div>

      <div class="d-flex flex-column justify-center mt-10">
        <div class="text-center">
          <VBtn
            variant="text"
            color="success"
            @click="goToCreateBusiness"
          >
            <VIcon
              start
              size="25"
              icon="tabler-square-plus"
            />
            Crear nuevo Negocio
          </VBtn>
        </div>
      </div>
      <div class="d-flex flex-column justify-center mt-10">
        <div class="text-center">
          <VBtn
            color="secondary"
            variant="text"
            @click="logout"
          >
            <VIcon
              start
              size="25"
              icon="tabler-logout"
            />
            Cerrar Sesión
          </VBtn>
        </div>
      </div>
      <div class="text-center text-h5">
        Cerrar sesión
      </div>
    </VCol>
  </VRow>
</template>
