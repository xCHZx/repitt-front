<script setup lang="ts">
interface Props {
  businessName?: string | null
  reward?: string | null
  description?: string | null
  requiredStamps?: number | null
  visitsCount?: number | null
  businessImage?: string | null
  startDate?: string | null
  endDate?: string | null
  stampIcon?: string | null
  primaryColor?: string | null
  isCompleted?: boolean
  isRewardRedeemed?: boolean
  isActive?: boolean
  visits?: any[]
  qrPath?: string | null
  companyView?: boolean
}

const props = defineProps<Props>()

const showQrDialog = ref(false)

const accentColor = computed(() => props.primaryColor || '#6C3CE1')

const initial = computed(() =>
  String(props.businessName || 'R').charAt(0).toUpperCase(),
)

const progress = computed(() => {
  if (!props.requiredStamps) return 0
  return Math.min(Math.round(((props.visitsCount ?? 0) / props.requiredStamps) * 100), 100)
})

const showDots = computed(() => (props.requiredStamps ?? 0) <= 12)

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const stampsLeft = computed(() =>
  Math.max((props.requiredStamps ?? 0) - (props.visitsCount ?? 0), 0),
)

const STAMP_ROTATIONS = [-9, 5, -13, 7, -5, 11, -7, 4, -11, 8, -3, 6]
const STAMP_OFFSETS = [-1, 1, -2, 0, 2, -1, 1, -2, 0, 2, -1, 1]

const stampStyle = (i: number, filled: boolean) => {
  const idx = (i - 1) % STAMP_ROTATIONS.length
  const rotate = filled ? `rotate(${STAMP_ROTATIONS[idx]}deg)` : 'none'
  const offset = filled ? `${STAMP_OFFSETS[idx]}px` : '0'
  return { transform: rotate, marginBlockStart: offset }
}
</script>

<template>
  <!-- Banner: tarjeta inactiva -->
  <VAlert
    v-if="isActive === false"
    color="error"
    icon="tabler-alert-triangle"
    variant="tonal"
    density="compact"
    rounded="xl"
    class="mb-4"
  >
    Esta tarjeta ha sido <strong>desactivada</strong> por el negocio.
  </VAlert>

  <!-- Banner: lista para canjear -->
  <VCard
    v-if="isCompleted && !isRewardRedeemed"
    rounded="xl"
    color="warning"
    class="mb-4"
  >
    <VCardText class="pa-4 text-center">
      <div class="text-h2 mb-1">
        🎉
      </div>
      <div class="text-h6 font-weight-bold text-white mb-1">
        ¡Tarjeta completada!
      </div>
      <div
        class="text-body-2 text-white mb-3"
        style="opacity: 0.85;"
      >
        Muéstrasela al negocio para canjear tu recompensa
      </div>
      <VChip
        color="white"
        variant="flat"
        size="large"
        prepend-icon="tabler-gift"
        style="color: rgb(var(--v-theme-warning));"
      >
        {{ reward || 'Recompensa' }}
      </VChip>
    </VCardText>
  </VCard>

  <!-- Header del negocio -->
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
            v-if="businessImage"
            :src="businessImage"
          />
          <span
            v-else
            class="text-h5 font-weight-bold"
          >{{ initial }}</span>
        </VAvatar>

        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold">
            {{ businessName ?? 'Sin nombre' }}
          </div>
          <div
            v-if="description"
            class="text-body-2 text-medium-emphasis mt-1"
          >
            {{ description }}
          </div>
        </div>

        <VChip
          v-if="isRewardRedeemed"
          size="small"
          color="success"
          variant="tonal"
        >
          Canjeada
        </VChip>
      </div>
    </VCardText>
  </VCard>

  <!-- Sellos -->
  <VCard
    rounded="xl"
    class="mb-4"
    :class="{ 'stamps-redeemable': isCompleted && !isRewardRedeemed }"
  >
    <VCardText class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing: 0.05em;">
          Sellos
        </div>
        <div
          class="text-h5 font-weight-bold"
          :style="{ color: accentColor }"
        >
          {{ visitsCount ?? 0 }}/{{ requiredStamps ?? 0 }}
        </div>
      </div>

      <!-- Dots -->
      <div
        v-if="showDots"
        class="stamps-grid mb-4"
      >
        <div
          v-for="i in requiredStamps ?? 0"
          :key="i"
          class="stamp-dot"
          :style="{
            background: i <= (visitsCount ?? 0) ? `${accentColor}25` : 'transparent',
            borderColor: i <= (visitsCount ?? 0) ? accentColor : `${accentColor}40`,
            ...stampStyle(i, i <= (visitsCount ?? 0)),
          }"
        >
          <VImg
            v-if="stampIcon && i <= (visitsCount ?? 0)"
            :src="stampIcon"
            :width="20"
            :height="20"
            cover
          />
        </div>
      </div>
      <VProgressLinear
        v-else
        :model-value="progress"
        :color="accentColor"
        bg-color="rgba(0,0,0,0.07)"
        rounded
        height="8"
        class="mb-4"
      />

      <div
        v-if="!isCompleted && stampsLeft > 0"
        class="text-caption text-medium-emphasis text-center"
      >
        Falta{{ stampsLeft > 1 ? 'n' : '' }}
        <strong :style="{ color: accentColor }">{{ stampsLeft }} sello{{ stampsLeft > 1 ? 's' : '' }}</strong>
        para tu recompensa
      </div>
    </VCardText>
  </VCard>

  <!-- Recompensa -->
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
        <VIcon icon="tabler-gift" size="22" />
      </div>
      <div>
        <div class="text-caption text-medium-emphasis">
          Recompensa
        </div>
        <div class="text-body-1 font-weight-bold">
          {{ reward || 'Sin recompensa definida' }}
        </div>
      </div>
    </VCardText>
  </VCard>

  <!-- Vigencia -->
  <VCard
    v-if="startDate || endDate"
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
          {{ formatDate(startDate) }} — {{ formatDate(endDate) }}
        </div>
      </div>
    </VCardText>
  </VCard>

  <!-- Historial de visitas -->
  <template v-if="visits && visits.length > 0">
    <div class="section-label mb-3">
      <VIcon icon="tabler-history" size="15" />
      Mis visitas
    </div>

    <VCard rounded="xl" class="mb-4">
      <VList density="compact">
        <template
          v-for="(visit, index) in visits"
          :key="visit.id"
        >
          <VListItem prepend-icon="tabler-check">
            <VListItemTitle class="text-body-2">
              Visita registrada
            </VListItemTitle>
            <VListItemSubtitle>
              {{ formatDate(visit.createdAt) }}
            </VListItemSubtitle>
          </VListItem>
          <VDivider v-if="index < visits.length - 1" />
        </template>
      </VList>
    </VCard>
  </template>

  <!-- CTA -->
  <VBtn
    v-if="!companyView && isActive && !isRewardRedeemed"
    block
    size="large"
    class="mb-3"
    prepend-icon="tabler-qrcode"
    :style="{ background: accentColor }"
    @click="showQrDialog = true"
  >
    Mostrar QR para sellar
  </VBtn>

  <!-- Dialog QR de la tarjeta -->
  <VDialog
    v-model="showQrDialog"
    max-width="340"
  >
    <VCard rounded="xl">
      <VCardText class="pa-6 text-center">
        <div class="text-body-1 font-weight-bold mb-1">
          {{ businessName }}
        </div>
        <div class="text-caption text-medium-emphasis mb-4">
          Muéstrale este QR al negocio para registrar tu visita
        </div>

        <div class="qr-dialog__wrap mx-auto mb-4">
          <VImg
            v-if="qrPath"
            :src="qrPath"
            :width="200"
            :height="200"
            cover
          />
          <div
            v-else
            class="d-flex align-center justify-center text-medium-emphasis"
            style="block-size: 200px; inline-size: 200px;"
          >
            <VIcon icon="tabler-qrcode" size="80" />
          </div>
        </div>

        <VBtn
          block
          variant="text"
          @click="showQrDialog = false"
        >
          Cerrar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.stamps-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stamp-dot {
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-radius: 50%;
  block-size: 36px;
  inline-size: 36px;
  transition: opacity 0.2s;
}

.qr-dialog__wrap {
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: white;
  block-size: 200px;
  inline-size: 200px;
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

.stamps-redeemable {
  animation: stamps-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 0 2px rgb(var(--v-theme-success)), 0 4px 24px rgba(var(--v-theme-success), 0.35);
}

@keyframes stamps-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 2px rgb(var(--v-theme-success)), 0 4px 24px rgba(var(--v-theme-success), 0.35);
  }

  50% {
    box-shadow: 0 0 0 3px rgb(var(--v-theme-success)), 0 6px 32px rgba(var(--v-theme-success), 0.55);
  }
}

.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
