<script setup lang="ts">
import Swal from 'sweetalert2'
import { emailValidator, requiredValidator } from '@/@core/utils/validators'
import { dualRegisterUser } from '@/services/auth/auth'
import { createBusinessAsCompany } from '@/services/company/businesses'
import { getAllSegments } from '@/services/utils/utils'
import { useAuthStore } from '@/stores/auth'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
    requiredRole: null,
  },
})

const authStore = useAuthStore()

const router = useRouter()

const selectedUserType = ref('visitor')

const segmentsList = ref(
  [
    {
      title: 'Cargando categorías...',
      value: null,
    },
  ],
)

const userForm = ref({
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  password: '',
})

const businessForm = ref({
  name: '',
  segment: [],
  description: '',
  address: '',
  phone: '',
  opening_hours: '',
  logo_file: [] as File[],

})

const isPasswordVisible = ref(false)

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

const userTypes = [
  {
    icon: { icon: 'tabler-user-heart', size: '20' },
    title: 'Soy usuario',
    desc: 'Obtén recompensas por visitar los negocios que amas',
    value: 'visitor',
  },
  {
    icon: { icon: 'tabler-building-store', size: '20' },
    title: 'Soy negocio',
    desc: 'Aumenta tus ventas y fideliza a tus clientes',
    value: 'company',
  },
]

const onFormSubmit = async () => {
  const userPayload = {
    first_name: userForm.value.first_name,
    last_name: userForm.value.last_name,
    phone: userForm.value.phone,
    email: userForm.value.email,
    password: userForm.value.password,
    role: selectedUserType.value,
  }

  const businessPayload = {
    name: businessForm.value.name,
    segment_id: businessForm.value.segment,
    description: businessForm.value.description,
    address: businessForm.value.address,
    phone: businessForm.value.phone,
    opening_hours: businessForm.value.opening_hours,
    logo_file: businessForm.value.logo_file[0],
  }

  console.log(userPayload)

  try {
    await dualRegisterUser(userPayload)
      .then(() => {
        if (selectedUserType.value === 'company')
          return createBusinessAsCompany(businessPayload)
      })

    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: '¡Bienvenido a Repitt!',
      confirmButtonText: 'Empezar',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed) {
        if (authStore.authRole === 'Owner') {
          await router.push('/empresa')
          location.reload()
        }
        else if (authStore.authRole === 'Visitor') {
          await router.push('/visitante')
          location.reload()
        }
        else {
          await router.push('/404')
        }
      }
    })

    // if (authStore.authRole === 'Owner') {
    //   await router.push('/empresa')
    //   await location.reload()
    // }
    // else if (authStore.authRole === 'Visitor') {
    //   await router.push('/visitante')
    //   await location.reload()
    // }
    // else {
    //   await router.push('/404')
    // }
  }
  catch (error: any) {
    console.error('Error registering user:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
  }
}

onMounted(() => {
  getSegments()
})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      max-width="600"
      class="auth-card pa-4"
    >
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
          </div>
        </template>

        <VCardTitle
          class="font-weight-bold text-capitalize text-h5 py-1"
          style="color: rgb(var(--v-global-theme-primary))"
        >
          {{ themeConfig.app.title }}
        </VCardTitle>
      </VCardItem>

      <!-- 👉 Title -->
      <VCardText>
        <h4 class="text-h4 mb-1 text-center">
          Únete a <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
        </h4>
        <p class="mb-0 text-center">
          Registrate con nosotros y empieza a acumular recompensas!
        </p>
      </VCardText>

      <VCardText>
        <div class="d-flex mb-6">
          <CustomRadiosWithIcon
            v-model:selected-radio="selectedUserType"
            :radio-content="userTypes"
            :grid-column="{ sm: '6', cols: '12' }"
          />
        </div>

        <!-- 👉 UserForm -->
        <div v-if="selectedUserType === 'company'">
          <VAlert
            color="primary"
            icon="tabler-eye"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
            class="pb-2 text-left mb-6 mt-2"
          >
            <p class="mb-0">
              <strong>Nota:</strong> Al crear un perfil de negocio, también se te creará un perfil personal de usuario.
            </p>
          </VAlert>
        </div>

        <VForm @submit.prevent="onFormSubmit">
          <VRow>
            <!-- 👉 Nombre -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="userForm.first_name"
                placeholder="Juanito"
                label="Nombre(s) *"
                variant="outlined"
                prepend-icon="tabler-user"
                :rules="[requiredValidator]"
                required
              />
            </VCol>

            <!-- 👉 Apellido -->
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="userForm.last_name"
                placeholder="Pérez"
                label="Apellido(s)"
                variant="outlined"
                prepend-icon="tabler-user"
                :rules="[requiredValidator]"
                required
              />
            </VCol>

            <!-- 👉 Phone -->
            <VCol cols="12">
              <VTextField
                v-model="userForm.phone"
                placeholder="1234567890"
                label="Teléfono *"
                variant="outlined"
                prepend-icon="tabler-phone"
                type="number"
                :rules="[requiredValidator]"
                required
              />
            </VCol>

            <!-- 👉 Email -->
            <VCol cols="12">
              <VTextField
                v-model="userForm.email"
                type="email"
                variant="outlined"
                label="Email *"
                placeholder="tucorreo@ejemplo.com"
                prepend-icon="tabler-mail"
                :rules="[requiredValidator, emailValidator]"
                required
              />
            </VCol>

            <!-- 👉 Password -->
            <VCol cols="12">
              <VTextField
                v-model="userForm.password"
                autocomplete="on"
                variant="outlined"
                label="Contraseña *"
                placeholder="············"
                prepend-icon="tabler-lock"
                :rules="[requiredValidator]"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                required
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>
          </VRow>

          <!-- 👉 Business Only -->
          <div v-if="selectedUserType === 'company'">
            <VDivider class="my-6" />

            <div class="text-h5 mb-1 text-center text-primary">
              Datos del Negocio
            </div>

            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="businessForm.name"
                  prepend-icon="tabler-building-store"
                  variant="outlined"
                  label="Nombre del Negocio *"
                  placeholder="..."
                  :rules="[requiredValidator]"
                  required
                />
              </VCol>
              <VCol cols="12">
                <VSelect
                  v-model="businessForm.segment"
                  :items="segmentsList"
                  label="Giro del Negocio *"
                  prepend-icon="tabler-tag"
                  :rules="[requiredValidator]"
                  required
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="businessForm.description"
                  variant="outlined"
                  prepend-icon="tabler-text-plus"
                  label="Descripción"
                  placeholder="..."
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="businessForm.address"
                  variant="outlined"
                  prepend-icon="tabler-map-pin"
                  label="Dirección"
                  placeholder="..."
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="businessForm.phone"
                  variant="outlined"
                  prepend-icon="tabler-phone"
                  label="Teléfono"
                  placeholder="..."
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="businessForm.opening_hours"
                  variant="outlined"
                  prepend-icon="tabler-clock"
                  label="Horario de atención"
                  placeholder="..."
                />
              </VCol>
              <VCol cols="12">
                <VFileInput
                  v-model="businessForm.logo_file"
                  chips
                  show-size
                  accept="image/*"
                  placeholder="..."
                  prepend-icon="tabler-photo-up"
                  label="Cargar Logo"
                />
              </VCol>
            </VRow>
          </div>
          <!-- 👉 Submit and Cancel button -->
          <VRow>
            <VCol
              cols="12"
              class="text-center"
            >
              <VBtn
                type="submit"
                class="me-3"
              >
                submit
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </vcardtext>
    </vcard>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
