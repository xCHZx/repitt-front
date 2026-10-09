<script setup lang="ts">
definePage({
  meta: {
    layout: 'blank',
    public: true,
    guestOnly: true,
  },
})
</script>

<template>
  <div class="selector-page">
    <div class="selector-container">
      <img
        src="@images/logo-v2.png"
        alt="Repitt"
        class="selector-logo"
      >

      <div class="selector-heading">
        <h1 class="titulo-display">
          Únete a Repitt
        </h1>
        <p class="lead text-medium-emphasis mb-0">
          ¿Cómo quieres registrarte?
        </p>
      </div>

      <!-- Tarjetas de selección -->
      <div class="selector-cards">
        <VCard
          class="selector-card"
          to="/auth/registro/visitante"
        >
          <VCardText class="pa-6">
            <div class="selector-card__icon-wrap mb-4">
              <VIcon
                icon="tabler-user-heart"
                size="32"
              />
            </div>
            <div class="text-h6 font-weight-bold mb-1">
              Soy cliente
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Acumulo sellos y canjeo recompensas en mis negocios favoritos, solo con mi teléfono
            </div>
          </VCardText>
        </VCard>

        <VCard
          class="selector-card"
          to="/auth/registro/negocio"
        >
          <VCardText class="pa-6">
            <div class="selector-card__icon-wrap mb-4">
              <VIcon
                icon="tabler-building-store"
                size="32"
              />
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

      <div class="text-body-2">
        <span class="text-medium-emphasis">¿Ya tienes una cuenta?</span>
        <RouterLink
          class="auth-link ms-1 font-weight-medium"
          to="/auth/login"
        >
          Inicia sesión
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="../../../components/auth/auth.scss"></style>

<style lang="scss" scoped>
.selector-page {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fondo);
  min-block-size: 100dvh;
  padding-block: var(--s-6);
  padding-inline: var(--s-4);
}

.selector-container {
  display: grid;
  gap: var(--s-5);
  inline-size: 100%;
  max-inline-size: 480px;
}

.selector-logo {
  display: block;
  block-size: auto;
  inline-size: 160px;
}

.selector-heading {
  display: grid;
  gap: var(--s-3);
}

.selector-cards {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: 1fr 1fr;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

// Hover: solo cambia el color del borde (sin elevación ni velo)
.selector-card {
  transition: border-color 160ms var(--ease-out);

  &:hover {
    border-color: var(--enlace);
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.v-card__overlay) {
    display: none;
  }

  &__icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--r-control);
    background: var(--violeta-suave);
    block-size: var(--s-8);
    color: var(--enlace);
    inline-size: var(--s-8);
  }
}
</style>
