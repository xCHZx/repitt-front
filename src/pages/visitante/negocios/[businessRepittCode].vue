<script setup lang="ts">
import { getBusinessByRepittCodeAsVisitor } from '@/services/visitor/business'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
  },
})

const router = useRouter()
const route: any = useRoute()

const data: any = ref(null)
const isLoading = ref(true)

const getData = async () => {
  try {
    data.value = await getBusinessByRepittCodeAsVisitor(route.params.businessRepittCode)
  }
  catch {
    router.push('/auth/login')
  }
  finally {
    isLoading.value = false
  }
}

const heroColor = computed(() => {
  const card = data.value?.stampCards?.find((sc: any) => sc.isActive) ?? data.value?.stampCards?.[0]
  return card?.primaryColor || '#6C3CE1'
})

const heroStyle = computed(() => ({
  background: `linear-gradient(145deg, ${heroColor.value}ee 0%, ${heroColor.value}99 100%)`,
}))

const activeStampCards = computed(() =>
  (data.value?.stampCards ?? []).filter((sc: any) => sc.isActive),
)

onMounted(() => {
  getData()
})
</script>

<template>
  <div class="biz-page">
    <!-- ── Loading ─────────────────────────────── -->
    <template v-if="isLoading">
      <VSkeletonLoader
        type="image"
        height="200"
        class="rounded-0"
      />
      <div class="px-5 pt-0">
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
            class="mb-2"
          />
          <VSkeletonLoader
            type="chip"
            width="100"
            class="mb-5"
          />
        </div>
        <VSkeletonLoader
          type="list-item-three-line"
          rounded="xl"
          class="mb-4"
        />
        <VSkeletonLoader
          type="card"
          rounded="xl"
          class="mb-4"
        />
      </div>
    </template>

    <!-- ── Content ─────────────────────────────── -->
    <template v-else-if="data">
      <!-- Hero -->
      <div
        class="biz-hero"
        :style="heroStyle"
      >
        <div class="biz-hero__dots" />
      </div>

      <!-- Identity -->
      <div class="biz-identity px-5">
        <VAvatar
          class="biz-avatar"
          size="88"
          rounded="xl"
          color="white"
        >
          <VImg
            v-if="data.logoPath"
            :src="data.logoPath"
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

        <div class="d-flex flex-wrap justify-center gap-2 mb-3">
          <VChip
            v-if="data.category?.name"
            size="small"
            variant="flat"
            :style="{ background: `${heroColor}20`, color: heroColor }"
          >
            {{ data.category.name }}
          </VChip>
          <VChip
            v-if="!data.isActive"
            size="small"
            color="error"
            variant="tonal"
            prepend-icon="tabler-circle-x"
          >
            Inactivo
          </VChip>
        </div>

        <p
          v-if="data.description"
          class="text-body-2 text-medium-emphasis text-center mb-0"
        >
          {{ data.description }}
        </p>
      </div>

      <!-- Contact -->
      <div
        v-if="data.address || data.phone || data.openingHours"
        class="px-4 mt-5"
      >
        <VCard rounded="xl">
          <VList density="compact">
            <VListItem
              v-if="data.address"
              prepend-icon="tabler-map-pin"
            >
              <VListItemTitle class="text-body-2">
                {{ data.address }}
              </VListItemTitle>
            </VListItem>
            <VDivider v-if="data.address && data.phone" />
            <VListItem
              v-if="data.phone"
              prepend-icon="tabler-phone"
            >
              <VListItemTitle class="text-body-2">
                {{ data.phone }}
              </VListItemTitle>
            </VListItem>
            <VDivider v-if="data.phone && data.openingHours" />
            <VListItem
              v-if="data.openingHours"
              prepend-icon="tabler-clock"
            >
              <VListItemTitle class="text-body-2">
                {{ data.openingHours }}
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </div>

      <!-- Stamp cards -->
      <div
        v-if="data.isActive && activeStampCards.length"
        class="px-4 mt-6"
      >
        <div class="section-label mb-3">
          <VIcon
            icon="tabler-award"
            size="15"
          />
          Programas de fidelidad
          <VChip
            size="x-small"
            variant="flat"
            class="ms-1"
            :style="{ background: `${heroColor}20`, color: heroColor }"
          >
            {{ activeStampCards.length }}
          </VChip>
        </div>

        <StampCardListItemAsBusiness
          v-for="sc in activeStampCards"
          :key="sc.id"
          :name="sc.name"
          :reward="sc.reward"
          :required-stamps="sc.requiredStamps"
          :stamp-icon="sc.stampIconPath"
          :primary-color="sc.primaryColor"
          :is-active="sc.isActive"
          class="mb-3"
        />
      </div>

      <!-- CTA -->
      <div
        v-if="data.isActive"
        class="px-4 mt-4 pb-6"
      >
        <VBtn
          block
          size="x-large"
          :style="{ background: heroColor }"
          rounded="xl"
          append-icon="tabler-award-filled"
          @click="router.push('/auth/registro')"
        >
          ¡Quiero mis recompensas!
        </VBtn>
      </div>

      <!-- Powered by -->
      <div class="text-center pb-8 pt-2">
        <span
          class="text-caption text-disabled"
          style="font-size: 0.7rem;"
        >
          Powered by Repitt
        </span>
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
