import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3001
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      target: 'vercel'
    })
  ]
})
