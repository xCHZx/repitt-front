<script lang="ts" setup>
import { createBusinessAsCompany, uploadBusinessLogo } from '@/services/company/businesses'
import { getAllCategories } from '@/services/catalog/categories'
import { createCheckoutSession } from '@/services/subscription/subscription'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const router = useRouter()

const isSubmitting = ref(false)
const errorMsg = ref('')

const name = ref('')
const description = ref('')
const address = ref('')
const phone = ref('')
const openingHours = ref('')
const segment = ref<number | null>(null)
const logo = ref<File[]>()

const categoriesList = ref([{ title: 'Cargando categorías...', value: null as any }])

const loadCategories = async () => {
  try {
    const response = await getAllCategories()

    categoriesList.value = response.map((c: any) => ({
      title: c.name,
      value: c.id,
    }))
  }
  catch {
    // silently ignore
  }
}

const onSubmit = async () => {
  isSubmitting.value = true
  errorMsg.value = ''
  try {
    const newBusiness = await createBusinessAsCompany({
      name: name.value,
      categoryId: segment.value,
      description: description.value || undefined,
      address: address.value || undefined,
      phone: phone.value ? '+52' + phone.value : undefined,
      openingHours: openingHours.value || undefined,
    })

    if (logo.value && logo.value.length > 0)
      await uploadBusinessLogo(newBusiness.id, logo.value[0])

    const { url } = await createCheckoutSession(newBusiness.id, 'premium')
    window.location.href = url
  }
  catch (error: any) {
    errorMsg.value = Array.isArray(error) ? error.join('\n') : String(error)
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <!-- ─── Básico ──────────────────────────────────────────── -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-building-store"
        size="15"
      />
      Tu negocio
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
          label="Nombre del negocio *"
          placeholder="Ej: Mi Café"
          hide-details="auto"
          :rules="[v => !!v || 'Requerido']"
        />
        <VSelect
          v-model="segment"
          :items="categoriesList"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-tag"
          label="Giro del negocio *"
          hide-details="auto"
          :rules="[v => !!v || 'Requerido']"
        />
        <VTextField
          v-model="description"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-text-plus"
          label="Descripción"
          placeholder="Ej: Cafetería de especialidad en el centro"
          hide-details
        />
      </VCardText>
    </VCard>

    <!-- ─── Contacto y ubicación ───────────────────────────── -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-map-pin"
        size="15"
      />
      Contacto y ubicación
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
          placeholder="Ej: Av. Reforma 100, CDMX"
          hide-details
        />
        <VTextField
          v-model="phone"
          variant="outlined"
          density="comfortable"
          class="phone-field"
          label="Teléfono"
          type="tel"
          placeholder="1234567890"
          hide-details
        >
          <template #prepend-inner>
            <span class="text-body-2 text-medium-emphasis ps-1" style="white-space: nowrap;">🇲🇽 +52</span>
            <VDivider
              vertical
              class="mx-2 my-1"
            />
          </template>
        </VTextField>
        <VTextField
          v-model="openingHours"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-clock"
          label="Horario de atención"
          placeholder="Ej: Lun-Vie 9:00–18:00"
          hide-details
        />
      </VCardText>
    </VCard>

    <!-- ─── Logo ───────────────────────────────────────────── -->
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
        <VFileInput
          v-model="logo"
          variant="outlined"
          density="comfortable"
          accept="image/*"
          label="Sube tu logo (opcional)"
          prepend-inner-icon="tabler-photo-up"
          prepend-icon=""
          hide-details
        />
      </VCardText>
    </VCard>

    <!-- ─── Error ───────────────────────────────────────────── -->
    <VAlert
      v-if="errorMsg"
      color="error"
      variant="tonal"
      rounded="xl"
      density="compact"
      icon="tabler-alert-triangle"
      class="mb-4"
    >
      {{ errorMsg }}
    </VAlert>

    <!-- ─── Submit ─────────────────────────────────────────── -->
    <VBtn
      type="submit"
      block
      size="large"
      color="primary"
      rounded="lg"
      :loading="isSubmitting"
    >
      <VIcon
        icon="tabler-arrow-right"
        end
      />
      Crear negocio
    </VBtn>

    <p class="legal-note">
      Al continuar serás redirigido a Stripe para activar tu suscripción.
    </p>
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

.legal-note {
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-size: 0.78rem;
  margin-block-start: 12px;
  text-align: center;
}
</style>

<style>
.phone-field .v-field__prepend-inner {
  align-items: center;
  padding-inline-end: 0;
}
</style>
