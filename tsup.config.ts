import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      'src/sdks/ai-sdk.ts',
      'src/sdks/dexter.ts',
      'src/sdks/genkit.ts',
      'src/tools/calculator.ts'
    ],
    outDir: 'dist',
    target: 'node18',
    platform: 'node',
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    minify: false,
    shims: true,
    dts: true
  }
])
