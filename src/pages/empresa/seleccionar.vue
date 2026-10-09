<script lang="ts" setup>
import BusinessSelectItem from '@/components/business/BusinessSelectItem.vue'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

// Business selector (guide §3.1): businesses where the user is an active member, owner first.

definePage({
  meta: {
    layout: 'blank',
    area: 'business',
    needsBusiness: false,
  },
})

const router = useRouter()
const business = useBusinessStore()
const session = useSessionStore()
const { error, capture, reset } = useApiError()

const isLoading = ref(true)
const isLoggingOut = ref(false)

async function load() {
  reset()
  isLoading.value = true
  try {
    await business.load()
  }
  catch (e) {
    capture(e)
  }
  finally {
    isLoading.value = false
  }
}

function choose(id: string) {
  business.select(id)
  router.push('/empresa')
}

async function logout() {
  isLoggingOut.value = true
  await session.logout()
  isLoggingOut.value = false
  await router.push('/auth/login')
}

onMounted(load)
</script>

<template>
  <div class="sel-page">
    <div class="sel-inner">
      <!-- Brand -->
      <div class="sel-brand">
        <img
          src="@images/logo-v2.png"
          alt="Repitt"
          class="brand-logo"
        >
      </div>

      <h1
        v-if="session.me?.firstName"
        class="titulo-display mb-3"
      >
        Hola, {{ session.me.firstName }}
      </h1>
      <p class="lead text-medium-emphasis mb-5">
        ¿Con qué negocio quieres continuar?
      </p>

      <ApiErrorAlert
        :error="error"
        class="mb-4"
      >
        <VBtn
          size="small"
          variant="text"
          class="mt-1 px-0"
          @click="load"
        >
          Reintentar
        </VBtn>
      </ApiErrorAlert>

      <template v-if="isLoading">
        <VSkeletonLoader
          v-for="i in 2"
          :key="i"
          type="list-item-avatar"
          class="sel-skeleton"
        />
      </template>

      <template v-else-if="!error">
        <div class="section-label mb-2">
          <VIcon
            icon="tabler-building-store"
            size="16"
          />
          Tus negocios
        </div>

        <BusinessSelectItem
          v-for="b in business.businesses"
          :key="b.id"
          :business="b"
          :selected="b.id === business.activeId"
          class="mb-3"
          @click="choose(b.id)"
        />

        <div
          v-if="!business.businesses.length"
          class="text-body-2 text-medium-emphasis mb-4"
        >
          Ya no formas parte de ningún negocio.
        </div>

        <VBtn
          v-if="session.hasPassword"
          block
          variant="tonal"
          color="primary"
          prepend-icon="tabler-plus"
          class="mt-2"
          to="/empresa/crear"
        >
          Crear otro negocio
        </VBtn>
      </template>

      <div class="sel-actions">
        <VBtn
          variant="text"
          color="primary"
          size="small"
          prepend-icon="tabler-wallet"
          to="/visitante"
        >
          Ir a mi cartera
        </VBtn>

        <VBtn
          variant="text"
          color="secondary"
          size="small"
          prepend-icon="tabler-logout"
          :loading="isLoggingOut"
          @click="logout"
        >
          Cerrar sesión
        </VBtn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sel-page {
  background: var(--fondo);
  min-block-size: 100vh;
  padding-block: var(--s-6);
  padding-inline: var(--s-4);
}

.sel-inner {
  margin-inline: auto;
  max-inline-size: 600px;
}

.sel-brand {
  margin-block-end: var(--s-5);
}

.brand-logo {
  display: block;
  block-size: auto;
  inline-size: 140px;
}

.sel-skeleton {
  border-radius: var(--r-control);
  margin-block-end: var(--s-3);
}

.sel-actions {
  display: flex;
  justify-content: space-between;
  margin-block-start: var(--s-5);
}
</style>
