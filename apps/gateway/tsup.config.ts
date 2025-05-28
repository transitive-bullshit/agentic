import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/worker.ts'],
    outDir: 'dist',
    target: 'es2021',
    platform: 'browser',
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    minify: false,
    shims: true,
    dts: true
  }
])
