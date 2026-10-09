<script setup lang="ts">
import OpeningHoursList from '@/components/business/OpeningHoursList.vue'
import PublicCardItem from '@/components/business/PublicCardItem.vue'
import { getPublicBusiness } from '@/api/endpoints/public'
import type { PublicBusiness } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// Public business page (guide §4.A.4). Also reached from the business QR `/n/:repittCode`.
// 404 (unpublished, suspended, archived or old code) → "not available"; never redirect to login.

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute('visitante-negocios-business-repitt-code')
const session = useSessionStore()
const { error, capture, reset } = useApiError()

const data = ref<PublicBusiness | null>(null)
const isLoading = ref(true)
const notFound = ref(false)

const phoneHref = computed(() => data.value?.publicPhone ? `tel:${data.value.publicPhone.replace(/\s+/g, '')}` : undefined)

async function load() {
  const code = route.params.businessRepittCode

  // The param goes undefined while leaving the page: do not fetch "undefined"
  if (typeof code !== 'string' || !code)
    return

  reset()
  notFound.value = false
  isLoading.value = true
  try {
    data.value = await getPublicBusiness(code)
  }
  catch (e) {
    const err = capture(e)
    if (err.error.status === 404) {
      notFound.value = true
      reset()
    }
  }
  finally {
    isLoading.value = false
  }
}

watch(() => route.params.businessRepittCode, load, { immediate: true })
</script>

<template>
  <div class="biz-page">
    <!-- Loading -->
    <template v-if="isLoading">
      <div class="biz-hero section--tono">
        <div class="biz-content">
          <VSkeletonLoader
            type="avatar"
            class="mb-4"
            width="88"
            height="88"
          />
          <VSkeletonLoader
            type="heading"
            width="220"
          />
        </div>
      </div>
      <div class="biz-content pt-5">
        <VSkeletonLoader
          type="list-item-three-line"
          class="mb-4 rounded-xl"
        />
      </div>
    </template>

    <!-- Not available -->
    <div
      v-else-if="notFound"
      class="biz-empty"
    >
      <VIcon
        icon="tabler-building-store"
        size="56"
        color="medium-emphasis"
      />
      <h1 class="titulo-display">
        Negocio no disponible
      </h1>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Este negocio no está disponible por ahora o el código ya no es válido.
      </p>
      <VBtn
        color="primary"
        :to="session.isAuthenticated ? '/visitante' : '/auth/login'"
      >
        {{ session.isAuthenticated ? 'Ver mi cartera' : 'Ir a Repitt' }}
      </VBtn>
    </div>

    <!-- Other errors -->
    <div
      v-else-if="error"
      class="pa-4"
    >
      <ApiErrorAlert :error="error">
        <VBtn
          size="small"
          variant="text"
          class="mt-1 px-0"
          @click="load"
        >
          Reintentar
        </VBtn>
      </ApiErrorAlert>
    </div>

    <!-- Content -->
    <template v-else-if="data">
      <!-- Identity: banda tonal con tapete de puntos -->
      <div class="biz-hero section--tono dots">
        <div class="biz-content">
          <VAvatar
            class="biz-avatar"
            size="88"
            rounded="lg"
          >
            <VImg
              v-if="data.logoUrl"
              :src="data.logoUrl"
              cover
            />
            <span
              v-else
              class="cifra"
            >
              {{ String(data.name || 'R').charAt(0).toUpperCase() }}
            </span>
          </VAvatar>

          <h1 class="titulo-display mt-4 mb-3">
            {{ data.name }}
          </h1>

          <VChip size="small">
            {{ data.category.name }}
          </VChip>
        </div>
      </div>

      <div class="biz-content">
        <p
          v-if="data.description"
          class="text-body-1 medida mt-5 mb-0"
        >
          {{ data.description }}
        </p>

        <!-- Contact -->
        <VCard
          v-if="data.address || data.publicPhone || data.openingHours"
          rounded="xl"
          class="mt-5"
        >
          <VList density="compact">
            <VListItem
              v-if="data.address"
              prepend-icon="tabler-map-pin"
            >
              <VListItemTitle class="text-body-2 text-wrap">
                {{ data.address }}
              </VListItemTitle>
            </VListItem>
            <VListItem
              v-if="data.publicPhone"
              prepend-icon="tabler-phone"
              :href="phoneHref"
            >
              <VListItemTitle class="text-body-2">
                {{ data.publicPhone }}
              </VListItemTitle>
            </VListItem>
          </VList>
          <template v-if="data.openingHours">
            <VDivider />
            <VCardText class="pa-4">
              <div class="d-flex align-center gap-2 mb-2 text-body-2 font-weight-medium">
                <VIcon
                  icon="tabler-clock"
                  size="18"
                />
                Horario
              </div>
              <OpeningHoursList :hours="data.openingHours" />
            </VCardText>
          </template>
        </VCard>

        <!-- Cards -->
        <div
          v-if="data.cards.length"
          class="mt-6"
        >
          <div class="section-label mb-3">
            <VIcon
              icon="tabler-award"
              size="15"
            />
            Programas de lealtad
          </div>
          <PublicCardItem
            v-for="card in data.cards"
            :key="card.id"
            :card="card"
            class="mb-3"
          />
        </div>

        <!-- CTA -->
        <div class="mt-4 pb-6">
          <VBtn
            block
            size="x-large"
            :append-icon="session.isAuthenticated ? 'tabler-wallet' : 'tabler-award-filled'"
            :to="session.isAuthenticated ? '/visitante' : '/auth/login'"
          >
            {{ session.isAuthenticated ? 'Ver mi cartera' : 'Únete con tu teléfono' }}
          </VBtn>
          <p
            v-if="!session.isAuthenticated"
            class="note mt-2 mb-0"
          >
            Muestra tu QR en el mostrador para empezar a juntar sellos.
          </p>
        </div>

        <p class="note pb-8 pt-2 mb-0">
          Con tecnología de Repitt
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.biz-page {
  background: var(--fondo);
  min-block-size: 100vh;
}

.biz-hero {
  padding-block: var(--s-6);
}

.biz-content {
  margin-inline: auto;
  max-inline-size: 600px;
  padding-inline: var(--margen);
}

.biz-avatar {
  border: 1px solid var(--linea);
  background: var(--superficie);
  color: var(--texto);
}

.biz-empty {
  display: grid;
  align-content: center;
  gap: var(--s-5);
  justify-items: start;
  margin-inline: auto;
  max-inline-size: 600px;
  min-block-size: 100vh;
  padding-inline: var(--margen);
}
</style>
