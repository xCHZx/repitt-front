import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests for framework-free modules (src/api, src/utils). Kept apart from vite.config.ts
// so tests do not load Vuetify / auto-import / router plugins.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    env: {
      VITE_API_URL: 'http://api.test/v1',
    },
  },
})
