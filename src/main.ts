import { createApp } from 'vue'

import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Estilo de la landing (plan 2026-10-08): tokens → fuentes → base → capa sobre Vuetify/Vuexy
import '@/styles/tokens.css'
import '@/styles/fuentes.css'
import '@/styles/base.scss'
import '@/styles/vuetify.scss'

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
