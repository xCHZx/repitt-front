<script setup lang="ts">
import { computed } from 'vue'
import type { CounterSuccessInfo } from './counter'

// Fullscreen animated confirmation after a stamp or a counter enroll.

const props = defineProps<{
  info: CounterSuccessInfo | null
}>()

const emit = defineEmits<{
  close: []
}>()

const open = computed(() => !!props.info)

const hasProgress = computed(() => props.info?.stampsCount != null && props.info?.requiredStamps != null)

const percent = computed(() => {
  const i = props.info
  if (!i?.requiredStamps)
    return 0

  return Math.min(100, Math.round(((i.stampsCount ?? 0) / i.requiredStamps) * 100))
})
</script>

<template>
  <VDialog
    :model-value="open"
    fullscreen
    persistent
    transition="dialog-bottom-transition"
  >
    <div
      v-if="props.info"
      class="counter-success"
    >
      <div class="counter-success__icon-wrap">
        <div class="counter-success__ring" />
        <VIcon
          icon="tabler-circle-check-filled"
          size="96"
          color="white"
          class="counter-success__icon"
        />
      </div>

      <div class="counter-success__text">
        <div class="text-h4 font-weight-black text-white mb-2 counter-success__title">
          {{ props.info.title }}
        </div>
        <div
          v-if="props.info.subtitle"
          class="text-body-1 counter-success__muted"
        >
          {{ props.info.subtitle }}
        </div>
      </div>

      <div class="counter-success__customer">
        <div class="text-h6 font-weight-bold text-white text-truncate">
          {{ props.info.customerName }}
        </div>
        <div
          v-if="props.info.cardName"
          class="text-body-2 counter-success__muted text-truncate"
        >
          {{ props.info.cardName }}
        </div>
        <VChip
          v-if="props.info.isTest"
          size="x-small"
          color="white"
          variant="outlined"
          class="mt-2"
        >
          Prueba
        </VChip>
      </div>

      <div
        v-if="hasProgress"
        class="counter-success__counter"
      >
        <div class="text-h2 font-weight-black text-white">
          {{ props.info.stampsCount }}<span class="text-h4 counter-success__muted">/{{ props.info.requiredStamps }}</span>
        </div>
        <div class="text-body-2 counter-success__muted">
          sellos
        </div>
        <VProgressLinear
          :model-value="percent"
          color="white"
          bg-color="white"
          rounded
          height="6"
          class="mt-3 counter-success__bar"
        />
      </div>

      <VBtn
        size="x-large"
        rounded="xl"
        color="white"
        class="counter-success__btn"
        @click="emit('close')"
      >
        <span class="text-primary font-weight-bold">¡Listo!</span>
      </VBtn>
    </div>
  </VDialog>
</template>

<style lang="scss" scoped>
.counter-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #6c3ce1 0%, #5328b8 100%);
  block-size: 100%;
  gap: 28px;
  padding-block: 48px;
  padding-inline: 32px;
}

.counter-success__icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: counter-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.counter-success__ring {
  position: absolute;
  border: 3px solid rgba(255, 255, 255, 30%);
  border-radius: 50%;
  animation: counter-pulse-ring 1.8s ease-out 0.4s infinite;
  block-size: 148px;
  inline-size: 148px;
}

.counter-success__icon {
  filter: drop-shadow(0 0 24px rgba(255, 255, 255, 40%));
}

.counter-success__text {
  animation: counter-fade-up 0.5s ease 0.2s both;
  text-align: center;
}

.counter-success__title {
  text-shadow: 0 2px 12px rgba(0, 0, 0, 20%);
}

.counter-success__muted {
  color: rgb(255 255 255 / 80%);
}

.counter-success__customer {
  animation: counter-fade-up 0.5s ease 0.3s both;
  max-inline-size: 100%;
  text-align: center;
}

.counter-success__counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 25%);
  border-radius: 24px;
  animation: counter-fade-up 0.5s ease 0.4s both;
  background: rgba(255, 255, 255, 12%);
  inline-size: 180px;
  padding-block: 16px;
  padding-inline: 20px;
}

.counter-success__bar {
  inline-size: 100%;
}

.counter-success__btn {
  animation: counter-fade-up 0.5s ease 0.5s both;
  inline-size: 100%;
  max-inline-size: 320px;
}

@keyframes counter-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }

  70% {
    transform: scale(1.1);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes counter-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes counter-pulse-ring {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.6);
  }
}
</style>
