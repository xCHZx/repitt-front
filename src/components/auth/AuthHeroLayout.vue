<!-- Registration screens: flat hero on the tonal band (guide §2.4) and the form below, both aligned to the start. -->
<script setup lang="ts">
const props = defineProps<{
  icon: string
  subtitle: string
  benefits: string[]
}>()
</script>

<template>
  <div class="ahl-page">
    <div class="ahl-hero section--tono">
      <div class="ahl-column ahl-hero__content">
        <div
          class="ahl-hero__badge"
          aria-hidden="true"
        >
          <VIcon
            :icon="props.icon"
            size="32"
          />
        </div>

        <h1 class="titulo-display">
          <slot name="title" />
        </h1>
        <p class="ahl-hero__subtitle">
          {{ props.subtitle }}
        </p>

        <ul class="ahl-hero__benefits">
          <li
            v-for="b in props.benefits"
            :key="b"
            class="ahl-benefit"
          >
            <VIcon
              icon="tabler-check"
              size="16"
            />
            {{ b }}
          </li>
        </ul>
      </div>
    </div>

    <div class="ahl-form-section">
      <div class="ahl-column">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./auth.scss"></style>

<style lang="scss" scoped>
.ahl-page {
  display: flex;
  flex-direction: column;
  background: var(--fondo);
  min-block-size: 100dvh;
}

.ahl-column {
  margin-inline: auto;
  max-inline-size: 480px;
}

.ahl-hero {
  flex-shrink: 0;
  border-block-end: 1px solid var(--linea);
  color: var(--texto);
  padding-block: var(--s-6);
  padding-inline: var(--s-4);

  @media (min-width: 1024px) {
    padding-block: var(--s-7);
  }
}

.ahl-hero__content {
  display: grid;
  gap: var(--s-3);
  justify-items: start;
}

.ahl-hero__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-control);
  background: var(--violeta-suave);
  block-size: var(--s-8);
  color: var(--enlace);
  inline-size: var(--s-8);
  margin-block-end: var(--s-2);
}

.ahl-hero__subtitle {
  margin: 0;
  color: var(--texto-2);
  font-size: var(--t-lead);
  line-height: var(--lh-lead);
}

.ahl-hero__benefits {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  gap: var(--s-2);
  list-style: none;
  margin-block-start: var(--s-2);
}

// Chip neutro (guía §15) con el check en --acento
.ahl-benefit {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--linea);
  border-radius: var(--r-control);
  color: var(--texto-2);
  font-size: var(--t-small);
  font-weight: 700;
  gap: var(--s-1);
  line-height: var(--lh-small);
  padding-block: var(--s-1);
  padding-inline: var(--s-3);

  .v-icon {
    color: var(--acento);
  }
}

.ahl-form-section {
  flex: 1;
  padding-block: var(--s-6) var(--s-7);
  padding-inline: var(--s-4);
}
</style>
