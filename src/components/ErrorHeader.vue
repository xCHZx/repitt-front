<!-- Error / empty page header (guide §15, 404 pattern): status as a label, H1 in Anybody --t-h2 and one sentence, aligned to the start. -->
<script setup lang="ts">
interface Props {
  statusCode?: string | number
  title?: string
  description?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="error-header">
    <p
      v-if="props.statusCode"
      class="section-label mb-0"
    >
      {{ props.statusCode }}
    </p>
    <h1
      v-if="props.title"
      class="error-header__title"
    >
      {{ props.title }}
    </h1>
    <p
      v-if="props.description"
      class="lead medida mb-0"
    >
      {{ props.description }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.error-header {
  display: grid;
  gap: var(--s-3);
}

.error-header__title {
  color: var(--texto);
  font-family: var(--f-display);
  font-size: var(--t-h2);
  font-stretch: var(--display-ancho);
  font-weight: 800;
  line-height: var(--lh-h2);
  text-wrap: balance;
}
</style>
