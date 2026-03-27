<script setup lang="ts">
import { useCompanyStore } from '@/stores/company'

interface Props {
  businesses: any[]
  user: any
}

defineProps<Props>()

const model = defineModel<boolean>()
const companyStore = useCompanyStore()
const router = useRouter()

const selectedCode = computed(() => companyStore.selectedCompany.businessRepittCode)

const goToBusiness = (business: any) => {
  companyStore.selectCompany(business)
  router.push('/empresa/')
  model.value = false
}

const goToVisitorProfile = () => {
  router.push('/visitante')
  model.value = false
}

const goToCreateBusiness = () => {
  router.push('/empresa/crear')
  model.value = false
}
</script>

<template>
  <VDialog
    v-model="model"
    max-width="520"
    transition="dialog-bottom-transition"
    class="cambiar-perfil-dialog"
  >
    <VCard rounded="xl">
      <!-- Handle bar -->
      <div class="handle-wrap">
        <div class="handle-bar" />
      </div>

      <!-- Header -->
      <div class="d-flex align-center justify-space-between px-5 pb-3">
        <span class="text-h6 font-weight-bold">Cambiar de perfil</span>
        <VBtn
          icon
          size="small"
          variant="text"
          @click="model = false"
        >
          <VIcon
            icon="tabler-x"
            size="18"
          />
        </VBtn>
      </div>

      <div class="px-4 pb-6">
        <!-- Section: Mis Negocios -->
        <div class="section-label mb-2">
          <VIcon
            icon="tabler-building-store"
            size="13"
            color="primary"
          />
          Mis Negocios
        </div>

        <div class="d-flex flex-column gap-2 mb-5">
          <VCard
            v-for="business in businesses"
            :key="business.businessRepittCode"
            rounded="xl"
            :style="{
              borderInlineStart: '4px solid rgb(var(--v-theme-primary))',
              background: 'rgb(var(--v-theme-surface))',
              outline: business.businessRepittCode === selectedCode
                ? '2px solid rgb(var(--v-theme-primary))'
                : 'none',
              cursor: 'pointer',
            }"
            @click="goToBusiness(business)"
          >
            <VCardText class="pa-3">
              <div class="d-flex align-center gap-3">
                <VAvatar
                  rounded="lg"
                  size="40"
                  color="primary"
                  variant="tonal"
                >
                  <VImg
                    v-if="business.logoPath"
                    :src="business.logoPath"
                  />
                  <span
                    v-else
                    class="text-body-1 font-weight-bold"
                  >
                    {{ String(business.name || 'R').charAt(0).toUpperCase() }}
                  </span>
                </VAvatar>

                <div class="flex-grow-1 overflow-hidden">
                  <div class="text-body-2 font-weight-bold text-truncate">
                    {{ business.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ business.category?.name }}
                  </div>
                </div>

                <div class="d-flex flex-column align-end gap-1">
                  <VChip
                    :color="business.isActive ? 'success' : 'default'"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ business.isActive ? 'Activo' : 'Inactivo' }}
                  </VChip>
                  <VIcon
                    v-if="business.businessRepittCode === selectedCode"
                    icon="tabler-circle-check-filled"
                    color="primary"
                    size="16"
                  />
                </div>
              </div>
            </VCardText>
          </VCard>
        </div>

        <!-- Section: Visitante -->
        <VDivider class="mb-4" />

        <div class="section-label mb-2">
          <VIcon
            icon="tabler-user-heart"
            size="13"
            color="primary"
          />
          Perfil de Visitante
        </div>

        <VCard
          rounded="xl"
          :style="{
            background: 'rgb(var(--v-theme-surface))',
            cursor: 'pointer',
          }"
          @click="goToVisitorProfile"
        >
          <VCardText class="pa-3">
            <div class="d-flex align-center gap-3">
              <VAvatar
                rounded="lg"
                size="40"
                color="primary"
                variant="tonal"
              >
                <VIcon
                  icon="tabler-user-heart"
                  size="20"
                />
              </VAvatar>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-body-2 font-weight-bold text-truncate">
                  {{ user?.firstName || 'Visitante' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ user?.repittCode }}
                </div>
              </div>
              <VIcon
                icon="tabler-chevron-right"
                size="18"
                class="text-medium-emphasis"
              />
            </div>
          </VCardText>
        </VCard>

        <!-- Crear nuevo negocio -->
        <VBtn
          block
          variant="tonal"
          color="primary"
          rounded="xl"
          prepend-icon="tabler-plus"
          class="mt-4"
          @click="goToCreateBusiness"
        >
          Crear nuevo negocio
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<style scoped>
.handle-wrap {
  display: flex;
  justify-content: center;
  padding-block: 12px 8px;
}

.handle-bar {
  border-radius: 4px;
  background: rgba(var(--v-theme-on-surface), 0.12);
  block-size: 4px;
  inline-size: 36px;
}

.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 600;
  gap: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
