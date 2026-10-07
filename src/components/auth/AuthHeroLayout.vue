<!-- Hero + bottom-sheet form used by the registration screens. -->
<script setup lang="ts">
const props = defineProps<{
  icon: string
  subtitle: string
  benefits: string[]
}>()
</script>

<template>
  <div class="ahl-page">
    <div class="ahl-hero">
      <div class="ahl-hero__content">
        <div
          class="ahl-hero__icons"
          aria-hidden="true"
        >
          <VIcon
            icon="tabler-star-filled"
            size="18"
            class="ahl-hero__star ahl-hero__star--1"
          />
          <div class="ahl-hero__badge">
            <VIcon
              :icon="props.icon"
              size="48"
            />
          </div>
          <VIcon
            icon="tabler-star-filled"
            size="14"
            class="ahl-hero__star ahl-hero__star--2"
          />
        </div>

        <h1 class="ahl-hero__title">
          <slot name="title" />
        </h1>
        <p class="ahl-hero__subtitle">
          {{ props.subtitle }}
        </p>

        <div class="ahl-hero__benefits">
          <div
            v-for="b in props.benefits"
            :key="b"
            class="ahl-benefit"
          >
            <VIcon
              icon="tabler-check"
              size="13"
            />
            {{ b }}
          </div>
        </div>
      </div>
    </div>

    <div class="ahl-form-section">
      <div class="ahl-form-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ahl-page {
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
  min-block-size: 100dvh;
}

.ahl-hero {
  flex-shrink: 0;
  background: linear-gradient(150deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  padding-block: 48px 80px;
  padding-inline: 24px;
  text-align: center;
}

.ahl-hero__content {
  margin-inline: auto;
  max-inline-size: 400px;
}

.ahl-hero__icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-block-end: 20px;
}

.ahl-hero__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255 255 255 / 20%);
  block-size: 80px;
  color: white;
  inline-size: 80px;
}

.ahl-hero__star {
  color: rgba(255 255 255 / 70%);

  &--1 {
    transform: translateY(-6px);
  }

  &--2 {
    transform: translateY(6px);
  }
}

.ahl-hero__title {
  color: white;
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.25;
  margin-block-end: 12px;
}

.ahl-hero__subtitle {
  color: rgba(255 255 255 / 85%);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-block-end: 24px;
}

.ahl-hero__benefits {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.ahl-benefit {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(255 255 255 / 18%);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  gap: 4px;
  padding-block: 4px;
  padding-inline: 12px;
}

.ahl-form-section {
  flex: 1;
  border-radius: 28px 28px 0 0;
  background: rgb(var(--v-theme-surface));
  margin-block-start: -32px;
  padding-block: 8px 48px;
  padding-inline: 16px;
}

.ahl-form-inner {
  margin-inline: auto;
  max-inline-size: 480px;
  padding-block-start: 32px;
}
</style>
