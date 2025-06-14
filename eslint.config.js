import { config } from '@fisch0920/config/eslint'
import drizzle from 'eslint-plugin-drizzle'

export default [
  ...config,
  {
    ignores: [
      '**/out/**',
      'packages/types/src/openapi.d.ts',
      'apps/gateway/src/worker.d.ts',
      'packages/json-schema/test/json-schema-test-suite.ts',
      'apps/gateway/.wrangler',
      'apps/web/src/*.gen.ts'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'error',
      'unicorn/no-array-reduce': 'off'
    }
  },
  {
    files: [
      'packages/cli/src/**/*.ts',
      '**/*.test.ts',
      'packages/fixtures/valid/**/*.ts'
    ],
    rules: {
      'no-console': 'off',
      'no-process-env': 'off',
      'unicorn/no-process-exit': 'off'
    }
  },
  {
    files: ['apps/api/src/**/*.ts'],
    plugins: {
      drizzle
    },
    rules: {
      ...drizzle.configs.recommended.rules
    }
  },
  {
    files: ['apps/web/src/**/*.{tsx,ts}'],
    rules: {
      'no-console': 'off'
    }
  }
]
