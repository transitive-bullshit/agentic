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

    // if (d.origin?.type === 'openapi') {
    //   d.origin.spec = '<omitted>'
    //   d.origin.toolToOperationMap = '<omitted>' as any
    // }

    return d
  }

  return deployment
}
