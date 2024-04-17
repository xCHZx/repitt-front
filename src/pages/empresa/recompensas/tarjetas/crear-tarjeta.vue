<script setup lang="ts">
import { ref } from 'vue'
import { VCol } from 'vuetify/lib/components/index.mjs'
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue'
import { createStampcard } from '@/services/rewards'

const name = ref('')
const description = ref('')
const address = ref('')
const phone = ref('')
const segment = ref('')

const onSubmit = async () => {
  try {
    const payload = {
      name: name.value,
      description: description.value,
      address: address.value,
      phone: phone.value,
      segment: segment.value,
    }

    // Envio al back
    await createStampcard(payload)

    // Limpia los campos
    name.value = ''
    description.value = ''
    address.value = ''
    phone.value = ''
    segment.value = ''

    // Funca
    console.log('Business created successfully!')
  }
  catch (error) {
    // Se jodio todo
    console.error('Error creating business:', error)
  }
}

const ruleName = [(v: string) => v.length <= 25 || 'Te recomendamos no exceder los 25 caracteres']
const ruleDescription = [(v: string) => v.length <= 40 || 'Utiliza una descripción más corta']
</script>

<template>
  <VCard color="pink-darken-2">
    <VCardItem class="justify-center">
      <VCardTitle class="font-weight-bold text-capitalize text-h5 py-1">
        Crear Recompensa
      </VCardTitle>
    </VCardItem>

    <VCardText>
      <VForm @submit.prevent="onSubmit">
        <VRow>
          <VCol cols="12">
            <VRow
              no-gutters
              class="align-items-center"
            >
              <!-- 👉 Nombre de recompensa -->
              <VCol cols="12">
                <AppTextField
                  id="name"
                  v-model="name"
                  :rules="ruleName"
                  placeholder="Recompensa"
                  prepend-icon="tabler-building-store"
                  persistent-placeholder
                />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12">
            <VFileInput
              label="Sube la imagen de tu recompensa"
              prepend-icon="tabler-camera"
              accept="image/png, image/jpeg, image/bmp"
            />
          </VCol>

          <VCol cols="12">
            <VRow no-gutters>
              <!-- 👉 Descripción -->
              <VCol cols="12">
                <AppTextarea
                  id="description"
                  v-model="description"
                  :rules="ruleDescription"
                  placeholder="Descripción"
                  prepend-icon="tabler-clipboard-text"
                  persistent-placeholder
                  maxlenght="40"
                  rows="2"
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- 👉 Crear negocio -->
          <VCol
            cols="12"
            class="d-flex gap-4"
          >
            <VBtn
              type="submit"
              block
            >
              Generar tarjeta de recompensa
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
