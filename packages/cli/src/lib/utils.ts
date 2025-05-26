import type { Deployment } from '@agentic/platform-api-client'

export function pruneDeployment(
  deployment: Deployment,
  { verbose = false }: { verbose?: boolean }
): Deployment {
  if (!verbose) {
    const d = structuredClone(deployment)

    if (d.readme) {
      d.readme = '<omitted>'
    }

    if (d.originAdapter?.type === 'openapi') {
      d.originAdapter.spec = '<omitted>'
    }

    return d
  }

  return deployment
}
