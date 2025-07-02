import type { AgenticApiClient } from '@agentic/platform-api-client'
import { loadAgenticConfig } from '@agentic/platform'
import pMap from 'p-map'

export async function deployProjects(
  projects: string[],
  {
    client,
    concurrency = 1
  }: {
    client: AgenticApiClient
    concurrency?: number
  }
) {
  const deployments = await pMap(
    projects,
    async (project) => {
      const config = await loadAgenticConfig({
        cwd: project
      })
      const deployment = await client.createDeployment(config)
      console.log(`Deployed ${project} => ${deployment.identifier}`)

      return deployment
    },
    {
      concurrency
    }
  )

  return deployments
}
