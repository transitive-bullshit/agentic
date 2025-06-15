import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadAgenticConfig } from '@agentic/platform'
import pMap from 'p-map'

import { client } from './client'

const fixtures = [
  // TODO: re-add these
  // 'basic-raw-free-ts',
  // 'basic-raw-free-json',
  // 'pricing-freemium',
  // 'pricing-pay-as-you-go',
  // 'pricing-3-plans',
  // 'pricing-monthly-annual',
  // 'pricing-custom-0',
  'basic-openapi',
  'basic-mcp',
  'everything-openapi'
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

export async function deployFixtures({
  concurrency = 1
}: {
  concurrency?: number
} = {}) {
  const deployments = await pMap(
    fixtures,
    async (fixture) => {
      const fixtureDir = path.join(validFixturesDir, fixture)

      const config = await loadAgenticConfig({ cwd: fixtureDir })
      console.log(config)

      const deployment = await client.createDeployment(config)
      return deployment
    },
    {
      concurrency
    }
  )

  return deployments
}
