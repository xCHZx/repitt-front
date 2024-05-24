<script lang="ts" setup>
import Swal from 'sweetalert2'
import { getStampCardByIdAsCurrentCompany, updateStampCardAsCompany } from '@/services/company/stampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const route: any = useRoute()
const router = useRouter()
const stampCard = ref()

const name = ref('')
const description = ref('')
const requiredStamps = ref()
const startDate = ref('')
const endDate = ref('')
const stampIcon = ref<File[]>()
const reward = ref('')

const companyStore = useCompanyStore()

watch(() => stampCard.value, (value: any) => {
  name.value = value.name
  description.value = value.description
  requiredStamps.value = value.required_stamps
  startDate.value = value.start_date
  endDate.value = value.end_date
  reward.value = value.reward
})

const submit = async () => {
  console.log('Creating StampCard...')

  const payload = {
    name: name.value,
    description: description.value,

    // required_stamps: requiredStamps.value,
    // start_date: startDate.value,
    // end_date: endDate.value,
    // business_id: companyStore.selectedCompany.id,
    // reward: reward.value,
    stamp_icon_file: stampIcon.value && stampIcon.value.length > 0 ? stampIcon.value[0] : null,
  }

  // Call API to create StampCard
  try {
    stampCard.value = await updateStampCardAsCompany(route.params.id, payload)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Tarjeta actualizada correctamente.',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed)
        router.push('/empresa/tarjetas')
    })
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.join('\n'),
    })
  }
}

const getData = async () => {
  try {
    stampCard.value = await getStampCardByIdAsCurrentCompany(route.params.id)
  }
  catch (error) {
    console.error('Error getting data:', error)
  }
}

onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    {{ stampCard?.name || '...' }}
    <div class="text-h4 font-weight-bold">
      Editar Tarjeta para <span class="text-primary">{{ companyStore.selectedCompany.name || '???' }}</span>
    </div>
    <div class="pt-5">
      <VAlert
        color="primary"
        icon="tabler-alert-triangle"
        variant="tonal"
        density="compact"
        style="white-space: normal;"
        class="pb-0 text-left"
      >
        <p class="text-h6">
          Por seguridad, solo se permiten editar campos informativos.
          Si deseas un cambio adicional por favor contáctanos a soporte@repitt.com
        </p>
      </VAlert>
    </div>
  </div>

  <div>
    <VForm @submit.prevent="submit">
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
          label="Descripción"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="requiredStamps"
          type="number"
          variant="outlined"
          disabled
          prepend-icon="tabler-rubber-stamp"
          label="Visitas requeridas para la recompensa *"
          placeholder="..."
        />
      </VCol>

      <VCol cols="12">
        <VTextField
          v-model="reward"
          variant="outlined"
          disabled
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
          label="Actualizar Icono de sello"
        />
        <div class="mx-8 mt-5">
          <div>
            Icono de sello actual:
          </div>
          <VImg
            v-if="stampCard?.stamp_icon_path"
            :src="stampCard?.stamp_icon_path"
            width="40"
            height="40"
            class="mt-3"
          />
        </div>
      </VCol>
      <VRow class="mt-2 px-3 border rounded">
        <VCol
          cols="12"
          md="6"
        >
          <AppDateTimePicker
            v-model="startDate"
            disabled
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
            disabled
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
