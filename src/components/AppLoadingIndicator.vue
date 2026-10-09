<script setup lang="ts">
const bufferValue = ref(20)
const progressValue = ref(10)
const isFallbackState = ref(false)
const interval = ref<ReturnType<typeof setInterval>>()
const showProgress = ref(false)

watch([progressValue, isFallbackState], () => {
  if (progressValue.value > 80 && isFallbackState.value)
    progressValue.value = 82

  startBuffer()
})

function startBuffer() {
  clearInterval(interval.value)
  interval.value = setInterval(() => {
    progressValue.value += Math.random() * (15 - 5) + 5
    bufferValue.value += Math.random() * (15 - 5) + 6
  }, 800)
}

const fallbackHandle = () => {
  showProgress.value = true
  progressValue.value = 10
  isFallbackState.value = true
  startBuffer()
}

const resolveHandle = () => {
  isFallbackState.value = false
  progressValue.value = 100

  setTimeout(() => {
    clearInterval(interval.value)
    progressValue.value = 0
    bufferValue.value = 20
    showProgress.value = false
  }, 300)
}

defineExpose({
  fallbackHandle,
  resolveHandle,
})
</script>

<template>
  <!-- loading state via #fallback slot -->
  <div
    v-if="showProgress"
    class="app-loading-indicator"
  >
    <VProgressLinear
      v-model="progressValue"
      :buffer-value="bufferValue"
      color="primary"
      height="2"
    />
  </div>
</template>

<style scoped>
/* Barra de carga de ruta: pista --linea y relleno --acento (los pone la capa global de Vuetify) */
.app-loading-indicator {
  position: fixed;
  z-index: 9999;
  inset-block-start: 0;
  inset-inline: 0;
}
</style>
