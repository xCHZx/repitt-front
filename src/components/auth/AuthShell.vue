<!-- Auth screens shell (login, password recovery, email links, suspended account): one column, aligned to the start. -->
<script setup lang="ts">
import logo from '@images/logo-v2.png'
</script>

<template>
  <div class="auth-shell">
    <div class="auth-shell__column">
      <RouterLink
        to="/"
        class="auth-shell__brand"
      >
        <img
          :src="logo"
          alt="Repitt"
          class="auth-shell__logo"
        >
      </RouterLink>

      <VCard class="auth-shell__card">
        <VCardText class="pa-6">
          <slot />
        </VCardText>
      </VCard>

      <div class="auth-shell__footer">
        <slot name="footer" />
        <div class="note">
          Repitt © {{ new Date().getFullYear() }}
          ·
          <RouterLink
            to="/privacidad"
            class="auth-link"
          >
            Aviso de privacidad
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./auth.scss"></style>

<style lang="scss" scoped>
.auth-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--fondo);
  min-block-size: 100dvh;
  padding-block: var(--s-6);
  padding-inline: var(--s-4);
}

.auth-shell__column {
  display: grid;
  gap: var(--s-5);
  inline-size: 100%;
  max-inline-size: 420px;
}

.auth-shell__brand {
  justify-self: start;
}

.auth-shell__logo {
  display: block;
  block-size: auto;
  inline-size: 160px;
}

.auth-shell__footer {
  display: grid;
  gap: var(--s-2);
}
</style>
