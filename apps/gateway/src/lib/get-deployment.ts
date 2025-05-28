import type { Deployment } from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'
import { parseFaasIdentifier } from '@agentic/platform-validators'

import type { Context } from './types'

export async function getDeployment(
  ctx: Context,
  identifier: string
): Promise<{ deployment: Deployment; toolPath: string }> {
  const parsedFaas = parseFaasIdentifier(identifier)
  assert(parsedFaas, 404, `Invalid deployment identifier "${identifier}"`)

  // TODO: maybe use an admin method here to cache it more aggressively?
  const deployment = await ctx.client.getDeploymentByIdentifier({
    deploymentIdentifier: identifier
  })
  assert(deployment, 404, `Deployment not found "${identifier}"`)

  return { deployment, toolPath: parsedFaas.toolPath }
}
