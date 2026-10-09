<script setup lang="ts">
import type { MeCardDetail } from '@/api/types'
import AppQrCode from '@/components/common/AppQrCode.vue'
import StampCard from '@/components/stampCard/StampCard.vue'
import CardEventsList from '@/components/visitor/CardEventsList.vue'
import { accentOf, isRedeemable, requiredOf, stampsLeftOf } from '@/components/visitor/wallet'
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
      icon="tabler-info-circle"
      density="compact"
      class="mb-4"
    >
      Esta tarjeta ya no está disponible para recibir sellos.
    </VAlert>

    <!-- Reward ready -->
    <VCard
      v-if="redeemable"
      class="mb-4"
    >
      <VCardText class="pa-5 d-flex flex-column align-start gap-3">
        <span class="chip-premio">
          <VIcon
            icon="tabler-confetti"
            size="18"
          />
          ¡Tarjeta completada!
        </span>
        <div class="text-body-1">
          Muéstrale tu QR al negocio para canjear tu recompensa
        </div>
        <VBtn
          prepend-icon="tabler-qrcode"
          @click="showQr = true"
        >
          Mostrar QR para canjear
        </VBtn>
      </VCardText>
    </VCard>

    <!-- Stamp card: business, card, stamps and reward -->
    <div class="section-label mb-3">
      Sellos<template v-if="cycle.cycleNumber > 1">
        · tarjeta {{ cycle.cycleNumber }}
      </template>
    </div>
    <StampCard
      :business-name="props.detail.business.name"
      :logo-url="props.detail.business.logoUrl"
      :card-name="card.name"
      :reward="card.reward"
      :required-stamps="required"
      :stamps="cycle.stampsCount"
      :color="accentColor"
      :status="cycle.status"
      :icon-url="card.iconUrl"
      class="mb-4"
    />

    <div class="detail-notes mb-4">
      <p
        v-if="card.description"
        class="note"
      >
        {{ card.description }}
      </p>
      <p class="text-body-2">
        <template v-if="cycle.status === 'open'">
          Falta{{ stampsLeft === 1 ? '' : 'n' }}
          <strong>{{ stampsLeft }} sello{{ stampsLeft === 1 ? '' : 's' }}</strong>
          para tu recompensa
        </template>
        <template v-else-if="cycle.status === 'redeemed'">
          Canjeaste esta recompensa el {{ formatInstant(cycle.redeemedAt) }}
        </template>
        <template v-else>
          Completada el {{ formatInstant(cycle.completedAt) }}
        </template>
      </p>
    </div>

    <!-- Validity -->
    <VCard class="mb-4">
      <VCardText class="pa-4 d-flex align-center gap-3">
        <VIcon
          icon="tabler-calendar"
          size="20"
          class="detail-icon"
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
      @click="showQr = true"
    >
      Mostrar QR para sellar
    </VBtn>

    <!-- Events -->
    <div class="section-label mb-3">
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
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-trophy"
          size="15"
        />
        Recompensas anteriores
      </div>
      <VCard class="mb-4">
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
      <VCard>
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
.detail-notes {
  display: grid;
  gap: var(--s-2);
}

.detail-notes p {
  margin: 0;
}

.detail-icon {
  color: var(--texto-2);
}
</style>
