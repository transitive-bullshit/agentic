import type {
  AdminDeployment,
  PricingPlan,
  Tool
} from '@agentic/platform-types'

import type { RawEnv } from './env'
import type {
  AdminConsumer,
  RequestMode,
  ResolvedOriginToolCallResult,
  WaitUntil
} from './types'
import { createAgenticClient } from './agentic-client'
import { createStripe } from './external/stripe'

/**
 * Records usage data to Cloudflare Analytics Engine.
 *
 * Also asynchronously activates the `consumer` if it's present and hasn't been
 * activated yet.
 *
 * Also asynchronously reports usage to Stripe if `consumer` is present and
 * `resolvedOriginToolCallResult.reportUsage` is `true`.
 *
 * @note This function should be **synchronous**. Any asynchronous operations
 * should use the `waitUntil` callback to not block the response from returning
 * to the end user promptly.
 *
 * @see https://developers.cloudflare.com/analytics/analytics-engine/limits/
 */
export function reportToolCallUsage({
  requestMode,
  tool,
  deployment,
  consumer,
  resolvedOriginToolCallResult,
  ip,
  sessionId,
  originTimespanMs,
  gatewayTimespanMs,
  requestId,
  env,
  waitUntil
}: {
  requestMode: RequestMode
  tool: Tool
  deployment: AdminDeployment
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
  resolvedOriginToolCallResult: ResolvedOriginToolCallResult
  ip?: string
  sessionId: string
  requestId: string
  originTimespanMs: number
  gatewayTimespanMs: number
  env: RawEnv
  waitUntil: WaitUntil
}): void {
  const {
    rateLimitResult,
    cacheStatus,
    originResponse,
    toolCallResponse,
    toolCallArgs,
    reportUsage
  } = resolvedOriginToolCallResult
  const { projectId } = deployment

  const requestSize = JSON.stringify(toolCallArgs).length
  const responseSize =
    Number.parseInt(originResponse?.headers.get('content-length') ?? '0') ||
    JSON.stringify(toolCallResponse).length

  // The string dimensions used for grouping and filtering (sometimes called
  // labels in other metrics systems).
  // NOTE: It is important that the ordering of these fields remains consistent!
  // Max of 20 blobs with total size <= 5120 bytes.
  const blobs = [
    // Project ID of the request
    projectId,

    // Deployment ID of the request
    deployment.id,

    // Name of the tool that was called
    tool.name,

    // Whether this request was made via MCP or HTTP
    requestMode,

    // IP address or session ID
    ip ?? sessionId,

    // Request customer ID
    consumer?.id ?? null,

    // Request customer subscription plan
    consumer?.plan ?? null,

    // Request customer subscription status
    consumer?.stripeStatus ?? null,

    // Whether the request was rate-limited
    rateLimitResult?.passed ? 'rl-passed' : 'rl-exceeded',

    // Whether the request hit the cache
    cacheStatus,

    // Response status
    originResponse?.status?.toString() ||
      (toolCallResponse ? (toolCallResponse.isError ? 'error' : '200') : null)
  ]

  // Numberic values to record in this data point.
  // NOTE: It is important that the ordering of these fields remains consistent!
  const doubles = [
    // Origin timespan in milliseconds
    originTimespanMs,

    // Gateway timespan in milliseconds
    gatewayTimespanMs,

    // Request bandwidth in bytes
    requestSize,

    // Response bandwidth in bytes
    responseSize,

    // Total bandwidth in bytes
    // TODO: Correctly calculate total bandwidth using `content-length`
    requestSize + responseSize
  ]

  // Cloudflare Analytics Engine only supports writing a single index at a time,
  // so we associate this usage with the project.
  // TODO: Should we also index based on customer ID / IP? Or is being able to
  // filter by these fields in the project's `blobs` enough?
  env.AE_USAGE_DATASET.writeDataPoint({
    indexes: [projectId],
    blobs,
    doubles
  })

  if (consumer && !consumer.activated) {
    const client = createAgenticClient({
      env,
      cache: caches.default,
      waitUntil,
      isCachingEnabled: false
    })

    // If there's a consumer and it hasn't been activated yet, make sure it's
    // activated. This may be called multiple times if the consumer is cached,
    // but this method is intentionally idempotent, and we don't cache non-
    // activated consumers for long, so shouldn't be a problem.
    waitUntil(client.adminActivateConsumer({ consumerId: consumer.id }))
  }

  if (consumer && reportUsage) {
    const stripe = createStripe(env)

    const pricingPlanLineItemSlug = 'requests'
    const eventName = `meter-${projectId}-${pricingPlanLineItemSlug}`
    const identifier = `${requestId}:${consumer.id}:${tool.name}`

    // Report usage to Stripe asynchronously.
    waitUntil(
      stripe.billing.meterEvents.create({
        event_name: eventName,
        identifier,
        payload: {
          value: '1',
          stripe_customer_id: consumer._stripeCustomerId
        }
      })
    )
  }
}
