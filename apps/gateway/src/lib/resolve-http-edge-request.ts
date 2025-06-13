import { assert } from '@agentic/platform-core'

import type {
  GatewayHonoContext,
  ResolvedEdgeRequest,
  ResolvedHttpEdgeRequest
} from './types'
import { getTool } from './get-tool'
import { getToolArgsFromRequest } from './get-tool-args-from-request'
import { resolveConsumerForEdgeRequest } from './resolve-edge-request'
import { isRequestPubliclyCacheable } from './utils'

/**
 * Resolves an input HTTP request to a specific deployment, tool call, consumer,
 * and pricing plan.
 */
export async function resolveHttpEdgeRequest(
  ctx: GatewayHonoContext,
  resolvedEdgeRequest: ResolvedEdgeRequest
): Promise<ResolvedHttpEdgeRequest> {
  const logger = ctx.get('logger')
  const ip = ctx.get('ip')

  const cacheControl = isRequestPubliclyCacheable(ctx.req.raw)
    ? ctx.req.header('cache-control')
    : 'no-store'

  const { deployment, parsedToolIdentifier } = resolvedEdgeRequest
  const { toolName } = parsedToolIdentifier
  const { method } = ctx.req

  const tool = getTool({
    method,
    deployment,
    toolName
  })

  logger.debug('request', {
    method,
    deploymentIdentifier: deployment.identifier,
    toolName,
    tool
  })

  const apiKey = (ctx.req.header('authorization') || '')
    .replace(/^Bearer /i, '')
    .trim()

  const { consumer, pricingPlan } = await resolveConsumerForEdgeRequest(ctx, {
    deployment,
    apiKey
  })

  if (consumer) {
    if (!ctx.get('sessionId')) {
      ctx.set('sessionId', `${consumer.id}:${deployment.id}`)
    }
  } else {
    if (!ctx.get('sessionId')) {
      assert(ip, 500, 'IP address is required for unauthenticated requests')
      ctx.set('sessionId', `${ip}:${deployment.projectId}`)
    }
  }

  // Parse tool call arguments from the request body.
  const toolCallArgs = await getToolArgsFromRequest(ctx, { tool, deployment })

  return {
    ...resolvedEdgeRequest,
    consumer,
    pricingPlan,
    tool,
    toolCallArgs,
    cacheControl
  }
}
