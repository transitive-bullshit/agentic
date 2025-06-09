import type { AdminDeployment, PricingPlan } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseToolIdentifier } from '@agentic/platform-validators'

import type { AdminConsumer, GatewayHonoContext } from './types'
import { getAdminConsumer } from './get-admin-consumer'
import { getAdminDeployment } from './get-admin-deployment'

export type ResolvedMcpEdgeRequest = {
  deployment: AdminDeployment
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
  ip?: string
}

export async function resolveMcpEdgeRequest(
  ctx: GatewayHonoContext
): Promise<ResolvedMcpEdgeRequest> {
  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestedDeploymentIdentifier = pathname
    .replace(/^\//, '')
    .replace(/\/$/, '')
  const { deploymentIdentifier } = parseToolIdentifier(
    requestedDeploymentIdentifier
  )

  const deployment = await getAdminDeployment(ctx, deploymentIdentifier)

  const apiKey = ctx.req.query('apiKey')?.trim()
  let consumer: AdminConsumer | undefined
  let pricingPlan: PricingPlan | undefined

  if (apiKey) {
    consumer = await getAdminConsumer(ctx, apiKey)
    assert(consumer, 401, `Invalid api key "${apiKey}"`)
    assert(
      consumer.isStripeSubscriptionActive,
      402,
      `API key "${apiKey}" subscription is not active`
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
    //   `API key "${apiKey}" unable to find matching pricing plan for project "${deployment.project}"`
    // )
  } else {
    // For unauthenticated requests, default to a free pricing plan if available.
    pricingPlan = deployment.pricingPlans.find((plan) => plan.slug === 'free')
  }

  return {
    deployment,
    consumer,
    pricingPlan,
    ip: ctx.get('ip')
  }
}
