import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'edge-runtime',
    globals: true,
    watch: false,
    restoreMocks: true
  }
})
