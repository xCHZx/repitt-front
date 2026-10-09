<script setup lang="ts">
import { listCustomers } from '@/api/endpoints/crm'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import CustomerListItem from '@/components/crm/CustomerListItem.vue'
import { useListRetry } from '@/components/crm/useListRetry'
import { useCursorList } from '@/composables/useCursorList'
import { useBusinessStore } from '@/stores/business'

// CRM: customers of the business (guide §4.A.7). Server-side search, cursor pages of 100, no totals.

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const SEARCH_DEBOUNCE_MS = 600
const SEARCH_MAX_LENGTH = 100 // contract: q.maxLength

const business = useBusinessStore()

const search = ref('')
const query = ref('')
const includeTest = ref(false)
const partialPhone = ref(false)

const list = useCursorList(cursor => listCustomers(business.activeId as string, {
  q: query.value || undefined,
  cursor,
  limit: 100,
  includeTest: includeTest.value,
}))

const { items, loading, loaded, error, hasMore, isEmpty: listEmpty } = list
const { reload, loadMore, retry, showRows } = useListRetry(list)

const searchError = computed(() => error.value?.fieldErrors?.q)

// Phones only match when complete: a partial phone is not sent (it would never match, §4.A.7)
const looksLikePartialPhone = (value: string) =>
  /^[\d\s()+-]+$/.test(value) && value.replace(/\D/g, '').length < 10

let debounce: ReturnType<typeof setTimeout> | undefined

const applySearch = () => {
  clearTimeout(debounce)

  const value = (search.value ?? '').trim()

  partialPhone.value = looksLikePartialPhone(value)
  if (!partialPhone.value)
    query.value = value
}

watch(search, () => {
  clearTimeout(debounce)
  debounce = setTimeout(applySearch, SEARCH_DEBOUNCE_MS)
})

watch([query, includeTest], reload)
watch(() => business.activeId, reload)

onMounted(reload)
onBeforeUnmount(() => clearTimeout(debounce))
</script>

<template>
  <div>
    <!-- Search -->
    <div class="mb-4">
      <VTextField
        v-model="search"
        placeholder="Buscar por nombre o teléfono completo"
        variant="outlined"
        rounded="xl"
        density="comfortable"
        prepend-inner-icon="tabler-search"
        clearable
        :maxlength="SEARCH_MAX_LENGTH"
        :error-messages="searchError"
        :hint="partialPhone ? 'Escribe el teléfono completo (10 dígitos) para buscarlo' : undefined"
        :persistent-hint="partialPhone"
        :hide-details="!partialPhone && !searchError"
        @keydown.enter="applySearch"
      />
      <VSwitch
        v-model="includeTest"
        label="Incluir cliente de prueba"
        color="primary"
        density="compact"
        hide-details
        class="mt-2 px-1"
      />
    </div>

    <!-- Partial phone: nothing is searched until the 10 digits are typed -->
    <VCard
      v-if="partialPhone"
      rounded="xl"
    >
      <VCardText class="pa-8">
        <VIcon
          icon="tabler-phone"
          size="48"
          class="empty-icon mb-3"
        />
        <div class="text-body-1 font-weight-medium text-medium-emphasis">
          Escribe el teléfono completo
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Para buscar por teléfono escribe los 10 dígitos
        </div>
      </VCardText>
    </VCard>

    <template v-else>
      <ApiErrorAlert
        :error="error"
        class="mb-4"
      >
        <VBtn
          size="small"
          variant="text"
          class="mt-1 px-0"
          @click="retry"
        >
          Reintentar
        </VBtn>
      </ApiErrorAlert>

      <!-- Loading -->
      <VSkeletonLoader
        v-if="loading && !items.length"
        type="list-item-avatar-two-line@4"
        rounded="xl"
      />

      <!-- Empty state -->
      <VCard
        v-else-if="listEmpty && !error"
        rounded="xl"
      >
        <VCardText class="pa-8">
          <VIcon
            :icon="query ? 'tabler-search-off' : 'tabler-users'"
            size="48"
            class="empty-icon mb-3"
          />
          <div class="text-body-1 font-weight-medium text-medium-emphasis">
            {{ query ? 'Sin resultados' : 'Aún no hay clientes' }}
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            {{ query ? 'Prueba con otro nombre o con el teléfono completo' : 'Los clientes aparecerán aquí una vez que registres sellos' }}
          </div>
        </VCardText>
      </VCard>

      <!-- Customer list -->
      <template v-else-if="loaded && items.length && showRows">
        <VProgressLinear
          v-if="loading"
          indeterminate
          color="primary"
          rounded
          class="mb-2"
        />
        <div class="customer-list">
          <CustomerListItem
            v-for="customer in items"
            :key="customer.id"
            :customer="customer"
          />
        </div>
        <div
          v-if="hasMore"
          class="d-flex mt-4"
        >
          <VBtn
            variant="tonal"
            color="primary"
            rounded="xl"
            :loading="loading"
            @click="loadMore"
          >
            Cargar más
          </VBtn>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.customer-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.empty-icon {
  opacity: 0.4;
}
</style>
