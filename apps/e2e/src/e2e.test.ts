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
  'pricing-custom-0',
  'basic-openapi'
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

const client = new AgenticApiClient({
  apiBaseUrl: process.env.AGENTIC_API_BASE_URL
})
await client.setRefreshAuthToken(process.env.AGENTIC_API_REFRESH_TOKEN!)

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
