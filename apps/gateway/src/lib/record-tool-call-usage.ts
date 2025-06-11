import type {
  AdminDeployment,
  PricingPlan,
  Tool
} from '@agentic/platform-types'

import type { RawEnv } from './env'
import type {
  AdminConsumer,
  McpToolCallResponse,
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
export function recordToolCallUsage({
  requestMode,
  deployment,
  consumer,
  tool,
  resolvedOriginToolCallResult,
  httpResponse,
  mcpToolCallResponse,
  ip,
  sessionId,
  requestId,
  env,
  waitUntil
}: {
  requestMode: RequestMode
  deployment: AdminDeployment
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
  tool?: Tool
  resolvedOriginToolCallResult?: ResolvedOriginToolCallResult
  httpResponse?: Response
  mcpToolCallResponse?: McpToolCallResponse
  ip?: string
  sessionId: string
  requestId?: string
  env: RawEnv
  waitUntil: WaitUntil
} & (
  | {
      // For http requests, an http response is required.
      requestMode: 'http'
      httpResponse: Response
      mcpToolCallResponse?: never
    }
  | {
      // For mcp cool call requests, an mcp tool call response is required.
      requestMode: 'mcp'
      httpResponse?: never
      mcpToolCallResponse: McpToolCallResponse
    }
)): void {
  const { projectId } = deployment
  const {
    rateLimitResult,
    cacheStatus,
    originTimespanMs,
    toolCallArgs,
    numRequestsCost,
    reportUsage
  } = resolvedOriginToolCallResult ?? {
    numRequestsCost: 0,
    reportUsage: false
  }
  mcpToolCallResponse ??= resolvedOriginToolCallResult?.toolCallResponse

  const requestSize = toolCallArgs ? JSON.stringify(toolCallArgs).length : 0
  const responseSize =
    Number.parseInt(httpResponse?.headers.get('content-length') ?? '0') ||
    (mcpToolCallResponse ? JSON.stringify(mcpToolCallResponse).length : 0)

  // The string dimensions used for grouping and filtering (sometimes called
  // labels in other metrics systems).
  // NOTE: The ordering of these fields is important and must remain consistent!
  // Max of 20 blobs with total size <= 5120 bytes.
  const blobs = [
    // Project ID of the request
    projectId,

    // Deployment ID of the request
    deployment.id,

    // Name of the tool that was called
    tool?.name ?? null,

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
    rateLimitResult
      ? rateLimitResult.passed
        ? 'rl-passed'
        : 'rl-exceeded'
      : mcpToolCallResponse?._meta?.status === 429
        ? 'rl-exceeded'
        : null,

    // Whether the request hit the cache
    cacheStatus ?? null,

    // HTTP response status
    httpResponse?.status?.toString() ||
      (mcpToolCallResponse
        ? mcpToolCallResponse._meta?.status?.toString() ||
          (mcpToolCallResponse?.isError ? 'error' : '200')
        : 'error')
  ]

  // Numberic values to record in this data point.
  // NOTE: The ordering of these fields is important and must remain consistent!
  const doubles = [
    // Origin timespan in milliseconds
    originTimespanMs ?? 0,

    // Request bandwidth in bytes
    requestSize,

    // Response bandwidth in bytes
    responseSize,

    // Total bandwidth in bytes
    // TODO: Correctly calculate total bandwidth using `content-length`
    requestSize + responseSize,

    // Number of requests cost
    numRequestsCost ?? 0
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
    const identifier = requestId
      ? `${requestId}:${consumer.id}:${tool?.name || 'unknown-tool'}`
      : undefined

    // Report usage to Stripe asynchronously.
    waitUntil(
      stripe.billing.meterEvents.create({
        event_name: eventName,
        identifier,
        payload: {
          value: numRequestsCost.toString(),
          stripe_customer_id: consumer._stripeCustomerId
        }
      })
    )
  }
}
