<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'
import { getAllActiveStampCardsByBusinessIdAsCurrentCompany } from '@/services/company/stampCards'
import { registerCustomerAsCompany, registerVisitAsCompany } from '@/services/company/visits'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const COUNTRIES = [
  { flag: '🇲🇽', name: 'México', dial: '+52' },
  { flag: '🇺🇸', name: 'EE.UU.', dial: '+1' },
  { flag: '🇨🇴', name: 'Colombia', dial: '+57' },
  { flag: '🇦🇷', name: 'Argentina', dial: '+54' },
  { flag: '🇨🇱', name: 'Chile', dial: '+56' },
  { flag: '🇵🇪', name: 'Perú', dial: '+51' },
  { flag: '🇻🇪', name: 'Venezuela', dial: '+58' },
  { flag: '🇪🇨', name: 'Ecuador', dial: '+593' },
  { flag: '🇧🇴', name: 'Bolivia', dial: '+591' },
  { flag: '🇵🇾', name: 'Paraguay', dial: '+595' },
  { flag: '🇺🇾', name: 'Uruguay', dial: '+598' },
  { flag: '🇧🇷', name: 'Brasil', dial: '+55' },
  { flag: '🇬🇹', name: 'Guatemala', dial: '+502' },
  { flag: '🇭🇳', name: 'Honduras', dial: '+504' },
  { flag: '🇸🇻', name: 'El Salvador', dial: '+503' },
  { flag: '🇳🇮', name: 'Nicaragua', dial: '+505' },
  { flag: '🇨🇷', name: 'Costa Rica', dial: '+506' },
  { flag: '🇵🇦', name: 'Panamá', dial: '+507' },
  { flag: '🇩🇴', name: 'Rep. Dom.', dial: '+1809' },
  { flag: '🇨🇺', name: 'Cuba', dial: '+53' },
  { flag: '🇪🇸', name: 'España', dial: '+34' },
]

const companyStore = useCompanyStore()
const router = useRouter()

// Camera
const cameraActive = ref(false)
const cameraReady = ref(false)
const cameraError = ref<string | null>(null)
const paused = ref(false)

// Code
const qrCodeValue = ref('')
const isQrScanned = ref(false)

// Manual input mode
const inputMode = ref<'code' | 'phone'>('code')
const phoneNumber = ref('')
const phoneCountryCode = ref('+52')

// Stamp cards
const stampCardList = ref<any[]>([])
const selectedStampCard = ref<number | null>(null)

// UI state
const confirmDialog = ref(false)
const completedDialog = ref(false)
const completedProgress = ref<any>(null)
const successDialog = ref(false)
const successProgress = ref<any>(null)
const successIsNew = ref(false)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const loadError = ref<string | null>(null)

// New customer modal
const newCustomerDialog = ref(false)
const newFirstName = ref('')
const newLastName = ref('')
const newPhone = ref('')
const newPhoneCountryCode = ref('+52')
const newStampCard = ref<number | null>(null)
const newCustomerError = ref<string | null>(null)
const isSubmittingNew = ref(false)

// Formatted input: groups of 3 alphanumeric chars separated by dashes, max 4 groups
const formattedCode = computed({
  get: () => qrCodeValue.value,
  set: (value: string) => {
    const clean = value.replace(/[^a-z0-9]/gi, '').slice(0, 12)
    const groups = clean.match(/.{1,3}/g) || []
    qrCodeValue.value = groups.join('-')
  },
})

const codeType = computed(() => {
  if (qrCodeValue.value.length === 11) return 'visitor'
  if (qrCodeValue.value.length === 15) return 'card'
  return null
})

const getData = async () => {
  try {
    const response = await getAllActiveStampCardsByBusinessIdAsCurrentCompany(
      companyStore.selectedCompany.id ?? 0,
    )
    stampCardList.value = response.map((sc: any) => ({
      title: sc.name,
      value: sc.id,
      props: { subtitle: sc.reward ?? '' },
    }))
  }
  catch (e: any) {
    loadError.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
}

onMounted(() => { getData() })

// Camera control
const activateCamera = () => {
  cameraError.value = null
  cameraReady.value = false
  cameraActive.value = true
}

const deactivateCamera = () => {
  cameraActive.value = false
  cameraReady.value = false
}

const onCameraOn = () => { cameraReady.value = true }

const onCameraError = (err: any) => {
  const msgs: Record<string, string> = {
    NotAllowedError: 'Debes permitir el acceso a la cámara',
    NotFoundError: 'No se encontró cámara en este dispositivo',
    NotSupportedError: 'Se requiere conexión segura (HTTPS)',
    NotReadableError: 'La cámara ya está en uso por otra app',
    OverconstrainedError: 'La cámara no es compatible',
    InsecureContextError: 'Se requiere conexión segura (HTTPS)',
  }
  cameraError.value = msgs[err.name] || err.message
  cameraActive.value = false
}

const onDetect = (result: any[]) => {
  paused.value = true
  qrCodeValue.value = result[0].rawValue
  isQrScanned.value = true
  openConfirm()
}

// Confirm dialog
const openConfirm = () => {
  if (inputMode.value === 'code' && !codeType.value) return
  if (inputMode.value === 'phone' && !phoneNumber.value.trim()) return
  selectedStampCard.value = null
  submitError.value = null
  confirmDialog.value = true
}

const closeConfirm = () => {
  confirmDialog.value = false
  if (cameraActive.value) {
    paused.value = false
    isQrScanned.value = false
  }
}

const resetAll = () => {
  qrCodeValue.value = ''
  phoneNumber.value = ''
  isQrScanned.value = false
  paused.value = false
  selectedStampCard.value = null
  submitError.value = null
  confirmDialog.value = false
}

const openNewCustomer = () => {
  newFirstName.value = ''
  newLastName.value = ''
  newPhone.value = ''
  newPhoneCountryCode.value = '+52'
  newStampCard.value = null
  newCustomerError.value = null
  newCustomerDialog.value = true
}

const handleSuccess = (result: any, isNew = false) => {
  if (result.progress?.isCompleted) {
    completedProgress.value = result.progress
    completedDialog.value = true
  }
  else {
    successIsNew.value = isNew
    successProgress.value = result.progress
    successDialog.value = true
  }
}

// QR / code / phone scan path
const onSubmit = async () => {
  const needsStampCard = inputMode.value === 'phone' || codeType.value === 'visitor'
  if (needsStampCard && !selectedStampCard.value) {
    submitError.value = 'Selecciona una tarjeta para continuar'
    return
  }
  submitError.value = null
  isSubmitting.value = true
  try {
    const payload = inputMode.value === 'phone'
      ? { phone: phoneCountryCode.value + phoneNumber.value, stampCardId: selectedStampCard.value }
      : codeType.value === 'visitor'
        ? { userRepittCode: qrCodeValue.value, stampCardId: selectedStampCard.value }
        : { userStampCardRepittCode: qrCodeValue.value }

    const result = await registerVisitAsCompany(companyStore.selectedCompany.id, payload)
    confirmDialog.value = false
    handleSuccess(result)
  }
  catch (e: any) {
    submitError.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isSubmitting.value = false
  }
}

// New customer modal path
const onSubmitNewCustomer = async () => {
  if (!newFirstName.value.trim() || !newLastName.value.trim() || !newPhone.value.trim() || !newStampCard.value) {
    newCustomerError.value = 'Completa todos los campos para continuar'
    return
  }
  newCustomerError.value = null
  isSubmittingNew.value = true
  try {
    const result = await registerCustomerAsCompany(companyStore.selectedCompany.id, {
      firstName: newFirstName.value.trim(),
      lastName: newLastName.value.trim(),
      phone: newPhoneCountryCode.value + newPhone.value,
      stampCardId: newStampCard.value,
    })
    newCustomerDialog.value = false
    handleSuccess(result, result.isNew ?? false)
  }
  catch (e: any) {
    newCustomerError.value = Array.isArray(e) ? e.join('\n') : String(e)
  }
  finally {
    isSubmittingNew.value = false
  }
}
</script>

<template>
  <div>
    <!-- Load error -->
    <VAlert
      v-if="loadError"
      color="error"
      variant="tonal"
      rounded="lg"
      density="compact"
      icon="tabler-alert-triangle"
      class="mb-4"
    >
      {{ loadError }}
    </VAlert>

    <!-- Camera section -->
    <VCard
      rounded="xl"
      class="mb-4 overflow-hidden"
    >
      <!-- Camera inactive: CTA -->
      <template v-if="!cameraActive">
        <VCardText class="pa-6 text-center">
          <div
            class="camera-placeholder mb-4"
            @click="activateCamera"
          >
            <VIcon
              icon="tabler-qrcode"
              size="56"
              color="primary"
              style="opacity: 0.6;"
            />
            <div class="text-body-2 text-medium-emphasis mt-2">
              Toca para abrir la cámara
            </div>
          </div>
          <VBtn
            color="primary"
            rounded="xl"
            size="large"
            prepend-icon="tabler-camera"
            @click="activateCamera"
          >
            Escanear QR
          </VBtn>
        </VCardText>
      </template>

      <!-- Camera active -->
      <template v-else>
        <div class="camera-wrap">
          <QrcodeStream
            :paused="paused"
            @detect="onDetect"
            @camera-on="onCameraOn"
            @error="onCameraError"
          >
            <!-- Loading overlay -->
            <div
              v-if="!cameraReady"
              class="camera-overlay"
            >
              <VProgressCircular
                indeterminate
                color="white"
                size="40"
              />
              <div class="text-white text-body-2 mt-2">
                Iniciando cámara...
              </div>
            </div>

            <!-- Scanned overlay -->
            <div
              v-if="isQrScanned"
              class="camera-overlay camera-overlay--success"
            >
              <VIcon
                icon="tabler-circle-check-filled"
                size="64"
                color="success"
              />
            </div>

            <!-- Viewfinder corners -->
            <div
              v-if="cameraReady && !isQrScanned"
              class="viewfinder"
            />
          </QrcodeStream>
        </div>

        <!-- Camera controls -->
        <div class="d-flex align-center justify-space-between px-4 py-2">
          <span class="text-caption text-medium-emphasis">
            Apunta al código QR del cliente
          </span>
          <VBtn
            variant="text"
            size="small"
            color="error"
            prepend-icon="tabler-camera-off"
            @click="deactivateCamera"
          >
            Cerrar
          </VBtn>
        </div>
      </template>

      <!-- Camera error -->
      <VAlert
        v-if="cameraError"
        color="warning"
        variant="tonal"
        rounded="0"
        density="compact"
        icon="tabler-alert-triangle"
      >
        {{ cameraError }}
      </VAlert>
    </VCard>

    <!-- Divider -->
    <div class="d-flex align-center gap-3 mb-4">
      <VDivider />
      <span class="text-caption text-medium-emphasis text-no-wrap">
        o ingresa manualmente
      </span>
      <VDivider />
    </div>

    <!-- Manual input -->
    <VCard
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="pa-4">
        <!-- Mode toggle -->
        <VBtnToggle
          v-model="inputMode"
          mandatory
          density="compact"
          rounded="lg"
          color="primary"
          class="mb-4 w-100"
        >
          <VBtn
            value="code"
            prepend-icon="tabler-keyboard"
            class="flex-1-1"
          >
            Código
          </VBtn>
          <VBtn
            value="phone"
            prepend-icon="tabler-phone"
            class="flex-1-1"
          >
            Teléfono
          </VBtn>
        </VBtnToggle>

        <!-- Code input -->
        <template v-if="inputMode === 'code'">
          <AppTextField
            v-model="formattedCode"
            label="Código del cliente o tarjeta"
            placeholder="abc-def-ghi"
            prepend-inner-icon="tabler-keyboard"
            hint="Cliente: XXX-XXX-XXX · Tarjeta: XXX-XXX-XXX-XXX"
            persistent-hint
            maxlength="15"
          />
          <VBtn
            v-if="qrCodeValue && codeType"
            block
            color="primary"
            rounded="xl"
            class="mt-4"
            prepend-icon="tabler-arrow-right"
            @click="openConfirm"
          >
            Siguiente
          </VBtn>
          <VAlert
            v-else-if="qrCodeValue && !codeType"
            color="warning"
            variant="tonal"
            rounded="lg"
            density="compact"
            icon="tabler-alert-triangle"
            class="mt-3"
          >
            Código no reconocido. Verifica e intenta de nuevo.
          </VAlert>
        </template>

        <!-- Phone input -->
        <template v-else>
          <VTextField
            v-model="phoneNumber"
            label="Teléfono del cliente"
            type="tel"
            placeholder="1234567890"
            variant="outlined"
            class="phone-field"
          >
            <template #prepend-inner>
              <VSelect
                v-model="phoneCountryCode"
                :items="COUNTRIES"
                item-value="dial"
                variant="plain"
                density="compact"
                hide-details
                class="country-select"
              >
                <template #selection="{ item }">
                  <span class="text-body-2">{{ item.raw.flag }} {{ item.raw.dial }}</span>
                </template>
                <template #item="{ item, props: itemProps }">
                  <VListItem
                    v-bind="itemProps"
                    :title="`${item.raw.flag} ${item.raw.name}`"
                    :subtitle="item.raw.dial"
                  />
                </template>
              </VSelect>
              <VDivider
                vertical
                class="mx-2 my-1"
              />
            </template>
          </VTextField>
          <VBtn
            v-if="phoneNumber.trim()"
            block
            color="primary"
            rounded="xl"
            class="mt-4"
            prepend-icon="tabler-arrow-right"
            @click="openConfirm"
          >
            Siguiente
          </VBtn>
        </template>
      </VCardText>
    </VCard>

    <!-- New customer CTA -->
    <div class="text-center mt-3">
      <VBtn
        size="small"
        color="warning"
        rounded="xl"
        prepend-icon="tabler-user-plus"
        @click="openNewCustomer"
      >
        Registrar cliente nuevo
      </VBtn>
    </div>
  </div>

  <!-- New customer dialog -->
  <VDialog
    v-model="newCustomerDialog"
    max-width="440"
    :persistent="isSubmittingNew"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <div class="text-center mb-5">
          <VAvatar
            color="primary"
            variant="tonal"
            size="56"
            class="mb-3"
          >
            <VIcon
              icon="tabler-user-plus"
              size="28"
            />
          </VAvatar>
          <div class="text-h6 font-weight-bold mb-1">
            Registrar cliente nuevo
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Se crea la cuenta y se acredita la visita
          </div>
        </div>

        <div class="d-flex gap-3 mb-3">
          <VTextField
            v-model="newFirstName"
            label="Nombre"
            variant="outlined"
            hide-details
          />
          <VTextField
            v-model="newLastName"
            label="Apellido"
            variant="outlined"
            hide-details
          />
        </div>

        <VTextField
          v-model="newPhone"
          label="Teléfono"
          type="tel"
          placeholder="1234567890"
          variant="outlined"
          class="phone-field mb-3"
          hide-details
        >
          <template #prepend-inner>
            <VSelect
              v-model="newPhoneCountryCode"
              :items="COUNTRIES"
              item-value="dial"
              variant="plain"
              density="compact"
              hide-details
              class="country-select"
            >
              <template #selection="{ item }">
                <span class="text-body-2">{{ item.raw.flag }} {{ item.raw.dial }}</span>
              </template>
              <template #item="{ item, props: itemProps }">
                <VListItem
                  v-bind="itemProps"
                  :title="`${item.raw.flag} ${item.raw.name}`"
                  :subtitle="item.raw.dial"
                />
              </template>
            </VSelect>
            <VDivider
              vertical
              class="mx-2 my-1"
            />
          </template>
        </VTextField>

        <div class="section-label mb-3">
          <VIcon
            icon="tabler-cards"
            size="13"
            color="primary"
          />
          Selecciona la tarjeta
        </div>
        <VSelect
          v-model="newStampCard"
          :items="stampCardList"
          label="Tarjeta de sellos"
          rounded="lg"
          variant="outlined"
          class="mb-3"
        />

        <VAlert
          v-if="newCustomerError"
          color="error"
          variant="tonal"
          rounded="lg"
          density="compact"
          icon="tabler-alert-triangle"
          class="mb-4"
        >
          {{ newCustomerError }}
        </VAlert>

        <div class="d-flex gap-2 mt-2">
          <VBtn
            variant="tonal"
            color="secondary"
            rounded="xl"
            flex="1"
            :disabled="isSubmittingNew"
            @click="newCustomerDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            rounded="xl"
            flex="1"
            prepend-icon="tabler-user-check"
            :loading="isSubmittingNew"
            @click="onSubmitNewCustomer"
          >
            Registrar
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Confirm dialog -->
  <VDialog
    v-model="confirmDialog"
    max-width="440"
    :persistent="isSubmitting"
    @update:model-value="val => { if (!val) closeConfirm() }"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <!-- Identity info -->
        <div class="text-center mb-5">
          <VAvatar
            color="primary"
            variant="tonal"
            size="56"
            class="mb-3"
          >
            <VIcon
              :icon="inputMode === 'phone' ? 'tabler-phone' : codeType === 'card' ? 'tabler-cards' : 'tabler-user'"
              size="28"
            />
          </VAvatar>
          <div class="text-h6 font-weight-bold mb-1">
            {{ inputMode === 'phone' ? 'Cliente por teléfono' : codeType === 'card' ? 'Tarjeta identificada' : 'Cliente identificado' }}
          </div>
          <VChip
            color="primary"
            size="small"
            variant="tonal"
          >
            {{ inputMode === 'phone' ? phoneCountryCode + phoneNumber : qrCodeValue }}
          </VChip>
        </div>

        <!-- Stamp card selector (phone or visitor code) -->
        <div v-if="inputMode === 'phone' || codeType === 'visitor'">
          <div class="section-label mb-3">
            <VIcon
              icon="tabler-cards"
              size="13"
              color="primary"
            />
            Selecciona la tarjeta
          </div>
          <VSelect
            v-model="selectedStampCard"
            :items="stampCardList"
            label="Tarjeta de sellos"
            rounded="lg"
            variant="outlined"
          />
        </div>

        <div
          v-else
          class="text-body-2 text-medium-emphasis text-center mb-2"
        >
          La tarjeta ya está identificada por el código escaneado.
        </div>

        <!-- Error -->
        <VAlert
          v-if="submitError"
          color="error"
          variant="tonal"
          rounded="lg"
          density="compact"
          icon="tabler-alert-triangle"
          class="mb-4 mt-2"
        >
          {{ submitError }}
        </VAlert>

        <!-- Actions -->
        <div class="d-flex gap-2 mt-4">
          <VBtn
            variant="tonal"
            color="secondary"
            rounded="xl"
            flex="1"
            :disabled="isSubmitting"
            @click="closeConfirm"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            rounded="xl"
            flex="1"
            prepend-icon="tabler-check"
            :loading="isSubmitting"
            @click="onSubmit"
          >
            Registrar
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Completed dialog -->
  <VDialog
    v-model="completedDialog"
    max-width="400"
    persistent
  >
    <VCard rounded="xl">
      <VCardText class="pa-6 text-center">
        <VAvatar
          color="warning"
          variant="tonal"
          size="72"
          class="mb-4"
        >
          <VIcon
            icon="tabler-trophy"
            size="40"
          />
        </VAvatar>
        <div class="text-h6 font-weight-bold mb-2">
          ¡Tarjeta completada!
        </div>
        <div class="text-body-2 text-medium-emphasis mb-5">
          El cliente tiene un premio pendiente de canje. Entrega la recompensa antes de que continúe acumulando.
        </div>
        <VChip
          v-if="completedProgress"
          color="warning"
          variant="tonal"
          size="small"
          prepend-icon="tabler-qrcode"
          class="mb-5"
        >
          {{ completedProgress.repittCode }}
        </VChip>
        <VBtn
          block
          color="primary"
          rounded="xl"
          size="large"
          @click="router.push('/empresa/')"
        >
          Entendido
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Success screen -->
  <VDialog
    v-model="successDialog"
    fullscreen
    transition="dialog-bottom-transition"
    persistent
  >
    <div class="success-screen">
      <div class="success-icon-wrap">
        <div class="success-ring" />
        <VIcon
          icon="tabler-circle-check-filled"
          size="96"
          color="white"
          class="success-icon"
        />
      </div>

      <div class="success-text-wrap">
        <div class="text-h4 font-weight-black text-white mb-2 success-title">
          {{ successIsNew ? '¡Cliente registrado!' : '¡Visita registrada!' }}
        </div>
        <div class="text-body-1 success-subtitle">
          {{ successIsNew ? 'Cuenta creada y sello acreditado' : 'El sello fue acreditado correctamente' }}
        </div>
      </div>

      <div
        v-if="successProgress"
        class="success-counter"
      >
        <div class="text-h2 font-weight-black text-white">
          {{ successProgress.visitsCount }}
        </div>
        <div class="text-body-2 text-white" style="opacity: 0.8;">
          {{ successProgress.visitsCount === 1 ? 'visita acumulada' : 'visitas acumuladas' }}
        </div>
      </div>

      <VBtn
        size="x-large"
        rounded="xl"
        color="white"
        class="success-btn"
        @click="router.push('/empresa/')"
      >
        <span class="text-primary font-weight-bold">¡Listo!</span>
      </VBtn>
    </div>
  </VDialog>
</template>

<style lang="scss" scoped>
.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.04);
  block-size: 160px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.08);
  }
}

.camera-wrap {
  position: relative;
  overflow: hidden;
  block-size: 280px;
}

.camera-overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 55%);
  inset: 0;

  &--success {
    background: rgba(0, 0, 0, 40%);
  }
}

.viewfinder {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 80%);
  border-radius: 12px;
  block-size: 180px;
  inline-size: 180px;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}

.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 600;
  gap: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.country-select {
  max-inline-size: 92px;
  min-inline-size: 92px;
}

// Success screen
.success-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #6c3ce1 0%, #5328b8 100%);
  block-size: 100%;
  gap: 32px;
  padding-block: 48px;
  padding-inline: 32px;
}

.success-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.success-ring {
  position: absolute;
  border: 3px solid rgba(255, 255, 255, 30%);
  border-radius: 50%;
  animation: pulse-ring 1.8s ease-out 0.4s infinite;
  block-size: 148px;
  inline-size: 148px;
}

.success-icon {
  filter: drop-shadow(0 0 24px rgba(255, 255, 255, 40%));
}

.success-text-wrap {
  animation: fade-up 0.5s ease 0.2s both;
  text-align: center;
}

.success-title {
  text-shadow: 0 2px 12px rgba(0, 0, 0, 20%);
}

.success-subtitle {
  color: rgb(255 255 255 / 80%);
}

.success-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 25%);
  border-radius: 24px;
  animation: fade-up 0.5s ease 0.35s both;
  background: rgba(255, 255, 255, 12%);
  block-size: 120px;
  inline-size: 160px;
}

.success-btn {
  animation: fade-up 0.5s ease 0.5s both;
  inline-size: 100%;
  max-inline-size: 320px;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }

  70% {
    transform: scale(1.1);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-ring {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.6);
  }
}
</style>

<style>
.phone-field .v-field__prepend-inner {
  align-items: center;
  padding-inline-end: 0;
}

.country-select .v-field__input {
  min-block-size: 0;
  padding-block: 0;
  padding-inline-start: 0;
}

.country-select .v-select__selection {
  overflow: visible;
  margin-inline-end: 0;
  white-space: nowrap;
}
</style>
