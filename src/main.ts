import { createApp } from 'vue'

import axios from './services/axios'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// const pinia = createPinia()

// pinia.use(piniaPluginPersistedstate)

// Register plugins
registerPlugins(app)

// Mount vue app
// app.use(pinia)
app.use(axios, {
  baseUrl: import.meta.env.VITE_APP_API_URL,
})
app.mount('#app')
