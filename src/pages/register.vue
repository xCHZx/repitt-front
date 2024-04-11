<script lang="ts" setup>
  import { registerUser } from '@/services/auth';
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { VIcon } from 'vuetify/lib/components/index.mjs';

definePage({
  meta: {
    layout: 'blank',
  },
})


const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
    
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
        console.log("Si funciona")
    }
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v1 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Bienvenido a <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
          </h4>
          <p class="mb-0">
            Registrate con nosotros y empieza a acumular recompensas!
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <VIcon icon="tabler-user"></VIcon>
                <AppTextField
                  v-model="form.first_name"
                  placeholder="Nombre"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VIcon icon="tabler-signature"></VIcon>
                <AppTextField
                  v-model="form.last_name"
                  placeholder="Apellido"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VIcon icon="tabler-phone"></VIcon>
                <AppTextField
                  v-model="form.phone"
                  placeholder="1234567890"
                  type="number"
                />
              </VCol>

              <VCol cols="12">
                <VIcon icon="tabler-mail"></VIcon>
                <AppTextField
                  v-model="form.email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                />
              </VCol>
        
              <VCol cols="12">
                <VIcon icon="tabler-lock"></VIcon>
                <AppTextField
                  v-model="form.password"
                  autocomplete="on"
                  type="password"
                  placeholder="············"
                />
              </VCol>

              <VCol cols="12" hidden>
                <AppTextField
                  v-model="form.account_status"
                  value="1"
                  hidden
                />
              </VCol>

              <VCol cols="12" hidden>
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
                  Submit
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
  