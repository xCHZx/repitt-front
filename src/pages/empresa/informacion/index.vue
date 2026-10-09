<script setup lang="ts">
import BusinessAssetsCard from '@/components/business/BusinessAssetsCard.vue'
import BusinessPublishCard from '@/components/business/BusinessPublishCard.vue'
import BusinessDetails from '@/components/businesses/BusinessDetails.vue'
import { listCategories } from '@/api/endpoints/public'
import type { Category } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

// Owner view of the active business: details, publication, QR / flyer (guide §4.A.2, §4.A.3).

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const router = useRouter()
const business = useBusinessStore()
const { error, capture, reset } = useApiError()

const isLoading = ref(true)
const categories = ref<Category[]>([])

const categoryName = computed(() =>
  categories.value.find(c => c.id === business.active?.categoryId)?.name ?? null)

const isSuspended = computed(() => business.active?.moderationStatus === 'suspended')
const publicPath = computed(() => business.active ? `/n/${business.active.repittCode}` : '')

async function load() {
  reset()
  isLoading.value = true
  try {
    // null = no longer a member (404, §3.3): the store dropped it; let the guard pick the next screen
    if (!(await business.refreshActive()))
      await router.replace('/empresa')
  }
  catch (e) {
    capture(e)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  load()
  listCategories()
    .then(list => { categories.value = list })
    .catch(() => {})
})
</script>

<template>
  <div>
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

    <template v-if="isLoading && !business.active">
      <VSkeletonLoader
        type="card"
        class="mb-4 rounded-xl"
      />
      <VSkeletonLoader
        type="list-item-three-line"
        class="mb-4 rounded-xl"
      />
    </template>

    <template v-else-if="business.active">
      <VAlert
        v-if="isSuspended"
        color="error"
        variant="tonal"
        rounded="lg"
        icon="tabler-alert-triangle"
        class="mb-4"
      >
        El negocio está suspendido. Contacta a soporte.
      </VAlert>

      <BusinessDetails
        :business="business.active"
        :category-name="categoryName"
      />

      <VBtn
        block
        size="large"
        prepend-icon="tabler-edit"
        color="primary"
        class="mb-6"
        to="/empresa/editar"
      >
        Editar información
      </VBtn>

      <!-- Publicación -->
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-eye"
          size="15"
        />
        Publicación
      </div>
      <BusinessPublishCard class="mb-6" />

      <!-- Compartir -->
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-share"
          size="15"
        />
        Compartir
      </div>
      <!-- Keyed by id: if the active business changes, reload its own QR / link -->
      <BusinessAssetsCard
        :key="business.activeId ?? ''"
        :suspended="isSuspended"
        class="mb-3"
      />
      <VBtn
        v-if="business.active.isPublished"
        block
        variant="tonal"
        color="primary"
        prepend-icon="tabler-external-link"
        :href="publicPath"
        target="_blank"
        rel="noopener noreferrer"
        class="mb-4"
      >
        Ver página pública
      </VBtn>
      <div
        v-else
        class="text-caption text-medium-emphasis mb-4"
      >
        Tu página pública no se muestra mientras el negocio esté en pausa.
      </div>

      <div class="text-caption text-medium-emphasis">
        Para cerrar definitivamente tu negocio, escríbenos a soporte.
      </div>
    </template>
  </div>
</template>
