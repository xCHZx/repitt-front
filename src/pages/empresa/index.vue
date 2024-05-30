<script lang="ts" setup>
import Swal from 'sweetalert2'
import { logoutUser } from '@/services/auth/auth'
import { getAllBusinessAsCurrentCompany } from '@/services/company/businesses'
import { refreshUserData } from '@/services/utils/utils'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const companyStore = useCompanyStore()

const menuItems = [
  {
    title: 'Información del Negocio',
    description: 'Administra la información de tu negocio.',
    icon: 'tabler-building-store',
    url: '/empresa/informacion',
    isDisabled: false,
  },
  {
    title: 'Planes',
    description: 'Gestiona tu plan de suscripción.',
    icon: 'tabler-premium-rights',
    url: '/empresa/planes',
    isDisabled: false,
  },
  {
    title: 'Métricas',
    description: 'Visualiza la actividad de tus recompensas y clientes.',
    icon: 'tabler-chart-histogram',
    url: '/empresa/metricas',
    isDisabled: false,
  },
  {
    title: 'Tarjetas de Lealtad',
    description: 'Administra las tarjetas de lealtad de tu negocio.',
    icon: 'tabler-cards',
    url: '/empresa/tarjetas',
    isDisabled: false,
  },
  {
    title: 'Visitas',
    description: 'Visualiza el historial de visitas a tu negocio.',
    icon: 'tabler-walk',
    url: '/empresa/visitas',
    isDisabled: false,
  },
  {
    title: 'Registrar Visita',
    description: 'Registra la visita de tu cliente con un código QR.',
    icon: 'tabler-qrcode',
    url: '/empresa/visitas/registrar',
    isDisabled: !companyStore.selectedCompany.is_active,
  },

]

const businesses: any = ref({})
const user: any = ref({})

const isDialogVisible = ref(false)

const router = useRouter()

const getData = async () => {
  try {
    businesses.value = await getAllBusinessAsCurrentCompany()
    user.value = await refreshUserData()
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

onMounted(() => {
  getData()
})

const goToUserHome = () => {
  router.push('/visitante')
}

const logout = async () => {
  await logoutUser()
  await router.push('auth/login')
}

const goToBusiness = (business: any) => {
  companyStore.selectCompany(business)

  router.push('/empresa/')

  isDialogVisible.value = false
}

const goToPage = (url: string) => {
  router.push(url)
}

const goToCreateBusiness = () => {
  router.push('/empresa/crear')
}

onBeforeMount(async () => {
  if (!companyStore.selectedCompany.name)
    await router.push('/empresa/seleccionar')
  else
    await companyStore.refreshCompany(companyStore.selectedCompany.id)
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCardText>
        <div class="text-center text-h3">
          <VAvatar
            size="50"
            color="#FFFFFF"
            class="mb-1"
          >
            <VImg
              :src="companyStore.selectedCompany?.logo_path || undefined"
              alt="Logo"
            />
          </VAvatar>
          {{ companyStore.selectedCompany?.name || 'Bienvenido...' }}
        </div>
        <div v-if="companyStore.selectedCompany.is_active">
          <VAlert
            color="success"
            icon="tabler-eye"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
            class="pb-2 text-left mb-6 mt-2"
          >
            <p class="mb-0">
              Tu negocio está <strong>ACTIVO.</strong>
            </p>
          </VAlert>
        </div>
        <div v-else>
          <VAlert
            color="error"
            icon="tabler-alert-triangle"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
            class="pb-2 text-left mb-6 mt-2"
          >
            <p class="mb-0">
              Tu negocio está <strong>INACTIVO.</strong>
            </p>
          </VAlert>
        </div>
      </VCardText>
      <div
        v-for="item in menuItems"
        :key="item.title"
        class="py-2"
      >
        <MainMenuItemList
          :title="item.title"
          :description="item.description"
          :icon="item.icon"
          :url="item.url"
          accent-color="#E0D9FF"
          text-accent-color="#493599"
          :disabled="item.isDisabled"
          @click="goToPage(item.url)"
        />
      </div>
      <div class="d-flex flex-column justify-center mt-10">
        <div class="text-center">
          <VBtn
            variant="text"

            @click="isDialogVisible = true"
          >
            <VIcon
              start
              size="25"
              icon="tabler-refresh"
            />
            Cambiar de Perfil
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
  <!-- Dialog Content  -->
  <VDialog
    v-model="isDialogVisible"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <!-- Dialog Content -->
    <VCard>
      <!-- Toolbar -->
      <div>
        <VToolbar color="primary">
          <VToolbarTitle>Cambiar de Perfil</VToolbarTitle>

          <VSpacer />

          <VToolbarItems>
            <VBtn
              icon
              variant="plain"
              @click="isDialogVisible = false"
            >
              <VIcon
                color="white"
                icon="tabler-x"
              />
            </VBtn>
          </VToolbarItems>
        </VToolbar>
      </div>
      <div class="px-4">
        <!-- List -->
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
            :title="user?.data.first_name"
            :description="user?.data.repitt_code"
            icon="tabler-user"
            url="/visitante/"
            @click="goToUserHome"
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
      </div>

      <!-- List -->
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
</style>
