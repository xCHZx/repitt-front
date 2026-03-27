<script setup lang="ts">
interface Props {
  businessName: string
  segment?: string | null
  reward?: string | null
  visitsCount: number
  requiredStamps: number
  image?: string | null
  primaryColor?: string | null
  isCompleted?: boolean | number
  isRedeemed?: boolean | number
  disabled?: boolean
  to?: string
}

const props = defineProps<Props>()

const initial = computed(() =>
  String(props.businessName || 'R').charAt(0).toUpperCase(),
)

const progress = computed(() =>
  props.requiredStamps > 0
    ? Math.min((props.visitsCount / props.requiredStamps) * 100, 100)
    : 0,
)

const accentColor = computed(() => props.primaryColor || '#6C3CE1')

const isRedeemable = computed(() => props.isCompleted && !props.isRedeemed)

const showDots = computed(() => props.requiredStamps <= 12)
</script>

<template>
  <VCard
    rounded="xl"
    :to="to"
    :style="{
      borderInlineStart: `4px solid ${accentColor}`,
      background: `linear-gradient(to right, ${accentColor}10, transparent 55%)`,
      opacity: disabled ? 0.5 : 1,
    }"
    :class="{ 'stamp-card--redeemable': isRedeemable }"
  >
    <VCardText class="pa-4">
      <!-- Header -->
      <div class="d-flex align-center gap-3 mb-4">
        <VAvatar
          rounded="lg"
          :size="48"
          color="primary"
          variant="tonal"
        >
          <VImg
            v-if="image"
            :src="image"
          />
          <span
            v-else
            class="text-body-1 font-weight-bold"
          >{{ initial }}</span>
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-subtitle-1 font-weight-bold text-truncate">
            {{ businessName }}
          </div>
          <VChip
            v-if="segment"
            size="x-small"
            variant="flat"
            class="mt-1 text-white"
            :style="{ backgroundColor: accentColor }"
          >
            {{ segment }}
          </VChip>
        </div>

        <!-- Status -->
        <div class="flex-shrink-0">
          <VChip
            v-if="isRedeemed"
            size="small"
            variant="tonal"
            color="success"
            prepend-icon="tabler-check"
          >
            Canjeada
          </VChip>
          <VChip
            v-else-if="isCompleted"
            size="small"
            variant="flat"
            color="warning"
            prepend-icon="tabler-gift"
            class="font-weight-bold"
          >
            ¡A canjear!
          </VChip>
          <div
            v-else
            class="text-end"
          >
            <div
              class="text-h6 font-weight-bold"
              :style="{ color: accentColor }"
            >
              {{ visitsCount }}/{{ requiredStamps }}
            </div>
            <div class="text-caption text-medium-emphasis">
              sellos
            </div>
          </div>
        </div>
      </div>

      <!-- Stamp dots (≤ 12) o progress bar -->
      <div
        v-if="showDots"
        class="stamps-row mb-3"
      >
        <div
          v-for="i in requiredStamps"
          :key="i"
          class="stamp-dot"
          :style="{
            background: i <= visitsCount ? accentColor : 'transparent',
            borderColor: accentColor,
            opacity: i <= visitsCount ? 1 : 0.2,
          }"
        />
      </div>
      <VProgressLinear
        v-else
        :model-value="progress"
        :color="accentColor"
        bg-color="rgba(0,0,0,0.07)"
        rounded
        height="7"
        class="mb-3"
      />

      <!-- Reward -->
      <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
        <VIcon
          size="14"
          icon="tabler-gift"
        />
        <span>{{ reward || 'Sin recompensa definida' }}</span>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.stamps-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.stamp-dot {
  border: 1.5px solid;
  border-radius: 50%;
  block-size: 26px;
  inline-size: 26px;
  transition: opacity 0.2s;
}

.stamp-card--redeemable {
  animation: redeemable-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 0 2px rgb(var(--v-theme-success)), 0 4px 24px rgba(var(--v-theme-success), 0.35);
}

@keyframes redeemable-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 2px rgb(var(--v-theme-success)), 0 4px 24px rgba(var(--v-theme-success), 0.35);
  }

  50% {
    box-shadow: 0 0 0 3px rgb(var(--v-theme-success)), 0 6px 32px rgba(var(--v-theme-success), 0.55);
  }
}
</style>
