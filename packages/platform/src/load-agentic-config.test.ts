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
  'pricing-monthly-annual',
  'pricing-custom-0',
  'basic-openapi',
  'basic-mcp',
  'everything-openapi',
  'metadata-0',
  'metadata-1',
  'metadata-2'
]

const invalidFixtures = [
  'pricing-base-inconsistent',
  'pricing-custom-inconsistent',
  'pricing-empty-0',
  'pricing-empty-1',
  'pricing-empty-2',
  'pricing-duplicate-0',
  'pricing-duplicate-1',
  'invalid-origin-url-0',
  'invalid-origin-url-1',
  'invalid-origin-url-2',
  'invalid-origin-url-3',
  'invalid-name-0',
  'invalid-name-1',
  'invalid-name-2',
  'invalid-slug-0',
  'invalid-slug-1',
  'invalid-slug-2',
  'invalid-slug-3',
  'invalid-slug-4',
  'invalid-metadata-0',
  'invalid-metadata-1'
]

const fixturesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  '..',
  '..',
  'fixtures'
)

const validFixturesDir = path.join(fixturesDir, 'valid')
const invalidFixturesDir = path.join(fixturesDir, 'invalid')

describe('loadAgenticConfig', () => {
  for (const fixture of fixtures) {
    test(
      `${fixture}`,
      {
        timeout: 60_000
      },
      async () => {
        const fixtureDir = path.join(validFixturesDir, fixture)

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
