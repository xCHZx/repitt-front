<script setup lang="ts">
import Swal from 'sweetalert2'
import { requiredValidator } from '@/@core/utils/validators'
import { sendRecoveryEmail } from '@/services/auth/auth'
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

const form = ref({
  email: '',
})

const submitForm = async () => {
  const payload = {
    email: form.value.email,
  }

  try {
    await sendRecoveryEmail(payload)

    Swal.fire({
      icon: 'success',
      title: 'Correo enviado',
      text: 'Revisa tu bandeja de entrada, no olvides la bandeja de spam.',
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
        <h5 class="text-h4 mb-1 text-center">
          <span>Recupera tu contraseña</span>
        </h5>
        <p class="text-center">
          Ingresa tu correo electrónico y si coincide con nuestros registros, te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </VCardText>

      <VForm @submit.prevent="submitForm">
        <VRow>
          <!-- email -->
          <VCol cols="12">
            <VTextField
              v-model="form.email"
              type="email"
              variant="outlined"
              label="Email *"
              placeholder="tucorreo@ejemplo.com"
              prepend-icon="tabler-mail"
              :rules="[requiredValidator, emailValidator]"
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
