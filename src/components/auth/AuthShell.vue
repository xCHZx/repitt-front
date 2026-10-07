<!-- Centered card used by the auth screens (login, password recovery, email links, suspended account). -->
<script setup lang="ts">
import logo from '@images/logo-v2.png'
</script>

<template>
  <div class="auth-shell">
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

    <VCard
      rounded="xl"
      class="auth-shell__card"
      elevation="2"
    >
      <VCardText class="pa-6">
        <slot />
      </VCardText>
    </VCard>

    <div class="text-center mt-6">
      <slot name="footer" />
      <div class="text-caption text-disabled">
        Repitt © {{ new Date().getFullYear() }}
        ·
        <RouterLink
          to="/privacidad"
          class="text-disabled"
        >
          Aviso de privacidad
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, rgba(var(--v-theme-primary), 0.07) 0%, rgb(var(--v-theme-background)) 45%);
  min-block-size: 100dvh;
  padding-block: 32px;
  padding-inline: 16px;
}

.auth-shell__brand {
  margin-block-end: 28px;
  text-align: center;
}

.auth-shell__logo {
  block-size: auto;
  inline-size: 160px;
}

.auth-shell__card {
  inline-size: 100%;
  max-inline-size: 420px;
}
</style>

<style>
/* Round status icon used inside the auth cards (success / error / warning states) */
.auth-status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.1);
  block-size: 80px;
  inline-size: 80px;
}

.auth-status-icon--success {
  background: rgba(var(--v-theme-success), 0.1);
}

.auth-status-icon--error {
  background: rgba(var(--v-theme-error), 0.1);
}

.auth-status-icon--warning {
  background: rgba(var(--v-theme-warning), 0.1);
}
</style>
