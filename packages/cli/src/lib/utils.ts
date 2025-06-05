import type { Deployment } from '@agentic/platform-types'

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
      d.originAdapter.toolToOperationMap = '<omitted>' as any
    }

    return d
  }

  return deployment
}
