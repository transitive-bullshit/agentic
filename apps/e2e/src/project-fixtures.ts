import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Deployment } from '@agentic/platform-types'
import { loadAgenticConfig } from '@agentic/platform'
import { assert } from '@agentic/platform-core'
import pMap from 'p-map'
import semver from 'semver'

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
      const deployment = await client.createDeployment(config)
      console.log(`Deployed ${fixture} => ${deployment.identifier}`)

      return deployment
    },
    {
      concurrency
    }
  )

  return deployments
}

export async function publishDeployments(
  deployments: Deployment[],
  {
    concurrency = 1
  }: {
    concurrency?: number
  } = {}
) {
  const publishedDeployments = await pMap(
    deployments,
    async (deployment) => {
      const project = await client.getProject({
        projectId: deployment.projectId,
        populate: ['lastDeployment']
      })

      const baseVersion = project.lastPublishedDeploymentVersion || '0.0.0'
      const version = semver.inc(baseVersion, 'patch')
      assert(version, `Failed to increment deployment version "${baseVersion}"`)

      const publishedDeployment = await client.publishDeployment(
        { version },
        {
          deploymentId: deployment.id
        }
      )
      console.log(`Published ${deployment.identifier} => ${version}`)

      return publishedDeployment
    },
    {
      concurrency
    }
  )

  return publishedDeployments
}
