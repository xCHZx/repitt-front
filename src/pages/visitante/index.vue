<script lang="ts" setup>
import { logoutUser } from '@/services/auth/auth'
import { refreshUserData } from '@/services/utils/utils'
import { useAuthStore } from '@/stores/auth'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})

const menuItems = [

  {
    title: 'Perfil',
    description: 'Administra tu información.',
    icon: 'tabler-id',
    url: '/visitante/perfil',
  },
  {
    title: 'Historial de Visitas',
    description: 'Visualiza todas las visitas que has realizado.',
    icon: 'tabler-walk',
    url: '/visitante/visitas',
  },
  {
    title: 'Mis Tarjetas de Lealtad',
    description: 'Consulta tu progreso hacia tus recompensas.',
    icon: 'tabler-cards',
    url: '/visitante/tarjetas',
  },
  {
    title: 'Mi Código de Usuario',
    description: 'Tú código Repitt para registrar visitas.',
    icon: 'tabler-qrcode',
    url: '/visitante/perfil/qr',
  },

]

const router = useRouter()

const authStore = useAuthStore()

const data = ref()

const goToPage = (url: string) => {
  console.log('goToPage', url)
  router.push(url)
}

const logout = async () => {
  await logoutUser()
  await router.push('/auth/login')
}

const getData = async () => {
  data.value = await refreshUserData()
}

onMounted(() => {
  getData()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCardText>
        <div
          v-if="authStore.user"
          class="text-h4 text-center"
        >
          Hola {{ authStore.user?.first_name || 'Usuario' }}
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
          @click="goToPage(item.url)"
        />
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
      <div
        v-if="authStore.authRole === 'Visitor'"
        class="d-flex flex-column justify-center mt-10"
      >
        <div class="text-center text-h6">
          <VBtn
            variant="text"
            size="sm"
            @click="goToPage('/empresa/planes')"
          >
            <VIcon
              start
              size="15"
              icon="tabler-building-store"
            />
            ¿Tienes un negocio y quieres ser parte de Repitt?
          </VBtn>
        </div>
      </div>
      <div
        v-else
        class="d-flex flex-column justify-center mt-10"
      >
        <div class="text-center text-h6">
          <VBtn
            variant="text"
            size="sm"
            @click="goToPage('/empresa')"
          >
            <VIcon
              start
              size="15"
              icon="tabler-building-store"
            />
            Ir a tu perfil de empresa
          </VBtn>
        </div>
      </div>
    </VCol>
  </VRow>
</template>
