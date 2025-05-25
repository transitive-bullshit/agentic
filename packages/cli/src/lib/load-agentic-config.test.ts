import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, test } from 'vitest'

import { loadAgenticConfig } from './load-agentic-config'

const fixtures = [
  'basic-raw-free-ts',
  'basic-raw-free-json',
  'pricing-freemium',
  'pricing-pay-as-you-go',
  'pricing-3-plans'
]

const fixturesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  '..',
  'fixtures'
)

describe('loadAgenticConfig', () => {
  for (const fixture of fixtures) {
    test(
      `${fixture}`,
      {
        timeout: 60_000
      },
      async () => {
        const fixtureDir = path.join(fixturesDir, fixture)

        const config = await loadAgenticConfig({ cwd: fixtureDir })
        expect(config).toMatchSnapshot()
      }
    )
  }
})
