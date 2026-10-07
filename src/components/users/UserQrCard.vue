<script setup lang="ts">
import AppQrCode from '@/components/common/AppQrCode.vue'
import { formatRepittCode } from '@/components/visitor/wallet'

// "Digital pass" with my QR (MeDto.qrPayload = repitt:u:CODE) and the code for manual capture (guide §4.C.1).

const props = defineProps<{
  firstName?: string | null
  lastName?: string | null
  qrPayload?: string | null
  repittCode?: string | null
}>()

const initials = computed(() => {
  const a = props.firstName?.charAt(0).toUpperCase() ?? ''
  const b = props.lastName?.charAt(0).toUpperCase() ?? ''

  return a + b || '?'
})

const fullName = computed(() => [props.firstName, props.lastName].filter(Boolean).join(' ') || 'Sin nombre')
</script>

<template>
  <div class="qr-pass">
    <div class="qr-pass__header">
      <VAvatar
        size="48"
        color="white"
      >
        <span class="text-body-1 font-weight-bold text-primary">{{ initials }}</span>
      </VAvatar>
      <div>
        <div class="text-subtitle-1 font-weight-bold text-white">
          {{ fullName }}
        </div>
        <div class="text-caption text-white qr-pass__caption">
          Mi código Repitt
        </div>
      </div>
    </div>

    <div class="qr-pass__body">
      <p class="text-caption text-medium-emphasis text-center mb-4 mt-5">
        Muéstrale este código al negocio para recibir tus sellos
      </p>

      <div class="qr-pass__qr-wrap">
        <AppQrCode
          :value="props.qrPayload"
          :size="236"
        />
      </div>

      <div class="text-caption text-medium-emphasis mt-5">
        Si no pueden escanearlo, díctales este código
      </div>
      <div
        class="qr-pass__code text-primary"
        :aria-label="props.repittCode ?? undefined"
      >
        {{ formatRepittCode(props.repittCode) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-pass {
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(var(--v-global-theme-primary), 0.2);
}

.qr-pass__header {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  gap: 14px;
  padding-block: 20px 56px;
  padding-inline: 24px;
}

.qr-pass__caption {
  opacity: 0.75;
}

.qr-pass__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 24px 24px 0 0;
  background: rgb(var(--v-theme-surface));
  margin-block-start: -28px;
  padding-block-end: 32px;
  padding-inline: 32px;
}

.qr-pass__qr-wrap {
  border-radius: 16px;
  background: white;
  box-shadow: 0 2px 16px rgba(0 0 0 / 8%);
  inline-size: 100%;
  max-inline-size: 260px;
  padding-block: 12px;
  padding-inline: 12px;
}

.qr-pass__code {
  font-family: ui-monospace, monospace !important;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin-block-start: 4px;
  white-space: pre;
}
</style>
