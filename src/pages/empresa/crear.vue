<script lang="ts" setup>
import { createBusinessAsCompany } from '@/services/company/businesses'
import { getAllSegments } from '@/services/company/segments'

const name = ref('')
const description = ref('')
const address = ref('')
const phone = ref('')
const openingHours = ref('')
const segment = ref('')
const logo = ref()

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

// const convertLogoToBase64String = async (file: Blob) => {
//   const reader = new FileReader()

//   reader.onload = () => {
//     logo.value = reader.result
//   }

//   reader.readAsDataURL(file)
// }

// watch(logoFile, newFile => {
//   if (newFile)
//     convertLogoToBase64String(logoFile.value[0])
// })

const submit = () => {
  console.log('Creating business...')

  const payload = {
    name: name.value,
    description: description.value,
    address: address.value,
    phone: phone.value,
    segment: segment.value,
    openingHours: openingHours.value,
    logo: logo.value,
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
    <h1>Crear Negocio</h1>
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
        <VSelect
          v-model="segment"
          :items="segmentsList"
          label="Giro del Negocio *"
          prepend-icon="tabler-tag"
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
          v-model="address"
          variant="outlined"
          prepend-icon="tabler-map-pin"
          label="Dirección"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="phone"
          variant="outlined"
          prepend-icon="tabler-phone"
          label="Teléfono"
          placeholder="..."
        />
      </VCol>

      <VCol cols="12">
        <VTextField
          v-model="openingHours"
          variant="outlined"
          prepend-icon="tabler-clock"
          label="Horario de atención"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VFileInput
          v-model="logo"
          chips
          show-size
          accept="image/*"
          placeholder="..."
          prepend-icon="tabler-photo-up"
          label="Logo"
        />
      </VCol>
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
