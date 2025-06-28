import { config } from '@fisch0920/config/eslint'

export default [
  ...config,
  {
    ignores: ['packages/openapi-to-ts/fixtures/generated/**/*']
  },
  {
    rules: {
      'unicorn/prefer-single-call': 'off'
    }
  }
]
