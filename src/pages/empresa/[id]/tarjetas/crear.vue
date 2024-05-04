<script lang="ts" setup>
import { createBusinessAsCompany } from '@/services/company/businesses'
import { getAllSegments } from '@/services/company/segments'

const name = ref('')
const description = ref('')
const requiredStamps = ref(0)
const startDate = ref('')
const endDate = ref('')
const stampIcon = ref()
const reward = ref('')
const business = ref('')

// const logoFile = ref()

const segmentsList = ref(
  [
    {
      title: 'Cargando segmentos...',
      value: null,
    },
  ],
)

const getSegments = async () => {
  try {
    const response = await getAllSegments()

    segmentsList.value = response.map((segmentItem: any) => ({
      title: segmentItem.name,
      value: segmentItem.id,
    }))
  }
  catch (error) {
    console.error('Error getting segments:', error)
  }
}

const submit = () => {
  console.log('Creating business...')

  const payload = {
    name: name.value,
    description: description.value,
    requiredStamps: requiredStamps.value,
    startDate: startDate.value,
    endDate: endDate.value,
    stampIcon: stampIcon.value,
    reward: reward.value,
    business: business.value,
  }

  console.log('Payload:', payload)

  // Call API to create business
  createBusinessAsCompany(payload)
}

onMounted(() => {
  getSegments()
})
</script>

<template>
  <div>
    <h2>Crear Tarjeta para <span class="text-primary">{{ business || '???' }}</span></h2>
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
