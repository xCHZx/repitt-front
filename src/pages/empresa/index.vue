<script lang="ts" setup>
import { getAllByCurrentCompany } from '@/services/company/businesses'
import { getCurrentVisitorData } from '@/services/visitor/users'
import { useCompanyStore } from '@/stores/company'

const menuItems = [
  {
    title: 'Información del Negocio',
    description: 'Esta es una descripción',
    icon: 'tabler-building-store',
    url: '/empresa/informacion',
  },
  {
    title: 'Métricas',
    description: 'Esta es una descripción',
    icon: 'tabler-chart-histogram',
    url: '/empresa/metricas',
  },
  {
    title: 'Mis Recompensas',
    description: 'Esta es una descripción',
    icon: 'tabler-cards',
    url: '/empresa/tarjetas',
  },
  {
    title: 'Registrar Visita',
    description: 'Esta es una descripción',
    icon: 'tabler-qrcode',
    url: '/empresa/visitas/registrar',
  },

]

const businesses: any = ref({})
const user: any = ref({})

const companyStore = useCompanyStore()

const isDialogVisible = ref(false)

const router = useRouter()

const getData = async () => {
  try {
    businesses.value = await getAllByCurrentCompany()
    user.value = await getCurrentVisitorData()
  }
  catch (error) {
    console.error('Error getting data:', error)
  }
}

onMounted(() => {
  getData()
})

const goToUserHome = () => {
  console.log('goToUserHome')

  router.push('/visitante')
}

const goToBusiness = (business: any) => {
  companyStore.selectCompany(business)

  console.log('goToBusiness', business)

  router.push('/empresa/')

  isDialogVisible.value = false
}

const goToPage = (url: string) => {
  console.log('goToPage', url)
  router.push(url)
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCardText>
        <div class="text-center text-h3">
          <VAvatar
            size="50"
            color="primary"
            class="mb-1"
          >
            <VImg
              :src="companyStore.selectedCompany?.logo_path"
              alt="Logo"
            />
          </VAvatar>
          {{ companyStore.selectedCompany?.name || 'Bienvenido...' }}
        </div>
      </VCardText>
      <div
        v-for="item in menuItems"
        :key="item.title"
        class="py-3"
      >
        <MainMenuItemList
          :title="item.title"
          :description="item.description"
          :icon="item.icon"
          :url="item.url"
          accent-color="#E0D9FF"
          text-accent-color="#493599"
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
            @click="goToUserHome"
          />
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
