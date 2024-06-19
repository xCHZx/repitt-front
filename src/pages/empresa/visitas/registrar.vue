<script setup lang="ts">
import Swal from 'sweetalert2'
import { QrcodeStream } from 'vue-qrcode-reader'
import { VCardText } from 'vuetify/lib/components/index.mjs'
import { getAllActiveStampCardsByBusinessIdAsCurrentCompany } from '@/services/company/stampCards'
import { registerVisitAsCompany } from '@/services/company/visits'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const companyStore = useCompanyStore()

const router = useRouter()

const paused = ref(false)
const qrCodeValue = ref()
const isCameraAvailable = ref(false)
const error = ref()

const isDialogVisible = ref(false)

const stampCardList = ref(
  [
    {
      title: 'Sin tarjetas disponibles',
      value: null,
      props: { subtitle: '...' },
    },
  ],
)

const selectedStampCard = ref()

const isQrScanned = ref(false)

const getData = async () => {
  try {
    const response = await getAllActiveStampCardsByBusinessIdAsCurrentCompany(companyStore.selectedCompany.id ?? 0)

    stampCardList.value = response.map((stampCard: any) => ({
      title: stampCard.name,
      value: stampCard.id,
      props: {
        subtitle: stampCard.business.name,
        hint: stampCard.reward,
      },
    }))
  }
  catch (e: any) {
    console.error('Error getting data:', e)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: e.join('\n'),
    })
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
  paused.value = true
  qrCodeValue.value = result[0].rawValue
  isQrScanned.value = true

  isDialogVisible.value = true

  // console.log(qrCodeValue.value)
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

const onSubmit = async () => {
  isDialogVisible.value = false
  try {
    if (!selectedStampCard.value || selectedStampCard.value === null)
      throw new Error('Selecciona una tarjeta')

    if (!formattedQrCodeValue.value)
      throw new Error('Ingresa un código Repitt')

    if (formattedQrCodeValue.value.length !== 11)
      throw new Error('El código Repitt no es válido')

    formData.value.repittCode = formattedQrCodeValue.value
    formData.value.stampCardId = selectedStampCard.value

    const payload = {
      stamp_card_id: formData.value.stampCardId,
      user_repitt_code: formData.value.repittCode,
    }

    // console.log(formData.value)
    await registerVisitAsCompany(payload)

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Visita registrada correctamente.',
      confirmButtonText: 'Aceptar',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed)
        router.push('/empresa/')
    })
  }
  catch (e: any) {
    console.error('Error creating Visit:', e)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(e) ? e.join('\n') : e,
    })
  }
}
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <VRow>
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

            <div
              v-if="isQrScanned === true"
              class="qr-scanned"
            >
              <!--
                <p class="text-center">
                Código escaneado: {{ qrCodeValue }}
                </p>
              -->
              <VCardText>
                <VIcon
                  size="150"
                  color="success"
                  icon="tabler-camera-check"
                  class="text-center mt-4"
                />
              </VCardText>
            </div>
          </QrcodeStream>
          <div v-if="isCameraAvailable === true">
            <VBtn
              block
              variant="plain"
              size="x-small"
              @click="reloadPage"
            >
              Reiniciar cámara
              <VIcon
                end
                icon="tabler-reload"
              />
            </VBtn>
          </div>
          <div class="mt-2">
            <h4 class="text-center">
              O bien, ingresa el código Repitt del cliente o de la tarjeta manualmente:
            </h4>
            <VTextField
              v-model="formattedQrCodeValue"
              label="Código del Cliente o Tarjeta"
              outlined
              class="py-4 pb-0"
            />
          </div>
          <div
            v-if="qrCodeValue"
            class="mt-4"
          >
            <VBtn
              block
              color="success"
              @click="isDialogVisible = true"
            >
              Siguiente
            </VBtn>
          </div>
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
      </VCol>
    </VRow>
  </VForm>

  <VDialog
    v-model="isDialogVisible"
    title="Selecciona una tarjeta"
    width="500"
  >
    <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />
    <VCard title="Paso 2">
      <VRow v-if="qrCodeValue.length === 11">
        <VCol cols="12">
          <VCardText>
            <div class="text-center">
              <VIcon
                size="80"
                color="success"
                icon="tabler-camera-check"
              />
            </div>
            <div>
              <div class="text-center text-h4">
                Código escaneado: <strong>{{ qrCodeValue }}</strong>
              </div>
            </div>
            <VCardText class="text-center text-h5 font-weight-bold mt-2 pt-0">
              ¿Para cual tarjeta deseas registrar la visita?
            </VCardText>
            <VSelect
              v-model="selectedStampCard"
              :items="stampCardList"
              label="Selecciona una tarjeta"
              prepend-icon="tabler-cards"
            />
          </VCardText>
        </VCol>
      </VRow>
      <VRow
        v-if="qrCodeValue.length === 11 || qrCodeValue.length === 15"
        class="mt-n8"
      >
        <VCol cols="12">
          <VCardText>
            <VBtn
              color="success"
              block
              @click="onSubmit"
            >
              Registrar Visita
            </VBtn>
          </VCardText>
        </VCol>
      </VRow>
      <VRow
        v-else
        class="mt-n8"
      >
        <VCol cols="12">
          <VCardText>
            <VAlert
              type="error"
              elevation="2"
              colored-border
            >
              <p class="mb-0">
                El código Repitt no es válido.
              </p>
            </VAlert>
          </VCardText>
        </VCol>
      </VRow>
    </VCard>
  </VDialog>
</template>

<style scoped>
.qr-scanned {
  position: absolute;
  width: 100%;
  height: 100%;

  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 1.4rem;
  color: black;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}
</style>
