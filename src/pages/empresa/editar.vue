<script lang="ts" setup>
import { updateBusinessAsCurrentCompany, uploadBusinessLogo } from '@/services/company/businesses'
import { getAllCategories } from '@/services/catalog/categories'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const router = useRouter()
const companyStore = useCompanyStore()

const name = ref(companyStore.selectedCompany.name ?? '')
const description = ref(companyStore.selectedCompany.description ?? '')
const address = ref(companyStore.selectedCompany.address ?? '')
const rawPhone = companyStore.selectedCompany.phone ?? ''
const phone = ref(rawPhone.startsWith('+52') ? rawPhone.slice(3) : rawPhone)
const openingHours = ref(companyStore.selectedCompany.openingHours ?? '')
const categoryId = ref(companyStore.selectedCompany.category?.id ?? null)

// --- Logo ---
const logo = ref<File[]>()
const logoPreview = ref<string | null>(null)
const existingLogo = companyStore.selectedCompany.logoPath ?? null

const onLogoChange = (files: File[]) => {
  if (!files?.length) {
    logoPreview.value = null
    return
  }
  logoPreview.value = URL.createObjectURL(files[0])
}

const logoSrc = computed(() => logoPreview.value ?? existingLogo)
const logoInitial = computed(() => String(name.value || 'R').charAt(0).toUpperCase())

// --- Categorías ---
const categoriesList = ref<{ title: string, value: any }[]>([])
const loadingCategories = ref(true)

const loadCategories = async () => {
  try {
    const response = await getAllCategories()
    categoriesList.value = response.map((c: any) => ({ title: c.name, value: c.id }))
  }
  catch {
    // silently ignore
  }
  finally {
    loadingCategories.value = false
  }
}

// --- Submit ---
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const onSubmit = async () => {
  submitError.value = null
  isSubmitting.value = true
  try {
    const businessId = companyStore.selectedCompany.id as unknown as number
    const repittCode = companyStore.selectedCompany.businessRepittCode as string

    await updateBusinessAsCurrentCompany(businessId, {
      name: name.value,
      description: description.value,
      address: address.value,
      phone: phone.value ? '+52' + phone.value : undefined,
      openingHours: openingHours.value,
      categoryId: categoryId.value,
    })

    if (logo.value?.length)
      await uploadBusinessLogo(businessId, logo.value[0])

    await companyStore.refreshCompany(repittCode)
    router.push('/empresa/informacion')
  }
  catch (e: any) {
    submitError.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <!-- Error -->
    <VAlert
      v-if="submitError"
      color="error"
      variant="tonal"
      rounded="xl"
      density="compact"
      icon="tabler-alert-triangle"
      class="mb-5"
    >
      {{ submitError }}
    </VAlert>

    <!-- Preview -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-eye"
        size="15"
      />
      Vista previa
    </div>
    <BusinessPreviewCard
      :name="name"
      :description="description"
      :category-name="categoriesList.find(c => c.value === categoryId)?.title ?? null"
      :logo-src="logoSrc"
      class="mb-6"
    />

    <!-- Información básica -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-forms"
        size="15"
      />
      Información básica
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VCardText class="pa-4 d-flex flex-column gap-4">
        <VTextField
          v-model="name"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-building-store"
          label="Nombre del negocio"
          hide-details
        />
        <VSelect
          v-model="categoryId"
          :items="categoriesList"
          :loading="loadingCategories"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-tag"
          label="Categoría"
          hide-details
        />
        <VTextField
          v-model="description"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-text-plus"
          label="Descripción"
          placeholder="Ej: La mejor cafetería del barrio"
          hide-details
        />
      </VCardText>
    </VCard>

    <!-- Contacto -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-map-pin"
        size="15"
      />
      Contacto
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VCardText class="pa-4 d-flex flex-column gap-4">
        <VTextField
          v-model="address"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-map-pin"
          label="Dirección"
          hide-details
        />
        <VTextField
          v-model="phone"
          variant="outlined"
          density="comfortable"
          label="Teléfono"
          hide-details
          class="phone-field"
          type="tel"
        >
          <template #prepend-inner>
            <span class="text-body-2 text-medium-emphasis ps-1" style="white-space: nowrap;">🇲🇽 +52</span>
            <VDivider vertical class="mx-2 my-1" />
          </template>
        </VTextField>
        <VTextField
          v-model="openingHours"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-clock"
          label="Horario de atención"
          placeholder="Ej: Lun–Vie 9:00–18:00"
          hide-details
        />
      </VCardText>
    </VCard>

    <!-- Logo -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-photo"
        size="15"
      />
      Logo
    </div>
    <VCard
      rounded="xl"
      class="mb-6"
    >
      <VCardText class="pa-4">
        <div class="d-flex align-center gap-4 mb-4">
          <VAvatar
            rounded="lg"
            size="72"
            color="primary"
            variant="tonal"
          >
            <VImg
              v-if="logoSrc"
              :src="logoSrc"
              cover
            />
            <span
              v-else
              class="text-h4 font-weight-bold"
            >{{ logoInitial }}</span>
          </VAvatar>
          <div>
            <div class="text-caption text-medium-emphasis mb-1">
              {{ logoPreview ? 'Nueva imagen seleccionada' : existingLogo ? 'Logo actual' : 'Sin logo' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              JPG, PNG o WEBP · máx. 2MB
            </div>
          </div>
        </div>
        <VFileInput
          v-model="logo"
          variant="outlined"
          density="compact"
          accept="image/jpeg,image/png,image/webp"
          label="Seleccionar imagen"
          prepend-icon="tabler-upload"
          hide-details
          :rules="[
            (files: File[]) => {
              if (!files?.length) return true
              if (files[0].size > 2 * 1024 * 1024) return 'Máx. 2MB'
              return true
            },
          ]"
          @update:model-value="onLogoChange"
        />
      </VCardText>
    </VCard>

    <!-- Submit -->
    <VBtn
      type="submit"
      block
      size="large"
      color="primary"
      :loading="isSubmitting"
    >
      Guardar cambios
    </VBtn>
  </VForm>
</template>

<style scoped>
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

<style>
.phone-field .v-field__prepend-inner {
  align-items: center;
  padding-inline-end: 0;
}
</style>
