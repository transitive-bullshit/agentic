import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'build',
    target: 'node16',
    platform: 'node',
    format: ['esm', 'cjs'],
    splitting: false,
    sourcemap: true,
    minify: false,
    shims: true,
    dts: true,
    esbuildOptions(options, context) {
      options.target = 'es2020'
      options.jsx = 'preserve'
    }
  }
])
