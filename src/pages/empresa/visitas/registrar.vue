<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'
import { getAllByIdByCurrentCompany } from '@/services/company/stampCards'
import { storeAsCompany } from '@/services/company/visits'
import { useCompanyStore } from '@/stores/company'

// import { useRouter } from 'vue-router'

// const router = useRouter()

const companyStore = useCompanyStore()

const paused = ref(false)
const qrCodeValue = ref()
const isCameraAvailable = ref(false)
const error = ref()

const stampCardList = ref(
  [
    {
      title: 'Cargando tarjetas...',
      value: null,
      props: { subtitle: '...' },
    },
  ],
)

const selectedStampCard = ref()

const getData = async () => {
  try {
    const response = await getAllByIdByCurrentCompany(companyStore.selectedCompany.id)

    stampCardList.value = response.map((stampCard: any) => ({
      title: stampCard.name,
      value: stampCard.id,
      props: {
        subtitle: stampCard.business.name,
        hint: stampCard.reward,
      },
    }))
  }
  catch (e) {
    console.error('Error getting data:', e)
  }
}

onMounted(() => {
  getData()
})

const formattedQrCodeValue = computed({
  get: () => {
    return qrCodeValue.value
  },
  set: value => {
    qrCodeValue.value = value.match(/[a-z]{1,3}/gi)
    qrCodeValue.value = qrCodeValue.value.join('-')
  },

})

const reloadPage = () => {
  location.reload()
}

const onDetect = (result: any[]) => {
  console.log('onDetect', result)
  paused.value = true
  qrCodeValue.value = result[0].rawValue
  console.log(qrCodeValue.value)
}

const onCameraOn = () => {
  isCameraAvailable.value = true
}

const onError = (err: any) => {
  error.value = `[${err.name}]: `

  if (err.name === 'NotAllowedError')
    error.value += 'you need to grant camera access permission'
  else if (err.name === 'NotFoundError')
    error.value += 'no camera on this device'
  else if (err.name === 'NotSupportedError')
    error.value += 'secure context required (HTTPS, localhost)'
  else if (err.name === 'NotReadableError')
    error.value += 'is the camera already in use?'
  else if (err.name === 'OverconstrainedError')
    error.value += 'installed cameras are not suitable'
  else if (err.name === 'StreamApiNotSupportedError')
    error.value += 'Stream API is not supported in this browser'
  else if (err.name === 'InsecureContextError')
    error.value += 'Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.'
  else
    error.value += err.message
}

const formData = ref({
  stampCardId: null,
  repittCode: null,
})

const onSubmit = () => {
  try {
    if (!selectedStampCard.value)
      throw new Error('Selecciona una tarjeta')

    if (!formattedQrCodeValue.value)
      throw new Error('Ingresa un código Repitt')

    formData.value.repittCode = formattedQrCodeValue.value
    formData.value.stampCardId = selectedStampCard.value

    const payload = {
      stamp_card_id: formData.value.stampCardId,
      user_repitt_code: formData.value.repittCode,
    }

    console.log(formData.value)
    storeAsCompany(payload)
  }
  catch (e) {
    console.error('Error:', e)
  }
}
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <VRow>
      <VCol cols="12">
        <VSelect
          v-model="selectedStampCard"
          :items="stampCardList"
          label="Selecciona una tarjeta"
          prepend-icon="tabler-cards"
        />
      </VCol>
      <VCol cols="12">
        <VCard class="pa-4">
          <QrcodeStream
            :paused="paused"
            @detect="onDetect"
            @camera-on="onCameraOn"
            @error="onError"
          >
            <div v-if="isCameraAvailable === false">
              <p class="text-center">
                Cargando cámara...
              </p>
            </div>
          </QrcodeStream>
        </VCard>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12">
        <div v-if="error">
          <p>
            Error: {{ error }}
          </p>
        </div>
        <div v-if="isCameraAvailable === true">
          <VBtn
            block
            size="small"
            @click="reloadPage"
          >
            Reiniciar cámara
            <VIcon
              end
              icon="tabler-reload"
            />
          </VBtn>
        </div>
      </VCol>
    <!--
      <VCol cols="12">
      <VSelect
      v-model="selectedStampCard"
      :items="stampCardList"
      label="Selecciona una tarjeta"
      />
      </VCol>
    -->
    </VRow>

    <VRow>
      <VCol cols="12">
        <h4 class="text-center">
          O bien, ingresa el código Repitt del cliente manualmente:
        </h4>
        <VTextField
          v-model="formattedQrCodeValue"
          label="Código del Cliente"

          outlined
          class="py-4"
        />
      </VCol>
    </VRow>

    <VRow>
      <VCol>
        <div v-if="qrCodeValue">
          <h4 class="text-center">
            Código del Cliente:
          </h4>
          <h2 class="text-center">
            {{ qrCodeValue }}
          </h2>
          <VBtn
            block
            color="success"
            type="submit"
          >
            Registrar visita
          </VBtn>
        </div>
      </VCol>
    </VRow>
  </VForm>
</template>
