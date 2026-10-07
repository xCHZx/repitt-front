<script setup lang="ts">
import type { MeCard } from '@/api/types'
import StampProgress from '@/components/visitor/StampProgress.vue'
import { accentOf, initialOf, isRedeemable, requiredOf } from '@/components/visitor/wallet'

// Wallet entry (MeCardDto, guide §4.C.2).

const props = withDefaults(defineProps<{
  item: MeCard
  to?: string
  dimmed?: boolean
}>(), {
  to: undefined,
  dimmed: false,
})

const accentColor = computed(() => accentOf(props.item.card.primaryColor))
const redeemable = computed(() => isRedeemable(props.item))
const required = computed(() => requiredOf(props.item))
</script>

<template>
  <VCard
    rounded="xl"
    :to="props.to"
    :style="{
      borderInlineStart: `4px solid ${accentColor}`,
      background: `linear-gradient(to right, ${accentColor}10, transparent 55%)`,
      opacity: props.dimmed ? 0.6 : 1,
      ...(redeemable ? { boxShadow: '0 0 0 2px rgb(var(--v-theme-success)), 0 4px 24px rgba(var(--v-theme-success), 0.35)' } : {}),
    }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3 mb-4">
        <VAvatar
          rounded="lg"
          :size="48"
          color="primary"
          variant="tonal"
        >
          <VImg
            v-if="props.item.business.logoUrl"
            :src="props.item.business.logoUrl"
          />
          <span
            v-else
            class="text-body-1 font-weight-bold"
          >{{ initialOf(props.item.business.name) }}</span>
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-subtitle-1 font-weight-bold text-truncate">
            {{ props.item.business.name }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ props.item.card.name }}
          </div>
        </div>

        <div class="flex-shrink-0">
          <VChip
            v-if="redeemable"
            size="small"
            variant="flat"
            color="warning"
            prepend-icon="tabler-gift"
            class="font-weight-bold"
          >
            ¡A canjear!
          </VChip>
          <VChip
            v-else-if="props.item.cycle.status === 'redeemed'"
            size="small"
            variant="tonal"
            color="success"
            prepend-icon="tabler-check"
          >
            Canjeada
          </VChip>
          <div
            v-else
            class="text-end"
          >
            <div
              class="text-h6 font-weight-bold"
              :style="{ color: accentColor }"
            >
              {{ props.item.cycle.stampsCount }}/{{ required }}
            </div>
            <div class="text-caption text-medium-emphasis">
              sellos
            </div>
          </div>
        </div>
      </div>

      <StampProgress
        :count="props.item.cycle.stampsCount"
        :required="required"
        :color="accentColor"
        class="mb-3"
      />

      <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
        <VIcon
          size="14"
          icon="tabler-gift"
        />
        <span class="text-truncate">{{ props.item.card.reward }}</span>
        <VChip
          v-if="!props.item.card.isActive"
          size="x-small"
          variant="tonal"
          class="ms-auto flex-shrink-0"
        >
          No disponible
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>
