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
  <VCard
    :color="disabled ? 'secondary' : 'primary'"
    rounded="xl"
    :class="{ 'hero-cta--disabled': disabled }"
    @click="handleClick"
  >
    <VCardText class="d-flex align-center gap-4 pa-5">
      <VAvatar
        color="white"
        size="56"
        class="hero-avatar"
      >
        <VIcon
          :icon="icon"
          size="30"
          color="primary"
        />
      </VAvatar>
      <div>
        <div class="text-white text-h6 font-weight-bold">
          {{ title }}
        </div>
        <div class="text-white text-body-2 hero-subtitle">
          {{ subtitle }}
        </div>
      </div>
      <VSpacer />
      <VIcon
        icon="tabler-chevron-right"
        color="white"
        size="24"
        class="hero-chevron"
      />
    </VCardText>
  </VCard>
</template>

<style scoped>
.hero-cta--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.hero-avatar {
  opacity: 0.95;
}

.hero-subtitle {
  opacity: 0.85;
}

.hero-chevron {
  opacity: 0.7;
}
</style>
