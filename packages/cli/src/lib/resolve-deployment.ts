import type { AgenticApiClient, Deployment } from '@agentic/platform-api-client'

import { loadAgenticConfig } from './load-agentic-config'
import { AuthStore } from './store'

export async function resolveDeployment({
  client,
  deploymentIdentifier,
  fuzzyDeploymentIdentifierVersion = 'latest',
  cwd,
  populate
}: {
  client: AgenticApiClient
  deploymentIdentifier?: string
  fuzzyDeploymentIdentifierVersion?: 'dev' | 'latest'
  cwd?: string
  populate?: ('user' | 'team' | 'project')[]
}): Promise<Deployment> {
  if (!deploymentIdentifier) {
    const config = await loadAgenticConfig({ cwd })

    // TODO: team support
    const auth = AuthStore.getAuth()
    const namespace = auth.user.username

    deploymentIdentifier = `${namespace}/${config.name}@${fuzzyDeploymentIdentifierVersion}`
  }

  const deployment = await client.getDeploymentByIdentifier({
    deploymentIdentifier,
    populate
  })

  return deployment
}
