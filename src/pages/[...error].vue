<!-- 404 (guide §15): H1, one sentence on what happened and what to do, one CTA, aligned to the start. -->
<script setup lang="ts">
import ErrorHeader from '@/components/ErrorHeader.vue'

definePage({
  alias: '/pages/misc/not-found/:error(.*)',
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <main class="not-found">
    <div class="not-found__inner">
      <ErrorHeader
        status-code="404"
        title="Página no encontrada"
        description="No encontramos la página que buscas. Revisa el enlace o vuelve al inicio."
      />

      <VBtn to="/">
        Ir al inicio
      </VBtn>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.not-found {
  display: grid;
  align-content: center;
  background: var(--fondo);
  min-block-size: 100dvh;
  padding-block: var(--s-6);
  padding-inline: var(--s-4);

  @media (min-width: 1024px) {
    padding-block: var(--s-7);
  }
}

.not-found__inner {
  display: grid;
  gap: var(--s-5);
  inline-size: 100%;
  justify-items: start;
  margin-inline: auto;
  max-inline-size: 600px;
}
</style>
