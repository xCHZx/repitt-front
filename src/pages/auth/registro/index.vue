<script setup lang="ts">
definePage({
  meta: {
    layout: 'blank',
    requiresAuth: false,
    requiredRole: null,
  },
})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="selector-container">
      <!-- Logo -->
      <div class="d-flex justify-center mb-8">
        <img
          src="@/assets/images/logo-v2.png"
          alt="Repitt"
          style="block-size: auto; inline-size: 160px;"
        >
      </div>

      <h1 class="text-h4 font-weight-bold text-center mb-2">
        Únete a Repitt
      </h1>
      <p class="text-body-1 text-medium-emphasis text-center mb-8">
        ¿Cómo quieres registrarte?
      </p>

      <!-- Tarjetas de selección -->
      <div class="selector-cards">
        <VCard
          rounded="xl"
          class="selector-card"
          to="/auth/registro/visitante"
          hover
        >
          <VCardText class="pa-6 text-center">
            <div class="selector-card__icon-wrap mb-4">
              <VIcon icon="tabler-user-heart" size="36" color="primary" />
            </div>
            <div class="text-h6 font-weight-bold mb-1">
              Soy visitante
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Acumulo sellos y canjeo recompensas en mis negocios favoritos
            </div>
          </VCardText>
        </VCard>

        <VCard
          rounded="xl"
          class="selector-card"
          to="/auth/registro/negocio"
          hover
        >
          <VCardText class="pa-6 text-center">
            <div class="selector-card__icon-wrap selector-card__icon-wrap--secondary mb-4">
              <VIcon icon="tabler-building-store" size="36" color="secondary" />
            </div>
            <div class="text-h6 font-weight-bold mb-1">
              Tengo un negocio
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Creo un programa de fidelización para mis clientes
            </div>
          </VCardText>
        </VCard>
      </div>

      <div class="text-center mt-8">
        <span class="text-medium-emphasis text-body-2">¿Ya tienes una cuenta?</span>
        <a
          class="text-primary ms-1 text-body-2 font-weight-medium"
          href="/auth/login"
        >Inicia sesión</a>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<style lang="scss" scoped>
.selector-container {
  inline-size: 100%;
  max-inline-size: 480px;
}

.selector-cards {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.selector-card {
  border: 2px solid transparent;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
  }

  &__icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    block-size: 64px;
    border-radius: 50%;
    inline-size: 64px;
    background: rgba(var(--v-theme-primary), 0.1);

    &--secondary {
      background: rgba(var(--v-theme-secondary), 0.1);
    }
  }
}
</style>
