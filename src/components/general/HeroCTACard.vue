<script setup lang="ts">
interface Props {
  icon: string
  title: string
  subtitle: string
  to?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const router = useRouter()

const handleClick = () => {
  if (!props.disabled && props.to)
    router.push(props.to)
}
</script>

<template>
  <!-- Main call to action: flat violet surface (--violeta + white), hover --violeta-tinta; disabled at 45% (guide §15) -->
  <VCard
    class="hero-cta"
    :class="{ 'hero-cta--disabled': disabled }"
    @click="handleClick"
  >
    <VCardText class="d-flex align-center gap-4 pa-5">
      <span class="hero-cta__icon">
        <VIcon
          :icon="icon"
          size="28"
        />
      </span>
      <div>
        <div class="text-h6 font-weight-bold">
          {{ title }}
        </div>
        <div class="text-body-2">
          {{ subtitle }}
        </div>
      </div>
      <VSpacer />
      <VIcon
        icon="tabler-chevron-right"
        size="24"
      />
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
// .v-card delante: gana a `:root body .v-card` (texto --texto y borde --linea) de src/styles/vuetify.scss
.v-card.hero-cta {
  border-color: transparent;
  background-color: var(--violeta);
  color: var(--papel);
  transition: background-color 160ms var(--ease-out);

  &:hover:not(.hero-cta--disabled) {
    background-color: var(--violeta-tinta);
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.v-card__overlay) {
    display: none;
  }
}

.hero-cta--disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.hero-cta__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-control);
  background-color: var(--papel);
  block-size: var(--s-7);
  color: var(--violeta);
  inline-size: var(--s-7);
}
</style>
