import type { AdminDeployment } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseToolIdentifier } from '@agentic/platform-validators'

import type { GatewayHonoContext } from './types'

export async function getAdminDeployment(
  ctx: GatewayHonoContext,
  identifier: string
): Promise<{ deployment: AdminDeployment; toolPath: string }> {
  const parsedFaas = parseToolIdentifier(identifier)
  assert(parsedFaas, 404, `Invalid deployment identifier "${identifier}"`)

  const client = ctx.get('client')
  const deployment = await client.adminGetDeploymentByIdentifier({
    deploymentIdentifier: identifier
  })
  assert(deployment, 404, `Deployment not found "${identifier}"`)

  return { deployment, toolPath: parsedFaas.toolPath }
}
