<script setup lang="ts">
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@layouts/utils'
import ReauthDialog from '@/components/auth/ReauthDialog.vue'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()

// Los tokens (src/styles/tokens.css) cambian con <html data-theme>: se alinea con el tema resuelto
// de Vuetify (light/dark/system ya resuelto) y la barra del navegador toma el --fondo del tema.
const THEME_COLOR = { light: '#f7f6fe', dark: '#25293c' } as const

watch(
  () => global.name.value,
  name => {
    const theme = name === 'dark' ? 'dark' : 'light'

    document.documentElement.dataset.theme = theme
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.setAttribute('content', THEME_COLOR[theme])
    })
  },
  { immediate: true },
)
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />

      <ReauthDialog />
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
