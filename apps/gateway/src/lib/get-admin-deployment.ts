import type { AdminDeployment } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'

import type { GatewayHonoContext } from './types'

export async function getAdminDeployment(
  ctx: GatewayHonoContext,
  identifier: string
): Promise<AdminDeployment> {
  const parsedDeploymentIdentifier = parseDeploymentIdentifier(identifier, {
    strict: true,
    errorStatusCode: 404
  })

  const client = ctx.get('client')
  const deployment = await client.adminGetDeploymentByIdentifier({
    deploymentIdentifier: parsedDeploymentIdentifier.deploymentIdentifier
  })
  assert(deployment, 404, `Deployment not found "${identifier}"`)

  return deployment
}
