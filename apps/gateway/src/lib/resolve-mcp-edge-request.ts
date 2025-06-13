import { assert } from '@agentic/platform-core'

import type {
  GatewayHonoContext,
  ResolvedEdgeRequest,
  ResolvedMcpEdgeRequest
} from './types'
import { resolveConsumerForEdgeRequest } from './resolve-edge-request'

export async function resolveMcpEdgeRequest(
  ctx: GatewayHonoContext,
  resolvedEdgeRequest: ResolvedEdgeRequest
): Promise<ResolvedMcpEdgeRequest> {
  assert(
    resolvedEdgeRequest.edgeRequestMode === 'MCP',
    500,
    `Internal error: Invalid edge request mode "${resolvedEdgeRequest.edgeRequestMode}" (expected "MCP")`
  )

  const { deployment } = resolvedEdgeRequest

  // TODO: Should MCP edge requests also support Authorization header?
  const apiKey = ctx.req.query('apiKey')?.trim()

  const { consumer, pricingPlan } = await resolveConsumerForEdgeRequest(ctx, {
    deployment,
    apiKey
  })

  return {
    ...resolvedEdgeRequest,
    edgeRequestMode: 'MCP',
    consumer,
    pricingPlan
  }
}
