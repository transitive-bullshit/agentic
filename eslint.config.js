import { config } from '@fisch0920/config/eslint'
import drizzle from 'eslint-plugin-drizzle'

export default [
  ...config,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/out/**'],
    plugins: {
      drizzle
    },
    rules: {
      ...drizzle.configs.recommended.rules,
      'no-console': 'error',
      'unicorn/no-array-reduce': 'off'
    }
  }
]
