<script setup lang="ts">
import { computed } from 'vue'
import type { CounterSuccessInfo } from './counter'
import StampCard from '@/components/stampCard/StampCard.vue'
import { useBusinessStore } from '@/stores/business'

// Fullscreen confirmation after a stamp or a counter enroll (D5 del plan 2026-10-08):
// contexto noche con la tarjeta de sellos; el sello nuevo entra con el golpe de tinta.

// reward, primaryColor e iconUrl son opcionales en CounterSuccessInfo: sin ellos la tarjeta sale
// con el color por defecto, sin ícono y con el talón solo de progreso.
const props = defineProps<{
  info: CounterSuccessInfo | null
}>()

const emit = defineEmits<{
  close: []
}>()

const business = useBusinessStore()

const open = computed(() => !!props.info)

const hasProgress = computed(() => props.info?.stampsCount != null && props.info?.requiredStamps != null)
</script>

<template>
  <VDialog
    :model-value="open"
    fullscreen
    persistent
  >
    <div
      v-if="props.info"
      class="counter-success section--night"
    >
      <div class="counter-success__content">
        <VIcon
          icon="tabler-circle-check-filled"
          size="56"
          class="counter-success__icon"
        />

        <div class="counter-success__text">
          <h2 class="titulo-display">
            {{ props.info.title }}
          </h2>
          <p
            v-if="props.info.subtitle"
            class="counter-success__muted"
          >
            {{ props.info.subtitle }}
          </p>
        </div>

        <div class="counter-success__customer">
          <p class="counter-success__name">
            {{ props.info.customerName }}
          </p>
          <p
            v-if="props.info.cardName && !hasProgress"
            class="counter-success__muted"
          >
            {{ props.info.cardName }}
          </p>
          <span
            v-if="props.info.isTest"
            class="counter-success__chip"
          >
            Prueba
          </span>
        </div>

        <div
          v-if="hasProgress"
          class="counter-success__tarjeta"
        >
          <StampCard
            :business-name="business.active?.name ?? ''"
            :logo-url="business.active?.logoUrl"
            :card-name="props.info.cardName"
            :reward="props.info.reward"
            :required-stamps="props.info.requiredStamps ?? 1"
            :stamps="props.info.stampsCount ?? 0"
            :color="props.info.primaryColor"
            :icon-url="props.info.iconUrl"
            :new-stamp="props.info.stampsCount"
          />
        </div>

        <VBtn
          size="x-large"
          class="btn-inverso counter-success__btn"
          @click="emit('close')"
        >
          ¡Listo!
        </VBtn>
      </div>
    </div>
  </VDialog>
</template>

<style lang="scss" scoped>
.counter-success {
  /* Separadores sobre la noche (el rol --linea no lo reasigna .section--night). */
  --linea: color-mix(in srgb, var(--texto-noche) 14%, transparent);

  display: grid;
  align-items: center;
  block-size: 100%;
  overflow-y: auto;
  padding-block: var(--s-7);
  padding-inline: var(--margen);
}

.counter-success__content {
  display: grid;
  gap: var(--s-5);
  inline-size: 100%;
  justify-items: start;
  margin-inline: auto;
  max-inline-size: 560px;
}

.counter-success__icon {
  color: var(--enlace);
}

.counter-success__text,
.counter-success__customer {
  display: grid;
  gap: var(--s-2);
  justify-items: start;
  max-inline-size: 100%;
}

.counter-success__text p,
.counter-success__customer p {
  margin: 0;
}

.counter-success__muted {
  color: var(--texto-2);
}

.counter-success__name {
  font-size: var(--t-h3);
  font-weight: 700;
  line-height: var(--lh-h3);
  overflow-wrap: anywhere;
}

.counter-success__chip {
  border: 1px solid var(--linea);
  border-radius: var(--r-control);
  color: var(--texto-2);
  font-size: var(--t-small);
  font-weight: 700;
  line-height: var(--lh-small);
  padding-block: var(--s-1);
  padding-inline: var(--s-3);
}

/*
 * La tarjeta es de papel sobre la noche, en los dos temas: se le devuelven los roles de
 * superficie clara que .section--night reasigna.
 */
.counter-success__tarjeta {
  --superficie: var(--papel);
  --texto: var(--tinta);
  --texto-2: var(--tinta-suave);
  --linea: color-mix(in srgb, var(--tinta) 12%, transparent);

  inline-size: 100%;
}

.counter-success__btn {
  inline-size: 100%;
  max-inline-size: 320px;
}
</style>
