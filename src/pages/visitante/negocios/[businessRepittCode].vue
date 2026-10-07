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

const heroColor = computed(() => data.value?.cards[0]?.primaryColor || '#6C3CE1')

const heroStyle = computed(() => ({
  background: `linear-gradient(145deg, ${heroColor.value}ee 0%, ${heroColor.value}99 100%)`,
}))

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
      <VSkeletonLoader
        type="image"
        height="180"
        class="rounded-0"
      />
      <div class="px-5">
        <div class="d-flex flex-column align-center">
          <VSkeletonLoader
            type="avatar"
            class="mt-n10 mb-4"
            width="88"
            height="88"
          />
          <VSkeletonLoader
            type="heading"
            width="180"
            class="mb-5"
          />
        </div>
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
        color="secondary"
        class="mb-4"
      />
      <h1 class="text-h5 font-weight-bold mb-2">
        Negocio no disponible
      </h1>
      <p class="text-body-2 text-medium-emphasis mb-6">
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
      <div
        class="biz-hero"
        :style="heroStyle"
      >
        <div class="biz-hero__dots" />
      </div>

      <div class="biz-content">
        <!-- Identity -->
        <div class="biz-identity px-1">
          <VAvatar
            class="biz-avatar"
            size="88"
            rounded="xl"
            color="white"
          >
            <VImg
              v-if="data.logoUrl"
              :src="data.logoUrl"
              cover
            />
            <span
              v-else
              class="text-h3 font-weight-bold"
              :style="{ color: heroColor }"
            >
              {{ String(data.name || 'R').charAt(0).toUpperCase() }}
            </span>
          </VAvatar>

          <h1 class="text-h5 font-weight-bold mt-3 mb-2 text-center">
            {{ data.name }}
          </h1>

          <VChip
            size="small"
            variant="flat"
            class="mb-3"
            :style="{ background: `${heroColor}20`, color: heroColor }"
          >
            {{ data.category.name }}
          </VChip>

          <p
            v-if="data.description"
            class="text-body-2 text-medium-emphasis text-center mb-0"
          >
            {{ data.description }}
          </p>
        </div>

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
            rounded="xl"
            class="text-white"
            :style="{ background: heroColor }"
            :append-icon="session.isAuthenticated ? 'tabler-wallet' : 'tabler-award-filled'"
            :to="session.isAuthenticated ? '/visitante' : '/auth/login'"
          >
            {{ session.isAuthenticated ? 'Ver mi cartera' : 'Únete con tu teléfono' }}
          </VBtn>
          <p
            v-if="!session.isAuthenticated"
            class="text-caption text-medium-emphasis text-center mt-2 mb-0"
          >
            Muestra tu QR en el mostrador para empezar a juntar sellos.
          </p>
        </div>
      </div>

      <div class="text-center pb-8 pt-2">
        <span class="text-caption text-disabled">Con tecnología de Repitt</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.biz-page {
  background: rgb(var(--v-theme-background));
  min-block-size: 100vh;
}

.biz-hero {
  position: relative;
  overflow: hidden;
  block-size: 180px;
}

.biz-hero__dots {
  position: absolute;
  background-image: radial-gradient(circle, rgba(255 255 255 / 18%) 1px, transparent 1px);
  background-size: 22px 22px;
  inset: 0;
}

.biz-content {
  margin-inline: auto;
  max-inline-size: 600px;
  padding-inline: 16px;
}

.biz-identity {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-block-start: -44px;
}

.biz-avatar {
  box-shadow: 0 4px 24px rgba(0 0 0 / 18%);
}

.biz-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-inline: auto;
  max-inline-size: 420px;
  min-block-size: 100vh;
  padding-inline: 24px;
  text-align: center;
}

.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
