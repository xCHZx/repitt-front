<script lang="ts" setup>
import { registerUser } from '@/services/auth/auth'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
  },
})

const form = ref({
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  password: '',
  account_status: '',
  role: '',
})

const onSubmit = () => {
  const payload = {
    first_name: form.value.first_name,
    last_name: form.value.last_name,
    phone: form.value.phone,
    email: form.value.email,
    password: form.value.password,
    account_status: form.value.account_status,
    role: form.value.role,
  }

  registerUser(payload)
  console.log('Si funciona')
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <!-- 👉 Auth Card -->
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
        <h4 class="text-h4 mb-1 text-center">
          Únete a <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
        </h4>
        <p class="mb-0 text-center">
          Registrate con nosotros y empieza a acumular recompensas!
        </p>
      </VCardText>
      <VCardText>
        <VForm @submit.prevent="onSubmit">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="form.first_name"
                placeholder="Nombre"
                prepend-icon="tabler-user"
                required
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="form.last_name"
                placeholder="Apellido"
                prepend-icon="tabler-signature"
                required
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="form.phone"
                placeholder="1234567890"
                prepend-icon="tabler-phone"
                type="number"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="form.email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                prepend-icon="tabler-mail"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="form.password"
                autocomplete="on"
                type="password"
                placeholder="············"
                prepend-icon="tabler-lock"
              />
            </VCol>

            <VCol
              cols="12"
              hidden
            >
              <AppTextField
                v-model="form.account_status"
                value="1"
              />
            </VCol>

            <VCol
              cols="12"
              hidden
            >
              <AppTextField
                v-model="form.role"
                value="Owner"
              />
            </VCol>

            <VCol cols="12">
              <VBtn
                block
                type="submit"
                class="me-2"
              >
                ¡Quiero Unirme!
              </VBtn>
            </VCol>

            <!-- login instead -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <RouterLink
                class="text-primary ms-2"
                :to="{ name: 'login' }"
              >
                ¿Ya tienes una cuenta?
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
