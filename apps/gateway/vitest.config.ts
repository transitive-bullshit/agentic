import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'edge-runtime',
    globals: true,
    watch: false,
    restoreMocks: true
  }
})
