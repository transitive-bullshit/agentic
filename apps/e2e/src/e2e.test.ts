import 'dotenv/config'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadAgenticConfig } from '@agentic/platform'
import { AgenticApiClient } from '@agentic/platform-api-client'
import { describe, expect, test } from 'vitest'

const fixtures = [
  'basic-raw-free-ts',
  'basic-raw-free-json',
  'pricing-freemium',
  'pricing-pay-as-you-go',
  'pricing-3-plans',
  'pricing-monthly-annual',
  'pricing-custom-0'
]

const fixturesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  '..',
  '..',
  'packages',
  'fixtures'
)
const validFixturesDir = path.join(fixturesDir, 'valid')
console.log(validFixturesDir)

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
