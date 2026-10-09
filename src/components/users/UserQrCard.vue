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
        class="qr-pass__avatar"
        rounded="lg"
      >
        <span class="qr-pass__initials">{{ initials }}</span>
      </VAvatar>
      <div>
        <div class="text-subtitle-1 font-weight-bold">
          {{ fullName }}
        </div>
        <div class="text-body-2">
          Mi código Repitt
        </div>
      </div>
    </div>

    <div class="qr-pass__body">
      <p class="note mb-0">
        Muéstrale este código al negocio para recibir tus sellos
      </p>

      <div class="qr-pass__qr-wrap">
        <AppQrCode
          :value="props.qrPayload"
          :size="236"
        />
      </div>

      <div>
        <p class="note mb-1">
          Si no pueden escanearlo, díctales este código
        </p>
        <div
          class="qr-pass__code cifra"
          :aria-label="props.repittCode ?? undefined"
        >
          {{ formatRepittCode(props.repittCode) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-pass {
  overflow: hidden;
  border: 1px solid var(--linea);
  border-radius: var(--r-superficie);
  background: var(--superficie);
}

/* Cabecera violeta plana con texto blanco (guía §2.6: #fff sobre --violeta) */
.qr-pass__header {
  display: flex;
  align-items: center;
  background: var(--violeta);
  color: var(--papel);
  gap: var(--s-4);
  padding-block: var(--s-5) var(--s-7);
  padding-inline: var(--s-5);
}

.v-avatar.qr-pass__avatar {
  background: var(--papel);
}

.qr-pass__initials {
  color: var(--violeta-tinta);
  font-size: var(--t-body);
  font-weight: 800;
}

.qr-pass__body {
  display: grid;
  background: var(--superficie);
  border-start-end-radius: var(--r-superficie);
  border-start-start-radius: var(--r-superficie);
  gap: var(--s-5);
  justify-items: start;
  margin-block-start: calc(var(--s-5) * -1);
  padding-block: var(--s-5) var(--s-6);
  padding-inline: var(--s-5);
}

/* El QR va siempre sobre papel blanco, también en oscuro */
.qr-pass__qr-wrap {
  padding: var(--s-3);
  border: 1px solid var(--linea);
  border-radius: var(--r-control);
  background: var(--papel);
  inline-size: 100%;
  max-inline-size: 260px;
}

.qr-pass__code {
  color: var(--enlace);
  white-space: pre;
}
</style>
