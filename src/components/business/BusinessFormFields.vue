<script setup lang="ts">
import OpeningHoursEditor from './OpeningHoursEditor.vue'
import type { BusinessFormState } from './businessForm'
import { listCategories } from '@/api/endpoints/public'
import type { Category } from '@/api/types'
import { MEXICO_TIMEZONES } from '@/utils/dates'

// Business data fields shared by create and edit (guide §4.A.1, §4.A.2).

const props = withDefaults(defineProps<{
  fieldErrors?: Record<string, string | undefined>
  disabled?: boolean
}>(), {
  fieldErrors: () => ({}),
  disabled: false,
})

const form = defineModel<BusinessFormState>({ required: true })

const categories = ref<Category[]>([])
const loadingCategories = ref(false)
const categoriesError = ref(false)

async function loadCategories() {
  loadingCategories.value = true
  categoriesError.value = false
  try {
    // Already sorted by the API: do not reorder
    categories.value = await listCategories()
  }
  catch {
    categoriesError.value = true
  }
  finally {
    loadingCategories.value = false
  }
}

const categoryItems = computed(() => categories.value.map(c => ({ title: c.name, value: c.id })))

const timezoneItems = computed(() => {
  const items: { title: string; value: string }[] = MEXICO_TIMEZONES.map(z => ({ title: z.title, value: z.value }))
  if (form.value.timezone && !items.some(z => z.value === form.value.timezone))
    items.unshift({ title: form.value.timezone, value: form.value.timezone })

  return items
})

const required = (v: unknown) => !!(typeof v === 'string' ? v.trim() : v) || 'Requerido'
const maxLen = (n: number) => (v: string) => !v || v.length <= n || `Máximo ${n} caracteres`

defineExpose({ reloadCategories: loadCategories })

onMounted(loadCategories)
</script>

<template>
  <div>
    <!-- Básico -->
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
          v-model="form.name"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-building-store"
          label="Nombre del negocio *"
          placeholder="Ej: Café Luna"
          maxlength="120"
          :disabled="props.disabled"
          :rules="[required, maxLen(120)]"
          :error-messages="props.fieldErrors.name"
          hide-details="auto"
        />
        <VSelect
          v-model="form.categoryId"
          :items="categoryItems"
          :loading="loadingCategories"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-tag"
          label="Giro del negocio *"
          :disabled="props.disabled"
          :rules="[required]"
          :error-messages="props.fieldErrors.categoryId ?? (categoriesError ? 'No pudimos cargar las categorías' : undefined)"
          hide-details="auto"
        >
          <template
            v-if="categoriesError"
            #append-item
          >
            <VListItem
              title="Reintentar"
              prepend-icon="tabler-refresh"
              @click="loadCategories"
            />
          </template>
        </VSelect>
        <VTextField
          v-model="form.description"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-text-plus"
          label="Descripción"
          placeholder="Ej: Café de especialidad"
          maxlength="1000"
          :disabled="props.disabled"
          :rules="[maxLen(1000)]"
          :error-messages="props.fieldErrors.description"
          hide-details="auto"
        />
      </VCardText>
    </VCard>

    <!-- Contacto -->
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
          v-model="form.address"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-map-pin"
          label="Dirección"
          placeholder="Ej: Av. Juárez 10, CDMX"
          maxlength="300"
          :disabled="props.disabled"
          :rules="[maxLen(300)]"
          :error-messages="props.fieldErrors.address"
          hide-details="auto"
        />
        <VTextField
          v-model="form.publicPhone"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-phone"
          label="Teléfono público"
          placeholder="Ej: 55 1234 5678"
          type="tel"
          :disabled="props.disabled"
          :error-messages="props.fieldErrors.publicPhone"
          hint="Lo verán tus clientes en tu página pública"
          hide-details="auto"
        />
        <VSelect
          v-model="form.timezone"
          :items="timezoneItems"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="tabler-world"
          label="Zona horaria *"
          :disabled="props.disabled"
          :error-messages="props.fieldErrors.timezone"
          hide-details="auto"
        />
        <slot name="after-timezone" />
      </VCardText>
    </VCard>

    <!-- Horario -->
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-clock"
        size="15"
      />
      Horario de atención
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VCardText class="pa-4">
        <OpeningHoursEditor
          v-model="form.openingHours"
          :errors="props.fieldErrors"
          :disabled="props.disabled"
        />
      </VCardText>
    </VCard>
  </div>
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
