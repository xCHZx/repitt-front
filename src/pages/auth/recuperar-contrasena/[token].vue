<script setup lang="ts">
import Swal from 'sweetalert2'
import { confirmedValidator, requiredValidator } from '@/@core/utils/validators'
import { recoverPassword } from '@/services/auth/auth'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
    requiredRole: null,
  },
})

const router = useRouter()
const route = useRoute()

const isPasswordVisible = ref(false)

const form = ref({
  password: '',
  passwordConfirmation: '',
  token: (route.params as { token: string }).token,
})

const submitForm = async () => {
  const payload = {
    password: form.value.password,
    token: form.value.token,
  }

  if ((form.value.password === form.value.passwordConfirmation) && (form.value.password !== '' && form.value.passwordConfirmation !== '')) {
    try {
      await recoverPassword(payload)

      Swal.fire({
        icon: 'success',
        title: 'Contraseña reestablecida con éxito',
        text: 'Inicia sesión con tu nueva contraseña.',
        confirmButtonText: 'Ok',
      }).then(async result => {
        if (result.isConfirmed || result.isDismissed)
          await router.push('/auth/login')
      })
    }
    catch (error: any) {
      console.error('Recovery email error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.join('\n'),
      })
    }
  }
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'Las contraseñas no coinciden',
  })
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4"
      max-width="448"
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
      <VCardText>
        <h5 class="text-h4 mb-1 text-center font-weight-bold">
          <span>Cambia tu contraseña</span>
        </h5>
        <p class="text-center">
          Genera una nueva contraseña para tu cuenta.
        </p>
      </VCardText>

      <VForm @submit.prevent="submitForm">
        <VRow>
          <!-- email -->
          <VCol cols="12">
            <VTextField
              v-model="form.password"
              autocomplete="on"
              variant="outlined"
              label="Tu nueva contraseña *"
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
        <VRow>
          <VCol cols="12=">
            <VTextField
              v-model="form.passwordConfirmation"
              autocomplete="on"
              variant="outlined"
              label="Confirma tu nueva contraseña *"
              type="password"
              placeholder="············"
              prepend-icon="tabler-lock"
              :rules="[requiredValidator, confirmedValidator(form.passwordConfirmation, form.password)]"
              required
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            cols="12"
            class="text-center"
          >
            <VBtn
              type="submit"
              class="me-3"
            >
              Enviar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
