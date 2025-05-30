import type { Consumer } from '@agentic/platform-api-client'
import type { PricingPlan, RateLimit } from '@agentic/platform-schemas'
import { assert } from '@agentic/platform-core'

import type { Context } from './types'
import { getConsumer } from './get-consumer'
import { getDeployment } from './get-deployment'
import { getTool } from './get-tool'
import { updateOriginRequest } from './update-origin-request'

/**
 * Resolves an input HTTP request to a specific deployment, tool call, and
 * billing subscription.
 *
 * Also ensures that the request is valid, enforces rate limits, and adds proxy-
 * specific headers to the origin request.
 */
export async function resolveOriginRequest(ctx: Context) {
  const { req } = ctx
  const ip = req.headers.get('cf-connecting-ip')
  const requestUrl = new URL(req.url)
  const date = Date.now()

  const { search, pathname } = requestUrl
  let { method } = req
  console.log('request', method, { search, pathname })
  method = method.toLowerCase()

  const { deployment, toolPath } = await getDeployment(ctx, pathname)
  console.log('deployment', { deployment: deployment.id, toolPath })

  const tool = getTool({
    method,
    deployment,
    toolPath
  })

  let reportUsage = true
  let pricingPlan: PricingPlan | undefined
  let consumer: Consumer | undefined

  const token = (req.headers.get('authorization') || '')
    .replace(/^Bearer /i, '')
    .trim()

  if (token) {
    consumer = await getConsumer(ctx, token)
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

  // enforce requests rate limits
  if (rateLimit) {
    await enforceRateLimit(ctx, {
      id: consumer ? consumer.id : ip,
      duration: rateLimit.interval * 1000,
      max: rateLimit.maxPerInterval,
      method,
      pathname
    })
  }

  const baseUrl = deployment.originUrl.replaceAll(/\/$/g, '')
  // TODO: Everything from here on depends on the origin adapter type.
  // For MCP, we need(?) to use an McpClient and SSEClientTransport?
  // For OpenAPI and raw, we need to make an origin HTTP request.

  const originUrl = `${baseUrl}${toolPath}${search}`
  console.log('originUrl', originUrl)

  const originReq = new Request(originUrl, req)
  updateOriginRequest(originReq, { consumer, deployment, ip })

  return {
    originReq,
    deployment: deployment.id,
    project: deployment.project,
    tool,
    consumer,
    date,
    ip,
    method,
    plan: pricingPlan ? pricingPlan.slug : null,
    reportUsage
  }
}
