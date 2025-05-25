import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, test } from 'vitest'

import { loadAgenticConfig } from './load-agentic-config'

const fixtures = [
  'basic-raw-free-ts',
  'basic-raw-free-json',
  'pricing-freemium',
  'pricing-pay-as-you-go',
  'pricing-3-plans',
  'pricing-monthly-annual'
]

const invalidFixtures = [
  'pricing-base-inconsistent',
  'pricing-custom-inconsistent',
  'pricing-empty-0',
  'pricing-empty-1',
  'pricing-empty-2',
  'pricing-duplicate-0',
  'pricing-duplicate-1'
]

const fixturesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  '..',
  'fixtures'
)

const invalidFixturesDir = path.join(fixturesDir, 'invalid')

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

  for (const fixture of invalidFixtures) {
    test(
      `invalid: ${fixture}`,
      {
        timeout: 60_000
      },
      async () => {
        const fixtureDir = path.join(invalidFixturesDir, fixture)

        await expect(
          loadAgenticConfig({ cwd: fixtureDir })
        ).rejects.toThrowErrorMatchingSnapshot()
      }
    )
  }
})
