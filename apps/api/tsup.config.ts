import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/server.ts'],
    outDir: 'dist',
    target: 'node22',
    platform: 'node',
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    minify: false,
    shims: true,
    dts: true
  }
])
