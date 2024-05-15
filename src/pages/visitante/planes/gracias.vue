<script setup lang="ts">
import gracias from '@images/pages/gracias.png'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})
</script>

<template>
  <div class="misc-wrapper">
    <VCardText class="text-center">
      <div>
        <div class="text-h1 font-weight-bold">
          ¡Gracias por tu compra!
        </div>
        <div class="text-h3">
          Ahora eres parte de la comunidad Repitt
        </div>
      </div>

      <VBtn
        to="/"
        class="my-11"
      >
        Regresar Al Inicio
      </VBtn>
      <!-- 👉 Image -->
      <div class="misc-avatar w-100 text-center">
        <VImg
          :src="gracias"
          alt="error 404"
          :max-height="$vuetify.display.smAndDown ? 350 : 500"
          class="mx-auto"
        />
      </div>
    </VCardText>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
