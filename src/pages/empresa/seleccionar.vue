<script lang="ts" setup>
import Swal from 'sweetalert2'
import { logoutUser } from '@/services/auth/auth'
import { getAllBusinessAsCurrentCompany } from '@/services/company/businesses'
import { getCurrentVisitorData } from '@/services/visitor/users'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const router = useRouter()

const businesses: any = ref({})
const user: any = ref({})

const companyStore = useCompanyStore()

const getData = async () => {
  try {
    user.value = await getCurrentVisitorData()
    businesses.value = await getAllBusinessAsCurrentCompany()
  }
  catch (error: any) {
    console.error('Error getting data:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por ahora no tienes negocios registrados.',
    })
  }
}

const goToVisitorHome = () => {
  // console.log('goToVisitorHome')

  router.push('/visitante')
}

const goToBusiness = (business: any) => {
  companyStore.selectCompany(business)

  // console.log('goToBusiness', business)

  router.push('/empresa/')
}

const goToCreateBusiness = () => {
  // console.log('goToCreateBusiness')

  router.push('/empresa/crear')
}

const logout = async () => {
  await logoutUser()
  await router.push('/auth/login')
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
          :is-active="business.is_active"
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
    </VCol>
  </VRow>
</template>
