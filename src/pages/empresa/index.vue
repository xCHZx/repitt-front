<script lang="ts" setup>
import { getAllByCurrentCompany } from '@/services/company/businesses'
import { getCurrentVisitorData } from '@/services/visitor/users'

const router = useRouter()

const businesses: any = ref({})
const user: any = ref({})

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

const goToBusiness = (id: number) => {
  console.log('goToBusiness', id)

  router.push(`/empresa/${id}`)
}
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
          @click="goToBusiness(business.id)"
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

      <div class="d-flex flex-column justify-center mt-10">
        <div class="text-center">
          <VAvatar>
            <VIcon>
              <VIcon
                icon="tabler-logout"
                size="40"
              />
            </VIcon>
          </VAvatar>
        </div>
        <div class="text-center text-h5">
          Cerrar sesión
        </div>
      </div>
    </VCol>
  </VRow>
</template>
