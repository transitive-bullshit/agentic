import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'build',
    target: 'node16',
    platform: 'node',
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    minify: false,
    shims: true,
    dts: true,
    external: ['undici']
  },
  {
    entry: ['src/index.ts'],
    outDir: 'build/browser',
    target: 'chrome89',
    platform: 'browser',
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    minify: false,
    shims: true,
    dts: true,
    external: ['undici']
  }
])
