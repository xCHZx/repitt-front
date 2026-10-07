<!-- Row of a stamp card in the owner's list; also used as the live preview of the card form. -->
<script setup lang="ts">
import CardStatusChip from './CardStatusChip.vue'
import { tint } from './cardMeta'
import type { StampCardStatus } from '@/api/types'

const props = defineProps<{
  name: string
  reward: string
  requiredStamps: number
  primaryColor: string
  iconUrl: string | null
  status?: StampCardStatus
  isExpired: boolean
  validity?: string
  to?: string
}>()

const accent = computed(() => tint(props.primaryColor, ''))
</script>

<template>
  <VCard
    :to="props.to"
    rounded="xl"
    :style="{
      borderInlineStart: `4px solid ${accent}`,
      background: 'rgb(var(--v-theme-surface))',
    }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <VAvatar
          rounded="lg"
          size="44"
          :style="{ background: tint(props.primaryColor, '20') }"
        >
          <VImg
            v-if="props.iconUrl"
            :src="props.iconUrl"
            :width="28"
            :height="28"
          />
          <VIcon
            v-else
            icon="tabler-cards"
            size="22"
            :style="{ color: accent }"
          />
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-body-1 font-weight-bold text-truncate">
            {{ props.name }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1 d-flex align-center gap-1 text-truncate">
            <VIcon
              icon="tabler-gift"
              size="13"
            />
            <span class="text-truncate">{{ props.reward }}</span>
          </div>
          <div
            v-if="props.validity"
            class="text-caption text-medium-emphasis d-flex align-center gap-1"
          >
            <VIcon
              icon="tabler-calendar"
              size="13"
            />
            <span class="text-truncate">{{ props.validity }}</span>
          </div>
        </div>

        <div class="d-flex flex-column align-end gap-2 flex-shrink-0">
          <CardStatusChip
            v-if="props.status"
            :status="props.status"
            :is-expired="props.isExpired"
          />
          <span class="text-caption text-medium-emphasis text-no-wrap">
            {{ props.requiredStamps }} {{ props.requiredStamps === 1 ? 'sello' : 'sellos' }}
          </span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
