import type { AgenticApiClient } from '@agentic/platform-api-client'
import type { Deployment } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import pMap from 'p-map'
import semver from 'semver'

export async function publishDeployments(
  deployments: Deployment[],
  {
    client,
    concurrency = 1
  }: {
    client: AgenticApiClient
    concurrency?: number
  }
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
