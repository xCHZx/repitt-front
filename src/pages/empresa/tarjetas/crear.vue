<script lang="ts" setup>
import Swal from 'sweetalert2'
import { createStampCardAsCompany } from '@/services/company/stampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const router = useRouter()

const name = ref('')
const description = ref('')
const requiredStamps = ref()
const requiredHours = ref()
const startDate = ref(new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString())
const endDate = ref('')
const stampIcon = ref<File[]>()
const reward = ref('')

const companyStore = useCompanyStore()

const submit = async () => {
  // console.log('Creating StampCard...')

  const payload = {
    name: name.value,
    description: description.value,
    required_stamps: requiredStamps.value,
    required_hours: requiredHours.value,
    start_date: startDate.value,
    end_date: endDate.value,
    business_id: companyStore.selectedCompany.id,
    reward: reward.value,
    stamp_icon_file: stampIcon.value && stampIcon.value.length > 0 ? stampIcon.value[0] : null,
  }

  // Call API to create StampCard
  try {
    await createStampCardAsCompany(payload)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Tarjeta creada correctamente.',
      confirmButtonText: 'Aceptar',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed)
        router.push('/empresa/tarjetas')
    })
  }
  catch (error: any) {
    console.error('Error creating StampCard:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
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
          v-model="reward"
          variant="outlined"
          prepend-icon="tabler-gift"
          label="Recompensa *"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="name"
          variant="outlined"
          prepend-icon="tabler-building-store"
          label="Nombre de la tarjeta *"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="description"
          variant="outlined"
          prepend-icon="tabler-text-plus"
          label="Descripción *"
          placeholder="..."
        />
      </VCol>
      <VCol
        cols="12"
        class="text-center"
      >
        <span class="text-h5 font-weight-bold">Visitas requeridas para la recompensa*</span>
        <VSlider
          v-model="requiredStamps"
          min="3"
          max="20"
          step="1"
          thumb-label
          thumb-size="24"
          class="mt-2"
          prepend-icon="tabler-number-3-small"
          append-icon="tabler-number-20-small"
          show-ticks
        />
        <VChip
          class="mx-auto"
          color="primary"
        >
          <VIcon
            start
            variant="tonal"
            icon="tabler-rubber-stamp"
          />
          Visitas requeridas:  <strong> {{ requiredStamps }}</strong>
        </VChip>
      </VCol>
      <VCol
        cols="12"
        class="text-center"
      >
        <span class="text-h5 font-weight-bold">¿Cuantas horas deben pasar entre visitas?*</span>
        <VSlider
          v-model="requiredHours"
          color="info"
          min="
          1"
          max="12"
          step="1"
          thumb-label
          thumb-size="24"
          class="mt-2"
          prepend-icon="tabler-number-1-small"
          append-icon="tabler-number-12-small"
          show-ticks
        />
        <VChip
          class="mx-auto"
          color="info"
        >
          <VIcon
            start
            variant="tonal"
            icon="tabler-clock-check"
          />
          Horas entre visitas:  <strong> {{ requiredHours }}</strong>
        </VChip>
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
            :config="{ disable: [{ from: '2000-01-01', to: startDate }] }"
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
            :config="{ disable: [{ from: '2000-01-01', to: startDate }] }"
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
