import type { PricingPlan, RateLimit } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

import type { AdminConsumer, Context, ResolvedOriginRequest } from './types'
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
  ctx: Context
): Promise<ResolvedOriginRequest> {
  const { req } = ctx
  const ip = req.headers.get('cf-connecting-ip') || undefined
  const requestUrl = new URL(req.url)

  const { search, pathname } = requestUrl
  const method = req.method.toLowerCase()
  const requestPathParts = pathname.split('/')
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

  console.log('request', {
    method,
    pathname,
    search,
    deploymentIdentifier: deployment.identifier,
    toolPath,
    tool
  })

  let pricingPlan: PricingPlan | undefined
  let consumer: AdminConsumer | undefined
  let reportUsage = true

  const token = (req.headers.get('authorization') || '')
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

    // TODO: Ensure that consumer.plan is compatible with the target deployment
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

    // assert(
    //   pricingPlan,
    //   403,
    //   `Auth error, unable to find matching pricing plan for project "${deployment.project}"`
    // )

    // assert(
    //   !pricingPlan.auth,
    //   403,
    //   `Auth error, encountered invalid pricing plan "${pricingPlan.slug}" for project "${deployment.project}"`
    // )
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
        requestsLineItem?.slug === 'requests',
        403,
        `Invalid pricing plan "${pricingPlan.slug}" for project "${deployment.project}"`
      )

      rateLimit = requestsLineItem?.rateLimit
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

  // TODO: what do we want the API gateway's interface to be?
  //   - support both MCP and OpenAPI / raw?

  const { originAdapter } = deployment
  let originRequest: Request | undefined

  if (originAdapter.type === 'openapi' || originAdapter.type === 'raw') {
    const originRequestUrl = `${deployment.originUrl}${toolPath}${search}`
    console.log('originRequestUrl', originRequestUrl)

    originRequest = new Request(originRequestUrl, req)

    // TODO: For OpenAPI, we need to convert from POST to the correct operation?
    // Or, do we only support a single public MCP interface?
    if (originAdapter.type === 'openapi') {
      const operation = originAdapter.toolToOperationMap[tool.name]
      assert(operation, 404, `Tool "${tool.name}" not found in OpenAPI spec`)

      // req.method = operation.method
    } else {
      originRequest = new Request(originRequestUrl, req)
    }

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
