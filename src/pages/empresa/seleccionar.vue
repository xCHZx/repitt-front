<script lang="ts" setup>
import { logoutUser } from '@/services/auth/auth'
import { getAllBusinessesMe } from '@/services/company/businesses'
import { getCurrentVisitorData } from '@/services/visitor/users'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const router = useRouter()
const companyStore = useCompanyStore()
const authStore = useAuthStore()

const businesses = ref<any[]>([])
const user = ref<any>(null)
const isLoading = ref(true)
const errorMsg = ref('')

const getData = async () => {
  try {
    [user.value, businesses.value] = await Promise.all([
      getCurrentVisitorData(),
      getAllBusinessesMe(),
    ])
  }
  catch {
    errorMsg.value = 'No se pudieron cargar tus negocios. Intenta de nuevo.'
  }
  finally {
    isLoading.value = false
  }
}

const goToBusiness = (business: any) => {
  companyStore.selectCompany(business)
  router.push('/empresa/')
}

const logout = async () => {
  await logoutUser()
  await router.push('/auth/login')
}

const getInitial = (name: string) => String(name || 'N').charAt(0).toUpperCase()

onMounted(() => {
  getData()
})
</script>

<template>
  <div class="sel-page">
    <!-- Brand -->
    <div class="sel-brand">
      <img
        src="@/assets/images/logo-v2.png"
        alt="Repitt"
        class="brand-logo"
      />
    </div>

    <!-- Greeting -->
    <div
      v-if="user"
      class="sel-greeting"
    >
      Hola, <strong>{{ user.firstName }}</strong> 👋
    </div>
    <div class="sel-subtitle">
      ¿Con qué perfil quieres continuar?
    </div>

    <!-- Error -->
    <VAlert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      rounded="lg"
      class="mb-4"
      :text="errorMsg"
    />

    <!-- Skeleton -->
    <template v-if="isLoading">
      <VSkeletonLoader
        v-for="i in 2"
        :key="i"
        type="list-item-avatar"
        class="sel-skeleton"
      />
    </template>

    <template v-else>
      <!-- Negocios -->
      <div
        v-if="businesses.length"
        class="sel-section-label"
      >
        <VIcon
          icon="tabler-building-store"
          size="14"
        />
        Tus negocios
      </div>

      <VCard
        v-for="business in businesses"
        :key="business.id"
        class="sel-card"
        rounded="xl"
        elevation="0"
        @click="goToBusiness(business)"
      >
        <VCardText class="d-flex align-center gap-3 pa-4">
          <div class="sel-avatar">
            <img
              v-if="business.logoPath"
              :src="business.logoPath"
              :alt="business.name"
              class="sel-avatar__img"
            >
            <span
              v-else
              class="sel-avatar__initial"
            >{{ getInitial(business.name) }}</span>
          </div>

          <div class="flex-grow-1 min-w-0">
            <div class="text-body-1 font-weight-bold text-truncate">
              {{ business.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ business.category?.name || 'Sin categoría' }}
            </div>
          </div>

          <VChip
            :color="business.isActive ? 'success' : 'default'"
            variant="tonal"
            size="x-small"
            class="flex-shrink-0"
          >
            {{ business.isActive ? 'Activo' : 'Inactivo' }}
          </VChip>

          <VIcon
            icon="tabler-chevron-right"
            size="18"
            color="medium-emphasis"
            class="flex-shrink-0"
          />
        </VCardText>
      </VCard>

      <!-- Visitante -->
      <div class="sel-section-label mt-3">
        <VIcon
          icon="tabler-user-heart"
          size="14"
        />
        Como visitante
      </div>

      <VCard
        class="sel-card"
        rounded="xl"
        elevation="0"
        @click="router.push('/visitante')"
      >
        <VCardText class="d-flex align-center gap-3 pa-4">
          <div class="sel-avatar sel-avatar--visitor">
            <VIcon
              icon="tabler-user-heart"
              size="22"
              color="primary"
            />
          </div>

          <div class="flex-grow-1 min-w-0">
            <div class="text-body-1 font-weight-bold">
              {{ user?.firstName }} {{ user?.lastName }}
            </div>
            <div class="text-caption text-medium-emphasis font-weight-medium">
              {{ user?.repittCode }}
            </div>
          </div>

          <VIcon
            icon="tabler-chevron-right"
            size="18"
            color="medium-emphasis"
            class="flex-shrink-0"
          />
        </VCardText>
      </VCard>

      <!-- Acciones secundarias -->
      <div class="sel-actions">
        <VBtn
          variant="text"
          color="primary"
          size="small"
          prepend-icon="tabler-plus"
          @click="router.push('/empresa/crear')"
        >
          Crear otro negocio
        </VBtn>

        <VBtn
          variant="text"
          color="secondary"
          size="small"
          prepend-icon="tabler-logout"
          @click="logout"
        >
          Cerrar sesión
        </VBtn>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sel-page {
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, rgba(var(--v-theme-primary), 0.07) 0%, rgb(var(--v-theme-background)) 45%);
  min-block-size: 100vh;
  padding-block: 40px 32px;
  padding-inline: 20px;
}

.sel-brand {
  margin-block-end: 28px;
  text-align: center;
}

.brand-logo {
  block-size: auto;
  inline-size: 140px;
}

.sel-greeting {
  font-size: 1.2rem;
  margin-block-end: 4px;
}

.sel-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-size: 0.9rem;
  margin-block-end: 24px;
}

.sel-section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  margin-block-end: 8px;
  text-transform: uppercase;
}

.sel-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  margin-block-end: 10px;
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.12);
  }
}

.sel-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  block-size: 44px;
  inline-size: 44px;

  &--visitor {
    background: rgba(var(--v-theme-primary), 0.08);
  }

  &__img {
    border-radius: 10px;
    block-size: 100%;
    inline-size: 100%;
    object-fit: cover;
  }

  &__initial {
    color: rgb(var(--v-theme-primary));
    font-size: 1.2rem;
    font-weight: 700;
  }
}

.sel-skeleton {
  border-radius: 12px;
  margin-block-end: 10px;
}

.sel-actions {
  display: flex;
  justify-content: space-between;
  margin-block-start: 16px;
}
</style>
