<script setup lang="ts">
interface Props {
  firstName?: string
  lastName?: string
  qrPath?: string
  repittCode?: string
}

const props = defineProps<Props>()

const initials = computed(() => {
  const a = props.firstName?.charAt(0).toUpperCase() ?? ''
  const b = props.lastName?.charAt(0).toUpperCase() ?? ''
  return a + b || '?'
})

const fullName = computed(() => {
  const name = [props.firstName, props.lastName].filter(Boolean).join(' ')
  return name || 'Sin nombre'
})
</script>

<template>
  <div class="qr-pass">
    <!-- Header del pase -->
    <div class="qr-pass__header">
      <VAvatar
        size="48"
        color="white"
        class="qr-pass__avatar"
      >
        <span
          class="text-body-1 font-weight-bold"
          style="color: rgb(var(--v-theme-primary));"
        >{{ initials }}</span>
      </VAvatar>

      <div>
        <div class="text-subtitle-1 font-weight-bold text-white">
          {{ fullName }}
        </div>
        <div
          class="text-caption text-white"
          style="opacity: 0.75;"
        >
          Código de visitas · Repitt
        </div>
      </div>
    </div>

    <!-- Cuerpo blanco con QR -->
    <div class="qr-pass__body">
      <p class="text-caption text-medium-emphasis text-center mb-4 mt-5">
        Muéstrale este código al negocio
      </p>

      <!-- QR siempre en fondo blanco para escaneo -->
      <div class="qr-pass__qr-wrap">
        <VImg
          :src="qrPath"
          :aspect-ratio="1"
          width="100%"
        >
          <template #placeholder>
            <div
              class="d-flex align-center justify-center fill-height"
              style="min-block-size: 240px;"
            >
              <VProgressCircular
                indeterminate
                color="primary"
              />
            </div>
          </template>
        </VImg>
      </div>

      <VChip
        color="primary"
        variant="tonal"
        size="large"
        class="mt-5"
      >
        <VIcon
          start
          icon="tabler-barcode"
          size="18"
        />
        {{ repittCode || '—' }}
      </VChip>
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
</style>
