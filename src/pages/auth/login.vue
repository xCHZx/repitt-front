<script setup lang="ts">
import { useAuthStore } from '@/@core/stores/auth'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
  },
})

const authStore = useAuthStore()

const router = useRouter()

const form = ref({
  email: '',
  password: '',
})

const isPasswordVisible = ref(false)

const onSubmit = () => {
  try {
    const payload = {
      email: form.value.email,
      password: form.value.password,
    }

    authStore.loginUser(payload)
    router.push('/')
  }
  catch (error) {
    console.error('Login error:', error)
  }
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
          Bienvenido a <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
        </h4>
      </VCardText>
      <VCardText>
        <VForm @submit.prevent="onSubmit">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <AppTextField
                v-model="form.email"
                autofocus
                label="Email"
                type="email"
                placeholder="johndoe@email.com"
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <AppTextField
                v-model="form.password"
                label="Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />

              <div class="d-flex align-center flex-wrap justify-space-between mt-2 mb-4">
                <!--
                  VCheckbox
                  v-model="form.remember"
                  label="Remember me"
                  /
                -->
                <a
                  class="text-primary ms-2 mb-1"
                  href="#"
                >
                  ¿Olvidaste la contraseña?
                </a>
              </div>

              <VBtn
                block
                type="submit"
              >
                Login
              </VBtn>
            </VCol>

            <!-- create account -->
            <VCol
              cols="12"
              class="text-center"
            >
              <a
                class="text-primary ms-2"
                href="#"
              >
                ¿Aún no tienes una cuenta?
              </a>
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
