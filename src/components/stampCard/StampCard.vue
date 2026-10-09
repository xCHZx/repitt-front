<!--
  Tarjeta de sellos (guía §8.9). Portada de repitt-web/src/components/islands/StampCard.vue
  (HEAD 90884dc) sin la demo de la landing (sin botón de sellar, intro, CTA ni panel de canje).
  Estados de la API: open (en curso), completed (premio listo) y redeemed (canjeada, estática).
  Ícono según D4 del plan 2026-10-08: preset (SVG de PRESET_ICONS) > iconUrl (blanco o tonal).
-->
<script setup lang="ts">
import { computed } from 'vue'
import {
  avatarInitial,
  cardSubtitle,
  clampRequired,
  clampStamps,
  displayStatus,
  gridColumns,
  progressLabel,
  stampAngle,
  stampIconMode,
  stampInk,
  statusMessage,
  visibleSlots,
} from './stampCard'
import type { CardStatus, StampIconMode } from './stampCard'
import { PRESET_ICONS } from '@/components/cards/cardIcons'
import type { PresetIconName } from '@/components/cards/cardIcons'
import { DEFAULT_CARD_COLOR } from '@/components/cards/cardMeta'

const props = withDefaults(defineProps<{
  businessName: string

  /** Si falta, el subtítulo dice «N sellos». */
  cardName?: string | null

  /** Si falta (p. ej. en el mostrador), el talón muestra solo el progreso. */
  reward?: string | null
  requiredStamps: number
  stamps: number
  color?: string | null
  status?: CardStatus

  /** Ícono guardado (PNG del preset o imagen propia). */
  iconUrl?: string | null

  /** Ícono predefinido elegido en el editor: gana a iconUrl. */
  iconName?: PresetIconName | null

  /** Fuerza cómo se dibuja iconUrl (p. ej. un PNG recién elegido, que es blob:). */
  iconMode?: StampIconMode | null
  logoUrl?: string | null

  /** Número (1…N) del sello que entra con el golpe de tinta. */
  newStamp?: number | null

  /** Sin la sombra de la tarjeta (cuando ya hay otra tarjeta con sombra en la vista). */
  flat?: boolean
}>(), {
  cardName: '',
  reward: '',
  color: null,
  status: 'open',
  iconUrl: null,
  iconName: null,
  iconMode: null,
  logoUrl: null,
  newStamp: null,
  flat: false,
})

const required = computed(() => clampRequired(Number(props.requiredStamps)))
const filled = computed(() => clampStamps(Number(props.stamps), required.value))
const shown = computed(() => displayStatus(props.status, filled.value, required.value))

const slots = computed(() => visibleSlots(required.value))
const columns = computed(() => gridColumns(required.value))
const percent = computed(() => Math.round((filled.value / required.value) * 100))

const cardColor = computed(() => props.color || DEFAULT_CARD_COLOR)
const ink = computed(() => stampInk(cardColor.value))
const subtitle = computed(() => cardSubtitle(props.cardName, required.value))
const initial = computed(() => avatarInitial(props.businessName))
const progress = computed(() => progressLabel(filled.value, required.value))
const rewardText = computed(() => props.reward?.trim() ?? '')
const message = computed(() => statusMessage(shown.value, filled.value, required.value, rewardText.value))

/** Trazos del preset sin v-html: solo los atributos d de PRESET_ICONS. */
const presetPaths = computed(() => {
  const body = PRESET_ICONS.find(i => i.name === props.iconName)?.body

  return body ? [...body.matchAll(/ d="([^"]+)"/g)].map(m => m[1]) : null
})

const mode = computed<StampIconMode>(() => {
  if (!props.iconUrl?.trim())
    return 'ninguno'

  return props.iconMode ?? stampIconMode(props.iconUrl)
})

/** El anillo de canje pulsa solo cuando el sello nuevo es el que completa la tarjeta. */
const pulsing = computed(() => shown.value === 'completed' && props.newStamp != null && props.newStamp === required.value)
</script>

<template>
  <div class="stamp-card-wrap">
    <div
      class="stamp-card"
      :class="[`is-${shown}`, `tinta-${ink}`, { 'is-flat': props.flat }]"
      :style="{ '--c': cardColor }"
      role="group"
      :aria-label="`Tarjeta de sellos de ${props.businessName}`"
    >
      <div class="body">
        <div class="head">
          <span
            class="avatar"
            aria-hidden="true"
          >
            <img
              v-if="props.logoUrl"
              class="avatar-logo"
              :src="props.logoUrl"
              alt=""
            >
            <template v-else>{{ initial }}</template>
          </span>
          <div class="names">
            <p class="business">
              {{ props.businessName }}
            </p>
            <p class="card-name">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <div class="stamps">
          <span
            v-if="slots !== null"
            class="grid"
            :style="{ '--cols': columns }"
            aria-hidden="true"
          >
            <span
              v-for="i in slots"
              :key="i"
              class="slot"
              :class="{
                'is-filled': i <= filled,
                'is-tonal': i <= filled && !presetPaths && mode === 'tonal',
                'is-new': i <= filled && i === props.newStamp,
              }"
              :style="i <= filled ? { '--angle': `${stampAngle(i - 1)}deg` } : undefined"
            >
              <template v-if="i <= filled">
                <svg
                  v-if="presetPaths"
                  class="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    v-for="d in presetPaths"
                    :key="d"
                    :d="d"
                  />
                </svg>
                <img
                  v-else-if="mode !== 'ninguno'"
                  class="icon icon-img"
                  :class="{ 'is-blanco': mode === 'blanco' }"
                  :src="props.iconUrl ?? undefined"
                  alt=""
                >
              </template>
            </span>
          </span>
          <span
            v-else
            class="bar"
            aria-hidden="true"
          >
            <span
              class="bar-fill"
              :style="{ inlineSize: `${percent}%` }"
            />
          </span>
          <span class="sr-only">{{ message }}</span>
        </div>
      </div>

      <div
        class="stub"
        :class="{ 'no-reward': !rewardText }"
      >
        <template v-if="rewardText">
          <p class="stub-label">
            Tu premio
          </p>
          <p class="reward">
            {{ rewardText }}
          </p>
        </template>
        <p
          v-if="shown === 'open'"
          class="count"
          aria-hidden="true"
        >
          {{ progress }}
        </p>
        <p
          v-else-if="shown === 'completed'"
          class="chip"
          aria-hidden="true"
        >
          Premio listo
        </p>
        <p
          v-else
          class="chip chip--neutro"
          aria-hidden="true"
        >
          Canjeado
        </p>
      </div>

      <span
        v-if="shown === 'completed'"
        class="ring"
        :class="{ 'is-pulsing': pulsing }"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<style scoped>
.stamp-card-wrap {
  container-type: inline-size;
}

.stamp-card {
  --notch: 12px;
  --cut: calc(var(--notch) + 0.5px);

  position: relative;
  display: grid;
  border-radius: var(--r-tarjeta);
  box-shadow: var(--tarjeta-sombra);
  color: var(--texto);
  grid-template-areas: "body" "stub";
  grid-template-columns: minmax(0, 1fr);
  text-align: start;
}

.stamp-card.is-flat {
  box-shadow: none;
}

.body {
  display: grid;
  align-content: start;
  background: var(--superficie);
  border-start-end-radius: var(--r-tarjeta);
  border-start-start-radius: var(--r-tarjeta);
  box-shadow: var(--tarjeta-brillo);
  gap: var(--s-3);
  grid-area: body;
  mask:
    radial-gradient(circle at 0 100%, transparent var(--notch), #000 var(--cut)) 0 0 / 51% 100% no-repeat,
    radial-gradient(circle at 100% 100%, transparent var(--notch), #000 var(--cut)) 100% 0 / 51% 100% no-repeat;
  padding-block: var(--s-3);
  padding-inline: var(--s-4);
}

.head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}

.avatar {
  display: grid;
  overflow: hidden;
  flex: none;
  border-radius: var(--r-control);
  background: var(--violeta-suave);
  block-size: 48px;
  color: var(--texto);
  font-weight: 800;
  inline-size: 48px;
  place-items: center;
}

.avatar-logo {
  block-size: 100%;
  inline-size: 100%;
  object-fit: cover;
}

.names {
  min-inline-size: 0;
}

.business {
  margin: 0;
  font-weight: 700;
  line-height: var(--lh-h3);
  overflow-wrap: anywhere;
}

.card-name {
  margin: 0;
  color: var(--texto-2);
  font-size: var(--t-small);
  line-height: var(--lh-small);
  overflow-wrap: anywhere;
}

.stamps {
  display: grid;
  gap: var(--s-3);
}

.grid {
  display: grid;
  justify-content: start;
  gap: var(--s-2);
  grid-template-columns: repeat(var(--cols), minmax(0, min(56px, 12cqi)));
}

.slot {
  position: relative;
  display: grid;
  border: 2px dotted color-mix(in srgb, var(--c) 35%, transparent);
  border-radius: 50%;
  aspect-ratio: 1;
  color: var(--papel);
  inline-size: 100%;
  place-items: center;
}

.slot.is-filled {
  border-color: transparent;
  background: var(--c);
  mask: var(--tinta-mascara) center / 100% 100% no-repeat;
  transform: rotate(var(--angle));
}

/* D4: una foto o un JPG/WebP propio no se puede volver blanco; va tal cual sobre el tono. */
.slot.is-filled.is-tonal {
  background: color-mix(in srgb, var(--c) 16%, transparent);
}

.slot.is-filled::before {
  position: absolute;
  border: 1.5px solid var(--sello-anillo);
  border-radius: 50%;
  content: "";
  inset: 13%;
}

.icon {
  block-size: 52%;
  inline-size: 52%;
}

.icon-img {
  object-fit: contain;
}

/* D4 tonal: la imagen propia, recortada en círculo al 64%, igual que en las filas (StampProgress, D3). */
.slot.is-tonal .icon-img {
  border-radius: 50%;
  block-size: 64%;
  inline-size: 64%;
  object-fit: cover;
}

/* D4: el PNG de los presets (trazo del color de la tarjeta) se vuelve silueta blanca. */
.icon-img.is-blanco {
  filter: brightness(0) invert(1);
}

/*
 * Colores claros (naranja, amarillo, verde, azul): el ícono y el anillo van en tinta, la de más
 * contraste (stampInk, la regla del check de la guía §2.5). El PNG queda en silueta oscura.
 */
.tinta-tinta .slot {
  color: var(--tinta);
}

.tinta-tinta .slot.is-filled::before {
  border-color: color-mix(in srgb, var(--tinta) 30%, transparent);
}

.tinta-tinta .icon-img.is-blanco {
  filter: brightness(0);
}

.slot.is-new {
  animation: stamp-ink 240ms var(--ease-pop) both;
}

.bar {
  display: block;
  overflow: hidden;
  border-radius: var(--r-control);
  background: color-mix(in srgb, var(--c) 12%, transparent);
  block-size: 8px;
}

.bar-fill {
  display: block;
  border-radius: inherit;
  background: var(--c);
  block-size: 100%;
}

.stub {
  position: relative;
  display: grid;
  align-items: center;
  background: var(--superficie);
  border-block-start: 2px dotted var(--linea);
  border-end-end-radius: var(--r-tarjeta);
  border-end-start-radius: var(--r-tarjeta);
  box-shadow: var(--tarjeta-brillo);
  column-gap: var(--s-4);
  grid-area: stub;
  grid-template-areas: "label status" "reward status";
  grid-template-columns: minmax(0, 1fr) auto;
  mask:
    radial-gradient(circle at 0 0, transparent var(--notch), #000 var(--cut)) 0 0 / 51% 100% no-repeat,
    radial-gradient(circle at 100% 0, transparent var(--notch), #000 var(--cut)) 100% 0 / 51% 100% no-repeat;

  /* Holgura con el anillo de canje (8px de margen + 2px de borde): ~6px arriba, ~14px a los lados. */
  padding-block: var(--s-4);
  padding-inline: var(--s-5);
}

/* Sin premio (mostrador): el progreso ocupa el talón entero. */
.stub.no-reward {
  grid-template-areas: "status";
  grid-template-columns: minmax(0, 1fr);
}

.stub-label {
  margin: 0;
  color: var(--texto-2);
  font-size: var(--t-small);
  grid-area: label;
  line-height: var(--lh-small);
}

.reward {
  margin: 0;
  font-weight: 700;
  grid-area: reward;
  line-height: var(--lh-h3);
  overflow-wrap: anywhere;
}

.count {
  margin: 0;
  font-size: var(--t-h3);
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  grid-area: status;
  line-height: var(--lh-h3);
  white-space: nowrap;
}

.chip {
  border-radius: var(--r-control);
  margin: 0;
  background: var(--premio);
  color: var(--tinta);
  font-size: var(--t-small);
  font-weight: 700;
  grid-area: status;
  justify-self: start;
  line-height: var(--lh-small);
  padding-block: var(--s-1);
  padding-inline: var(--s-3);
  white-space: nowrap;
}

/* Canjeada: chip neutro (guía §15), sin relleno. */
.chip--neutro {
  border: 1px solid var(--linea);
  background: none;
  color: var(--texto-2);
}

/*
 * Dentro del talón: el margen lo separa de la perforación y las esquinas del lado
 * de las muescas, redondeadas con --r-control, quedan fuera de ellas (12px de radio).
 * Por fuera sigue la curva de la tarjeta (concéntrica a --r-tarjeta).
 */
.ring {
  --ring-inset: var(--s-2);

  position: relative;
  z-index: 1;
  border: 2px solid var(--canje);
  margin: var(--ring-inset);
  border-end-end-radius: calc(var(--r-tarjeta) - var(--ring-inset));
  border-end-start-radius: calc(var(--r-tarjeta) - var(--ring-inset));
  border-start-end-radius: var(--r-control);
  border-start-start-radius: var(--r-control);
  grid-area: stub;
  pointer-events: none;
}

/* Dos repeticiones de 300ms, solo cuando el sello nuevo completa la tarjeta. */
.ring.is-pulsing::after {
  position: absolute;
  border: 3px solid var(--canje);
  border-radius: inherit;
  animation: pulse-ring 300ms var(--ease-out) 240ms 2;
  content: "";
  inset: -2px;
  opacity: 0;

  /* Crece desde la perforación hacia fuera: el pulso no pasa sobre la línea punteada. */
  transform-origin: top;
}

@keyframes pulse-ring {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.08);
  }
}

@container (min-width: 480px) {
  .stamp-card {
    grid-template-areas: "body stub";
    grid-template-columns: minmax(0, 1fr) minmax(156px, 36%);
  }

  .body {
    padding: var(--s-5);
    border-end-start-radius: var(--r-tarjeta);
    border-start-end-radius: 0;
    gap: var(--s-4);
    mask:
      radial-gradient(circle at 100% 0, transparent var(--notch), #000 var(--cut)) 0 0 / 100% 51% no-repeat,
      radial-gradient(circle at 100% 100%, transparent var(--notch), #000 var(--cut)) 0 100% / 100% 51% no-repeat;
  }

  .grid {
    gap: var(--s-3);
  }

  .stub {
    align-content: space-between;
    padding: var(--s-5);
    border-block-start: 0;
    border-end-start-radius: 0;
    border-inline-start: 2px dotted var(--linea);
    border-start-end-radius: var(--r-tarjeta);
    grid-template-areas: "label" "reward" "status";
    grid-template-columns: minmax(0, 1fr);
    mask:
      radial-gradient(circle at 0 0, transparent var(--notch), #000 var(--cut)) 0 0 / 100% 51% no-repeat,
      radial-gradient(circle at 0 100%, transparent var(--notch), #000 var(--cut)) 0 100% / 100% 51% no-repeat;
    row-gap: var(--s-2);
  }

  .stub.no-reward {
    align-content: center;
    grid-template-areas: "status";
  }

  .ring {
    border-end-start-radius: var(--r-control);
    border-start-end-radius: calc(var(--r-tarjeta) - var(--ring-inset));
  }

  .ring.is-pulsing::after {
    transform-origin: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slot.is-new,
  .ring.is-pulsing::after {
    animation: none;
  }
}
</style>
