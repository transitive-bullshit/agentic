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
  const { deployment } = resolvedEdgeRequest

  // TODO: Should MCP edge requests also support Authorization header?
  const apiKey = ctx.req.query('apiKey')?.trim()

  const { consumer, pricingPlan } = await resolveConsumerForEdgeRequest(ctx, {
    deployment,
    apiKey
  })

  return {
    ...resolvedEdgeRequest,
    consumer,
    pricingPlan
  }
}
