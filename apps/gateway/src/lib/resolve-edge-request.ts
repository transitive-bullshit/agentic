import type { AdminDeployment, PricingPlan } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseToolIdentifier } from '@agentic/platform-validators'

import type {
  AdminConsumer,
  GatewayHonoContext,
  ResolvedEdgeRequest
} from './types'
import { getAdminConsumer } from './get-admin-consumer'
import { getAdminDeployment } from './get-admin-deployment'

/**
 * Resolves an input HTTP request to a specific deployment.
 */
export async function resolveEdgeRequest(
  ctx: GatewayHonoContext
): Promise<ResolvedEdgeRequest> {
  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestedToolIdentifier = pathname.replace(/^\//, '').replace(/\/$/, '')
  const parsedToolIdentifier = parseToolIdentifier(requestedToolIdentifier)

  const deployment = await getAdminDeployment(
    ctx,
    parsedToolIdentifier.deploymentIdentifier
  )

  return {
    parsedToolIdentifier,
    deployment,
    requestId: ctx.get('requestId'),
    ip: ctx.get('ip')
  }
}

/**
 * Resolves a consumer and pricing plan for an edge request.
 */
export async function resolveConsumerForEdgeRequest(
  ctx: GatewayHonoContext,
  {
    deployment,
    apiKey
  }: {
    deployment: AdminDeployment
    apiKey?: string
  }
): Promise<{
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
}> {
  let pricingPlan: PricingPlan | undefined
  let consumer: AdminConsumer | undefined

  if (apiKey) {
    consumer = await getAdminConsumer(ctx, apiKey)
    assert(consumer, 401, `Invalid API key "${apiKey}"`)
    assert(
      consumer.isStripeSubscriptionActive,
      402,
      `API key "${apiKey}" does not have an active subscription`
    )
    assert(
      consumer.projectId === deployment.projectId,
      403,
      `API key "${apiKey}" is not authorized for project "${deployment.projectId}"`
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

  return {
    consumer,
    pricingPlan
  }
}
