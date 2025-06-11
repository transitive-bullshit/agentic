import type {
  AdminDeployment,
  PricingPlan,
  Tool
} from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseToolIdentifier } from '@agentic/platform-validators'

import type { AdminConsumer, GatewayHonoContext, ToolCallArgs } from './types'
import { getAdminConsumer } from './get-admin-consumer'
import { getAdminDeployment } from './get-admin-deployment'
import { getTool } from './get-tool'
import { getToolArgsFromRequest } from './get-tool-args-from-request'
import { isRequestPubliclyCacheable } from './utils'

export type ResolvedHttpEdgeRequest = {
  deployment: AdminDeployment
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan

  tool: Tool
  toolCallArgs: ToolCallArgs
  cacheControl?: string
}

/**
 * Resolves an input HTTP request to a specific deployment, tool call, and
 * billing subscription.
 *
 * Also ensures that the request is valid, enforces rate limits, and adds proxy-
 * specific headers to the origin request.
 */
export async function resolveHttpEdgeRequest(
  ctx: GatewayHonoContext
): Promise<ResolvedHttpEdgeRequest> {
  const logger = ctx.get('logger')
  const ip = ctx.get('ip')

  const cacheControl = isRequestPubliclyCacheable(ctx.req.raw)
    ? ctx.req.header('cache-control')
    : 'no-cache'

  const { method } = ctx.req
  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestedToolIdentifier = pathname.replace(/^\//, '').replace(/\/$/, '')
  const { toolName, deploymentIdentifier } = parseToolIdentifier(
    requestedToolIdentifier
  )

  const deployment = await getAdminDeployment(ctx, deploymentIdentifier)

  const tool = getTool({
    method,
    deployment,
    toolName
  })

  logger.debug('request', {
    method,
    pathname,
    deploymentIdentifier: deployment.identifier,
    toolName,
    tool
  })

  let pricingPlan: PricingPlan | undefined
  let consumer: AdminConsumer | undefined

  const token = (ctx.req.header('authorization') || '')
    .replace(/^Bearer /i, '')
    .trim()

  if (token) {
    consumer = await getAdminConsumer(ctx, token)
    assert(consumer, 401, `Invalid auth token "${token}"`)
    assert(
      consumer.isStripeSubscriptionActive,
      402,
      `Auth token "${token}" does not have an active subscription`
    )
    assert(
      consumer.projectId === deployment.projectId,
      403,
      `Auth token "${token}" is not authorized for project "${deployment.projectId}"`
    )

    // TODO: Ensure that consumer.plan is compatible with the target deployment?
    // TODO: This could definitely cause issues when changing pricing plans.

    pricingPlan = deployment.pricingPlans.find(
      (pricingPlan) => consumer!.plan === pricingPlan.slug
    )

    // assert(
    //   pricingPlan,
    //   403,
    //   `Auth token "${token}" unable to find matching pricing plan for project "${deployment.project}"`
    // )

    if (!ctx.get('sessionId')) {
      ctx.set('sessionId', `${consumer.id}:${deployment.id}`)
    }
  } else {
    // For unauthenticated requests, default to a free pricing plan if available.
    pricingPlan = deployment.pricingPlans.find((plan) => plan.slug === 'free')

    if (!ctx.get('sessionId')) {
      assert(ip, 500, 'IP address is required for unauthenticated requests')
      ctx.set('sessionId', `${ip}:${deployment.projectId}`)
    }
  }

  assert(ctx.get('sessionId'), 500, 'Internal error: sessionId should be set')

  // Parse tool call args from the request body.
  const toolCallArgs = await getToolArgsFromRequest(ctx, { tool, deployment })

  return {
    deployment,
    consumer,
    pricingPlan,
    tool,
    toolCallArgs,
    cacheControl
  }
}
