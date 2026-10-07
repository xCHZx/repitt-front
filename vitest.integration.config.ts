import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Contract smoke tests against a local backend: BACKEND_LOG=<log> pnpm test:integration
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.int.spec.ts'],
    environment: 'node',
    testTimeout: 30_000,
    sequence: { concurrent: false },
    env: {
      VITE_API_URL: process.env.VITE_API_URL ?? 'http://localhost:3000/v1',
    },
  },
})
