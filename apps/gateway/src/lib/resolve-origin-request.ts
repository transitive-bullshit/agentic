import type { PricingPlan, RateLimit } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

import type {
  AdminConsumer,
  GatewayHonoContext,
  ResolvedOriginRequest
} from './types'
import { createRequestForOpenAPIOperation } from './create-request-for-openapi-operation'
import { enforceRateLimit } from './enforce-rate-limit'
import { getAdminConsumer } from './get-admin-consumer'
import { getAdminDeployment } from './get-admin-deployment'
import { getTool } from './get-tool'
import { updateOriginRequest } from './update-origin-request'

/**
 * Resolves an input HTTP request to a specific deployment, tool call, and
 * billing subscription.
 *
 * Also ensures that the request is valid, enforces rate limits, and adds proxy-
 * specific headers to the origin request.
 */
export async function resolveOriginRequest(
  ctx: GatewayHonoContext
): Promise<ResolvedOriginRequest> {
  const logger = ctx.get('logger')
  // cf-connecting-ip should always be present, but if not we can fallback to XFF.
  const ip =
    ctx.req.header('cf-connecting-ip') ||
    ctx.req.header('x-forwarded-for') ||
    undefined
  const { method } = ctx.req
  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestPathParts = pathname.split('/')

  // TODO: the isMCPRequest logic needs to be completely redone.
  const isMCPRequest = requestPathParts[0] === 'mcp'
  const requestPath = isMCPRequest
    ? requestPathParts.slice(1).join('/')
    : pathname

  const { deployment, toolPath } = await getAdminDeployment(ctx, requestPath)

  const tool = getTool({
    method,
    deployment,
    toolPath
  })

  logger.debug('request', {
    method,
    pathname,
    deploymentIdentifier: deployment.identifier,
    toolPath,
    tool
  })

  let pricingPlan: PricingPlan | undefined
  let consumer: AdminConsumer | undefined
  let reportUsage = true

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
  } else {
    // For unauthenticated requests, default to a free pricing plan if available.
    pricingPlan = deployment.pricingPlans.find((plan) => plan.slug === 'free')
  }

  let rateLimit: RateLimit | undefined | null

  // Resolve rate limit and whether to report `requests` usage based on the
  // customer's pricing plan and deployment config.
  if (pricingPlan) {
    const requestsLineItem = pricingPlan.lineItems.find(
      (lineItem) => lineItem.slug === 'requests'
    )

    if (requestsLineItem) {
      assert(
        requestsLineItem.slug === 'requests',
        403,
        `Invalid pricing plan "${pricingPlan.slug}" for project "${deployment.project}"`
      )

      rateLimit = requestsLineItem.rateLimit
    } else {
      // No `requests` line-item, so we don't report usage for this tool.
      reportUsage = false
    }
  }

  const toolConfig = deployment.toolConfigs.find(
    (toolConfig) => toolConfig.name === tool.name
  )

  if (toolConfig) {
    if (toolConfig.reportUsage !== undefined) {
      reportUsage &&= !!toolConfig.reportUsage
    }

    if (toolConfig.rateLimit !== undefined) {
      // TODO: Improve RateLimitInput vs RateLimit types
      rateLimit = toolConfig.rateLimit as RateLimit
    }

    const pricingPlanToolConfig = pricingPlan
      ? toolConfig.pricingPlanConfig?.[pricingPlan.slug]
      : undefined

    if (pricingPlan && pricingPlanToolConfig) {
      assert(
        pricingPlanToolConfig.enabled &&
          pricingPlanToolConfig.enabled === undefined &&
          toolConfig.enabled,
        403,
        `Tool "${tool.name}" is not enabled for pricing plan "${pricingPlan.slug}"`
      )

      if (pricingPlanToolConfig.reportUsage !== undefined) {
        reportUsage &&= !!pricingPlanToolConfig.reportUsage
      }

      if (pricingPlanToolConfig.rateLimit !== undefined) {
        // TODO: Improve RateLimitInput vs RateLimit types
        rateLimit = pricingPlanToolConfig.rateLimit as RateLimit
      }
    } else {
      assert(toolConfig.enabled, 403, `Tool "${tool.name}" is not enabled`)
    }
  }

  if (rateLimit) {
    await enforceRateLimit(ctx, {
      id: consumer?.id ?? ip,
      interval: rateLimit.interval * 1000,
      maxPerInterval: rateLimit.maxPerInterval,
      method,
      pathname
    })
  }

  const { originAdapter } = deployment
  let originRequest: Request | undefined

  if (originAdapter.type === 'openapi' || originAdapter.type === 'raw') {
    if (originAdapter.type === 'openapi') {
      const operation = originAdapter.toolToOperationMap[tool.name]
      assert(operation, 404, `Tool "${tool.name}" not found in OpenAPI spec`)

      originRequest = await createRequestForOpenAPIOperation(ctx, {
        tool,
        operation,
        deployment
      })
    } else {
      const originRequestUrl = `${deployment.originUrl}${toolPath}${requestUrl.search}`
      originRequest = new Request(originRequestUrl, ctx.req.raw)
    }

    logger.info('originRequestUrl', originRequest.url)
    updateOriginRequest(originRequest, { consumer, deployment })
  }

  return {
    originRequest,
    deployment,
    consumer,
    tool,
    ip,
    method,
    pricingPlanSlug: pricingPlan?.slug,
    reportUsage
  }
}
