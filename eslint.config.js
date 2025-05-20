import { config } from '@fisch0920/config/eslint'

export default [
  ...config,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'error',
      'unicorn/no-array-reduce': 'off'
    }
  },
  {
    ignores: ['**/out/**', 'packages/api-client/src/openapi.d.ts']
  }
]
