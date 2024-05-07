<script lang="ts" setup>
import { createStampCardAsCompany } from '@/services/company/stampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const name = ref('')
const description = ref('')
const requiredStamps = ref()
const startDate = ref('')
const endDate = ref('')
const stampIcon = ref<File[]>()
const reward = ref('')

const companyStore = useCompanyStore()

const submit = () => {
  console.log('Creating StampCard...')

  const payload = {
    name: name.value,
    description: description.value,
    required_stamps: requiredStamps.value,
    start_date: startDate.value,
    end_date: endDate.value,
    business_id: companyStore.selectedCompany.id,
    reward: reward.value,
    stamp_icon_file: stampIcon.value && stampIcon.value.length > 0 ? stampIcon.value[0] : null,
  }

  // Call API to create StampCard
  try {
    createStampCardAsCompany(payload)
  }
  catch (error) {
    console.error('Error creating StampCard:', error)
  }
}

onMounted(() => {

})
</script>

<template>
  <div>
    <div class="text-h4 font-weight-bold">
      Crear Tarjeta para <span class="text-primary">{{ companyStore.selectedCompany.name || '???' }}</span>
    </div>
  </div>

  <div>
    <VForm @submit.prevent="submit">
      <VCol cols="12">
        <VTextField
          v-model="name"
          variant="outlined"
          prepend-icon="tabler-building-store"
          label="Nombre del Negocio *"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="description"
          variant="outlined"
          prepend-icon="tabler-text-plus"
          label="Descripción"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="requiredStamps"
          type="number"
          variant="outlined"
          prepend-icon="tabler-rubber-stamp"
          label="Visitas requeridas para la recompensa *"
          placeholder="..."
        />
      </VCol>

      <VCol cols="12">
        <VTextField
          v-model="reward"
          variant="outlined"
          prepend-icon="tabler-gift"
          label="Recompensa *"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VFileInput
          v-model="stampIcon"
          chips
          show-size
          accept="image/*"
          placeholder="..."
          prepend-icon="tabler-sticker"
          label="Icono de sello"
        />
      </VCol>
      <VRow class="mt-2 px-3 border rounded">
        <VCol
          cols="12"
          md="6"
        >
          <AppDateTimePicker
            v-model="startDate"
            label="Fecha de Inicio de Vigencia *"
            placeholder="Fecha de Inicio de Vigencia *"
            prepend-icon="tabler-calendar"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppDateTimePicker
            v-model="endDate"
            label="Fecha de Fin de Vigencia"
            placeholder="Fecha de Fin de Vigencia"
            prepend-icon="tabler-calendar-off"
          />
        </VCol>
      </VRow>
      <VCol cols="12">
        <VBtn
          type="submit"
          color="primary"
          class="mt-3"
        >
          Crear
        </VBtn>
      </VCol>
    </VForm>
  </div>
</template>
