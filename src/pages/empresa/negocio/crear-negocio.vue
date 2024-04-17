<script setup lang="ts">
import { createBusiness } from '@/services/business'

const name = ref('')
const description = ref('')
const address = ref('')
const phone = ref('')
const segment = ref('')
const openingHours = ref('')
const logo = ref()

const items = ['item1', 'item2', 'item3']

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
  createBusiness(payload)
}
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
          label="Nombre del negocio"
          placeholder="..."
          :rules="[requiredValidator]"
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
          placeholder="1234567890"
          type="tel"
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
        <VSelect
          v-model="segment"
          :items="items"
          label="Giro del Negocio"
          placeholder="Selecciona"
          prepend-icon="tabler-map"
          :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="12">
        <VFileInput
          v-model="logo"
          prepend-inner-icon="tabler-file-filled"
          prepend-icon="tabler-upload"
          accept="image/*"
          label="Logo del negocio"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VBtn
          block
          color="primary"
          @click="createBusiness"
        >
          Crear negocio
        </VBtn>
      </VCol>
    </VForm>
  </div>
</template>
