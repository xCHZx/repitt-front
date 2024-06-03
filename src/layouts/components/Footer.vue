<script setup lang="ts">
const AppVersion = import.meta.env.VITE_APP_VERSION
</script>

<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      |
      <a
        href="https://repitt.com"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Repitt</a>
      <span class="px-2">
        v{{ AppVersion }}
      </span>
    </span>
    <!-- 👉 Footer: right content -->

    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="https://repitt.com/contacto/"
        target="noopener noreferrer"
      >Contacto</a>
      <a
        href="https://repitt.com/negocios/"
        target="noopener noreferrer"
      >¿Tienes un negocio?</a>
      <a
        href="https://repitt.com/condiciones/"
        target="noopener noreferrer"
      >Términos y condiciones
      </a>
    </span>
  </div>
</template>
