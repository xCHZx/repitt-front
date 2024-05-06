import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { App } from 'vue'

const store = createPinia()

store.use(piniaPluginPersistedstate)

export default function (app: App) {
  app.use(store)
}
