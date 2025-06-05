import type { AgenticApiClient } from '@agentic/platform-api-client'
import type { Deployment } from '@agentic/platform-types'
import { loadAgenticConfig } from '@agentic/platform'

import { AuthStore } from './auth-store'

export async function resolveDeployment({
  client,
  deploymentIdentifier,
  fuzzyDeploymentIdentifierVersion,
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

    // TODO: re-add team support
    const auth = AuthStore.getAuth()
    const namespace = auth.user.username

    // TODO: resolve deploymentIdentifier; config name may include namespace?
    // TODO: this needs work...

    deploymentIdentifier = `@${namespace}/${config.name}${fuzzyDeploymentIdentifierVersion ? `@${fuzzyDeploymentIdentifierVersion}` : ''}`
  }

  const deployment = await client.getDeploymentByIdentifier({
    deploymentIdentifier,
    populate
  })

  return deployment
}
