<script lang="ts" setup>
const menuItems = [
  {
    title: 'Información del Negocio',
    description: 'Esta es una descripción',
    icon: 'tabler-building-store',
    url: '/empresa/perfil',
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

const router = useRouter()

const goToPage = (url: string) => {
  console.log('goToPage', url)
  router.push(url)
}
</script>

<template>
  <VRow>
    <VCol cols="12">
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
          <VAvatar>
            <VIcon>
              <VIcon
                icon="tabler-refresh"
                size="40"
                color="primary"
              />
            </VIcon>
          </VAvatar>
        </div>
        <div class="text-center text-h5 text-primary">
          Cambiar a Visitante
        </div>
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
