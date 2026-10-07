<!-- Renders a QR from a payload string (`MeDto.qrPayload`, `MeCardDto.qrPayload`): v1 sends text, not images. -->
<script setup lang="ts">
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  value: string | null | undefined
  size?: number
}>(), {
  size: 240,
})

const dataUrl = ref<string | null>(null)

watch(() => [props.value, props.size] as const, async ([value, size]) => {
  dataUrl.value = value
    ? await QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: 'M' })
    : null
}, { immediate: true })
</script>

<template>
  <div
    class="app-qr"
    :style="{ maxInlineSize: `${props.size}px` }"
  >
    <VImg
      v-if="dataUrl"
      :src="dataUrl"
      :aspect-ratio="1"
      width="100%"
      alt="Código QR"
    />
    <VSkeletonLoader
      v-else
      type="image"
    />
  </div>
</template>

<style scoped>
.app-qr {
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  inline-size: 100%;
  margin-inline: auto;
}
</style>
