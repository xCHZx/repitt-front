<script setup lang="ts">
import { computed } from 'vue'
import { clampRequired, clampStamps, stampAngle, stampIconMode, stampInk, visibleSlots } from '@/components/stampCard/stampCard'
import type { StampIconMode } from '@/components/stampCard/stampCard'

// Sellos de una fila de tarjeta con la gramática de la landing (StampCard.vue): sello lleno con la
// máscara de tinta y su ángulo fijo, vacío punteado, y barra de 8px desde 13 sellos.
// Ícono por D4: el PNG predefinido se vuelve blanco; otra imagen va tal cual sobre un tono del color.

const props = withDefaults(defineProps<{
  count: number
  required: number
  color: string
  iconUrl?: string | null

  /** Fuerza el modo del ícono (p. ej. una URL blob: de un preset); por defecto sale de iconUrl. */
  iconMode?: StampIconMode | null
  size?: 'sm' | 'md'
}>(), {
  iconUrl: null,
  iconMode: null,
  size: 'sm',
})

const required = computed(() => clampRequired(props.required))
const filled = computed(() => clampStamps(props.count, props.required))
const slots = computed(() => visibleSlots(required.value))
const iconMode = computed(() => props.iconUrl?.trim() ? (props.iconMode ?? stampIconMode(props.iconUrl)) : 'ninguno')
const ink = computed(() => stampInk(props.color))
const percent = computed(() => Math.round((filled.value / required.value) * 100))
</script>

<template>
  <div
    class="stamp-progress"
    :class="[`stamp-progress--${props.size}`, `stamp-progress--icono-${iconMode}`, `stamp-progress--tinta-${ink}`]"
    :style="{ '--c': props.color }"
  >
    <div
      v-if="slots !== null"
      class="stamp-progress__grid"
      aria-hidden="true"
    >
      <span
        v-for="i in slots"
        :key="i"
        class="stamp-progress__slot"
        :class="{ 'is-filled': i <= filled }"
        :style="i <= filled ? { '--angle': `${stampAngle(i - 1)}deg` } : undefined"
      >
        <img
          v-if="i <= filled && iconMode !== 'ninguno'"
          :src="props.iconUrl ?? undefined"
          alt=""
          class="stamp-progress__icon"
        >
      </span>
    </div>
    <div
      v-else
      class="stamp-progress__bar"
      role="progressbar"
      aria-valuemin="0"
      :aria-valuemax="required"
      :aria-valuenow="filled"
    >
      <span
        class="stamp-progress__fill"
        :style="{ inlineSize: `${percent}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.stamp-progress__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
}

.stamp-progress--md .stamp-progress__grid {
  gap: var(--s-2);
}

/* Medida de pieza: 28px en filas compactas, 40px en detalle (máximo de la guía: 56px) */
.stamp-progress__slot {
  position: relative;
  display: grid;
  flex-shrink: 0;
  border: 2px dotted color-mix(in srgb, var(--c) 35%, transparent);
  border-radius: 50%;
  block-size: 28px;
  inline-size: 28px;
  place-items: center;
}

.stamp-progress--md .stamp-progress__slot {
  block-size: 40px;
  inline-size: 40px;
}

.stamp-progress__slot.is-filled {
  border-color: transparent;
  background: var(--c);
  mask: var(--tinta-mascara) center / 100% 100% no-repeat;
  transform: rotate(var(--angle));
  transition: background-color 200ms var(--ease-out);
}

.stamp-progress__slot.is-filled::before {
  position: absolute;
  border: 1.5px solid var(--sello-anillo);
  border-radius: 50%;
  content: "";
  inset: 13%;
}

.stamp-progress__icon {
  block-size: 52%;
  inline-size: 52%;
  object-fit: contain;
}

/* D4 «blanco»: el PNG predefinido (trazo del color de la tarjeta) se vuelve silueta blanca */
.stamp-progress--icono-blanco .stamp-progress__icon {
  filter: brightness(0) invert(1);
}

/* D4 «tonal»: una foto o imagen propia va tal cual sobre un tono del color de la tarjeta */
.stamp-progress--icono-tonal .stamp-progress__slot.is-filled {
  background: color-mix(in srgb, var(--c) 16%, transparent);
}

.stamp-progress--icono-tonal .stamp-progress__icon {
  border-radius: 50%;
  block-size: 64%;
  inline-size: 64%;
  object-fit: cover;
}

/* Colores claros: ícono y anillo en tinta, la de más contraste (stampInk, como el check de la guía §2.5) */
.stamp-progress--tinta-tinta .stamp-progress__slot.is-filled::before {
  border-color: color-mix(in srgb, var(--tinta) 30%, transparent);
}

.stamp-progress--tinta-tinta.stamp-progress--icono-blanco .stamp-progress__icon {
  filter: brightness(0);
}

.stamp-progress__bar {
  display: block;
  overflow: hidden;
  border-radius: var(--r-control);
  background: color-mix(in srgb, var(--c) 12%, transparent);
  block-size: 8px;
}

.stamp-progress__fill {
  display: block;
  border-radius: inherit;
  background: var(--c);
  block-size: 100%;
  transition: inline-size 300ms var(--ease-out);
}
</style>
