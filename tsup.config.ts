import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'build',
  target: 'node14',
  platform: 'node',
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  minify: true,
  shims: false,
  dts: true
})
