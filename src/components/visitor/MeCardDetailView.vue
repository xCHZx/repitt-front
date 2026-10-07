<script setup lang="ts">
import type { MeCardDetail } from '@/api/types'
import AppQrCode from '@/components/common/AppQrCode.vue'
import CardEventsList from '@/components/visitor/CardEventsList.vue'
import StampProgress from '@/components/visitor/StampProgress.vue'
import { accentOf, initialOf, isRedeemable, requiredOf, stampsLeftOf } from '@/components/visitor/wallet'
import { formatInstant, formatLocalDate } from '@/utils/dates'

// Detail of one cycle of my card (MeCardDetailDto, guide §4.C.2).

const props = defineProps<{
  detail: MeCardDetail
}>()

const showQr = ref(false)

const card = computed(() => props.detail.card)
const cycle = computed(() => props.detail.cycle)
const accentColor = computed(() => accentOf(card.value.primaryColor))
const redeemable = computed(() => isRedeemable(props.detail))
const required = computed(() => requiredOf(props.detail))
const stampsLeft = computed(() => stampsLeftOf(props.detail))

const validity = computed(() => {
  const from = formatLocalDate(card.value.startsOn)

  return card.value.endsOn
    ? `Del ${from} al ${formatLocalDate(card.value.endsOn)} (inclusive)`
    : `Desde el ${from}, sin fecha de fin`
})
</script>

<template>
  <div>
    <VAlert
      v-if="!card.isActive"
      color="secondary"
      icon="tabler-info-circle"
      variant="tonal"
      density="compact"
      rounded="xl"
      class="mb-4"
    >
      Esta tarjeta ya no está disponible para recibir sellos.
    </VAlert>

    <!-- Reward ready -->
    <VCard
      v-if="redeemable"
      rounded="xl"
      color="warning"
      class="mb-4"
    >
      <VCardText class="pa-4 text-center text-white">
        <VIcon
          icon="tabler-confetti"
          size="40"
          class="mb-2"
        />
        <div class="text-h6 font-weight-bold text-white mb-1">
          ¡Tarjeta completada!
        </div>
        <div class="text-body-2 text-white mb-3 banner-caption">
          Muéstrale tu QR al negocio para canjear tu recompensa
        </div>
        <VBtn
          color="white"
          variant="flat"
          prepend-icon="tabler-qrcode"
          class="text-warning"
          @click="showQr = true"
        >
          Mostrar QR para canjear
        </VBtn>
      </VCardText>
    </VCard>

    <!-- Business header -->
    <VCard
      rounded="xl"
      class="mb-4"
      :style="{ borderBlockStart: `4px solid ${accentColor}` }"
    >
      <VCardText class="pa-4">
        <div class="d-flex align-center gap-3">
          <VAvatar
            rounded="lg"
            size="56"
            color="primary"
            variant="tonal"
          >
            <VImg
              v-if="props.detail.business.logoUrl"
              :src="props.detail.business.logoUrl"
            />
            <span
              v-else
              class="text-h5 font-weight-bold"
            >{{ initialOf(props.detail.business.name) }}</span>
          </VAvatar>
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-h6 font-weight-bold">
              {{ props.detail.business.name }}
            </div>
            <div class="text-body-2 font-weight-medium">
              {{ card.name }}
            </div>
            <div
              v-if="card.description"
              class="text-caption text-medium-emphasis mt-1"
            >
              {{ card.description }}
            </div>
          </div>
          <VChip
            v-if="cycle.status === 'redeemed'"
            size="small"
            color="success"
            variant="tonal"
          >
            Canjeada
          </VChip>
        </div>
      </VCardText>
    </VCard>

    <!-- Stamps -->
    <VCard
      rounded="xl"
      class="mb-4"
      :style="redeemable ? { boxShadow: '0 0 0 2px rgb(var(--v-theme-success)), 0 4px 24px rgba(var(--v-theme-success), 0.35)' } : {}"
    >
      <VCardText class="pa-5">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="section-label text-medium-emphasis">
            Sellos<template v-if="cycle.cycleNumber > 1">
              · tarjeta {{ cycle.cycleNumber }}
            </template>
          </div>
          <div
            class="text-h5 font-weight-bold"
            :style="{ color: accentColor }"
          >
            {{ cycle.stampsCount }}/{{ required }}
          </div>
        </div>
        <StampProgress
          :count="cycle.stampsCount"
          :required="required"
          :color="accentColor"
          :icon-url="card.iconUrl"
          size="md"
          class="mb-4"
        />
        <div class="text-caption text-medium-emphasis text-center">
          <template v-if="cycle.status === 'open'">
            Falta{{ stampsLeft === 1 ? '' : 'n' }}
            <strong :style="{ color: accentColor }">{{ stampsLeft }} sello{{ stampsLeft === 1 ? '' : 's' }}</strong>
            para tu recompensa
          </template>
          <template v-else-if="cycle.status === 'redeemed'">
            Canjeaste esta recompensa el {{ formatInstant(cycle.redeemedAt) }}
          </template>
          <template v-else>
            Completada el {{ formatInstant(cycle.completedAt) }}
          </template>
        </div>
      </VCardText>
    </VCard>

    <!-- Reward -->
    <VCard
      rounded="xl"
      class="mb-4"
      :style="{ background: `${accentColor}10` }"
    >
      <VCardText class="pa-4 d-flex align-center gap-3">
        <div
          class="reward-icon"
          :style="{ background: `${accentColor}20`, color: accentColor }"
        >
          <VIcon
            icon="tabler-gift"
            size="22"
          />
        </div>
        <div>
          <div class="text-caption text-medium-emphasis">
            Recompensa
          </div>
          <div class="text-body-1 font-weight-bold">
            {{ card.reward }}
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Validity -->
    <VCard
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="pa-4 d-flex align-center gap-3">
        <VIcon
          icon="tabler-calendar"
          size="20"
          color="medium-emphasis"
        />
        <div>
          <div class="text-caption text-medium-emphasis">
            Vigencia
          </div>
          <div class="text-body-2 font-weight-medium">
            {{ validity }}
          </div>
        </div>
      </VCardText>
    </VCard>

    <VBtn
      v-if="card.isActive && !redeemable"
      block
      size="large"
      class="mb-6"
      prepend-icon="tabler-qrcode"
      :style="{ background: accentColor }"
      @click="showQr = true"
    >
      Mostrar QR para sellar
    </VBtn>

    <!-- Events -->
    <div class="section-label text-primary mb-3">
      <VIcon
        icon="tabler-history"
        size="15"
      />
      Movimientos
    </div>
    <CardEventsList
      :events="props.detail.events"
      class="mb-6"
    />

    <!-- Previous cycles -->
    <template v-if="props.detail.previousCycles.length">
      <div class="section-label text-primary mb-3">
        <VIcon
          icon="tabler-trophy"
          size="15"
        />
        Recompensas anteriores
      </div>
      <VCard
        rounded="xl"
        class="mb-4"
      >
        <VList density="compact">
          <VListItem
            v-for="prev in props.detail.previousCycles"
            :key="prev.id"
            :to="`/visitante/tarjetas/${prev.id}`"
            prepend-icon="tabler-circle-check"
            append-icon="tabler-chevron-right"
          >
            <VListItemTitle class="text-body-2">
              Tarjeta {{ prev.cycleNumber }}
            </VListItemTitle>
            <VListItemSubtitle>
              Canjeada el {{ formatInstant(prev.redeemedAt) }}
            </VListItemSubtitle>
          </VListItem>
        </VList>
      </VCard>
    </template>

    <VDialog
      v-model="showQr"
      max-width="340"
    >
      <VCard rounded="xl">
        <VCardText class="pa-6 text-center">
          <div class="text-body-1 font-weight-bold mb-1">
            {{ props.detail.business.name }}
          </div>
          <div class="text-caption text-medium-emphasis mb-4">
            {{ redeemable ? 'Muéstrale este QR al negocio para canjear tu recompensa' : 'Muéstrale este QR al negocio para recibir tu sello' }}
          </div>
          <AppQrCode
            :value="props.detail.qrPayload"
            :size="220"
            class="mb-4"
          />
          <VBtn
            block
            variant="text"
            @click="showQr = false"
          >
            Cerrar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.banner-caption {
  opacity: 0.85;
}

.reward-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  block-size: 44px;
  inline-size: 44px;
}

.section-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
