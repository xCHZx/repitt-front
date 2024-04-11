<script setup lang="ts">
import { createBusiness } from '@/services/business';
import { ref } from 'vue';

// Define las variables reactivas para almacenar los datos del negocio
const name = ref('');
const description = ref('');
const address = ref('');
const phone = ref('');
const segment = ref('');

// Define la función que manejará el envío del formulario
const onSubmit = async () => {
  try {
    const payload = {
      name: name.value,
      description: description.value,
      address: address.value,
      phone: phone.value,
      segment: segment.value,
    };

    // Llama a la función createBusiness para enviar los datos del negocio al servidor
    await createBusiness(payload);

    // Limpia los campos del formulario después de enviar los datos
    name.value = '';
    description.value = '';
    address.value = '';
    phone.value = '';
    segment.value = '';

    // Muestra un mensaje de éxito al usuario si es necesario
    console.log('Business created successfully!');
  } catch (error) {
    // Maneja cualquier error que pueda ocurrir durante la creación del negocio
    console.error('Error creating business:', error);
  }
};
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <VRow>
      <VCol cols="12">
        <VRow no-gutters class="align-items-center">
          <!-- 👉 Nombre negocio -->
          <VCol
            cols="1"
            md="1"
            class="d-flex align-items-center"
          >
            <VIcon
                for="name"
                icon="tabler-building-store"
            ></VIcon>
          </VCol>

          <VCol
            cols="11"
            md="11"
          >
            <AppTextField
              id="name"
              v-model="name"
              placeholder="Nombre del negocio"
              persistent-placeholder
            />
          </VCol>
        </VRow>
      </VCol>

      <VCol cols="12">
        <VRow no-gutters>
          <!-- 👉 Descripción -->
          <VCol
            cols="12"
            md="3"
            class="d-flex align-items-center"
          >
          <VIcon
                for="description"
                icon="tabler-clipboard-text"
            ></VIcon>
          </VCol>

          <VCol
            cols="12"
            md="9"
          >
            <AppTextField
              id="description"
              v-model="description"
              placeholder="Descripción"
              persistent-placeholder
            />
          </VCol>
        </VRow>
      </VCol>

      <VCol cols="12">
        <VRow no-gutters>
          <!-- 👉 Dirección -->
          <VCol
            cols="12"
            md="3"
            class="d-flex align-items-center"
          >
            <VIcon
                for="address"
                icon="tabler-gps"
            ></VIcon>
          </VCol>

          <VCol
            cols="12"
            md="9"
          >
            <AppTextField
              id="address"
              v-model="address"
              placeholder="Dirección del negocio"
              persistent-placeholder
            />
          </VCol>
        </VRow>
      </VCol>

      <VCol cols="12">
        <VRow no-gutters>
          <!-- 👉 Telefono -->
          <VCol
            cols="12"
            md="3"
            class="d-flex align-items-center"
          >
            <VIcon
                for="phone"
                icon="tabler-phone"
            ></VIcon>
          </VCol>

          <VCol
            cols="12"
            md="9"
          >
            <AppTextField
              id="phone"
              v-model="phone"
              type="number"
              placeholder="Teléfono movil"
              persistent-placeholder
            />
          </VCol>
        </VRow>
      </VCol>

      <VCol cols="12">
        <VRow no-gutters>
          <!-- 👉 Segmento -->
          <VCol
            cols="12"
            md="3"
            class="d-flex align-items-center"
          >
            <VIcon
                for="segment"
                icon="tabler-calendar-time"
            ></VIcon>
          </VCol>

          <VCol
            cols="12"
            md="9"
          >
            <AppTextField
              id="segment"
              v-model="segment"
              placeholder="Segmento"
              persistent-placeholder
            />
          </VCol>
        </VRow>
      </VCol>
     
      <!-- 👉 Crear negocio -->
      <VCol
        offset-md="3"
        cols="12"
        md="9"
        class="d-flex gap-4"
      >
        <VBtn type="submit">
          Submit
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
