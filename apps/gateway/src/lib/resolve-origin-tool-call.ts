import type {
  AdminDeployment,
  AgenticMcpRequestMetadata,
  PricingPlan,
  Tool
} from '@agentic/platform-types'
import type { DurableObjectStub } from '@cloudflare/workers-types'
import { assert, RateLimitError } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'

import type { DurableMcpClientBase } from './durable-mcp-client'
import type { RawEnv } from './env'
import type {
  AdminConsumer,
  CacheStatus,
  McpToolCallResponse,
  RateLimitResult,
  ResolvedOriginToolCallResult,
  ToolCallArgs,
  WaitUntil
} from './types'
import { cfValidateJsonSchema } from './cf-validate-json-schema'
import { createHttpRequestForOpenAPIOperation } from './create-http-request-for-openapi-operation'
import { fetchCache } from './fetch-cache'
import { getRequestCacheKey } from './get-request-cache-key'
import { enforceRateLimit } from './rate-limits/enforce-rate-limit'
import { updateOriginRequest } from './update-origin-request'
import {
  isCacheControlPubliclyCacheable,
  isResponsePubliclyCacheable
} from './utils'

export async function resolveOriginToolCall({
  tool,
  args,
  deployment,
  consumer,
  pricingPlan,
  ip,
  sessionId,
  env,
  cacheControl,
  waitUntil
}: {
  tool: Tool
  args?: ToolCallArgs
  deployment: AdminDeployment
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
  ip?: string
  sessionId: string
  env: RawEnv
  cacheControl?: string
  waitUntil: WaitUntil
}): Promise<ResolvedOriginToolCallResult> {
  // TODO: consider moving all of this per-request logic to a diff method since
  // it's not specific to tool calls. eg, other MCP requests may still need to
  // be rate-limited / cached / tracked / etc.

  const { originAdapter } = deployment
  // TODO: make this configurable via `ToolConfig.cost`
  const numRequestsCost = 1
  let rateLimit = deployment.defaultRateLimit
  let rateLimitResult: RateLimitResult | undefined
  let cacheStatus: CacheStatus | undefined
  let reportUsage = true

  // Resolve rate limit and whether to report `requests` usage based on the
  // customer's pricing plan and deployment config.
  if (pricingPlan) {
    if (pricingPlan.rateLimit) {
      rateLimit = pricingPlan.rateLimit
    }

    const requestsLineItem = pricingPlan.lineItems.find(
      (lineItem) => lineItem.slug === 'requests'
    )

    if (!requestsLineItem) {
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
      rateLimit = toolConfig.rateLimit
    }

    if (cacheControl) {
      if (!isCacheControlPubliclyCacheable(cacheControl)) {
        // Incoming request explicitly requests to bypass the gateway's cache.
        cacheStatus = 'BYPASS'
      } else {
        // TODO: Should we allow incoming cache-control headers to override the
        // gateway's cache behavior?
      }
    } else {
      // If the incoming request doesn't specify a desired `cache-control`,
      // then use a default based on the tool's configured settings.
      if (toolConfig.cacheControl !== undefined) {
        cacheControl = toolConfig.cacheControl
      } else if (toolConfig.pure) {
        // If the tool is marked as `pure`, then we can cache responses in our
        // public, shared cache indefinitely.
        cacheControl =
          'public, max-age=31560000, s-maxage=31560000, stale-while-revalidate=3600'
      } else {
        // Default to not caching any responses.
        cacheControl = 'no-store'
        cacheStatus = 'DYNAMIC'
      }
    }

    const pricingPlanToolOverride = pricingPlan
      ? toolConfig.pricingPlanOverridesMap?.[pricingPlan.slug]
      : undefined
    const isToolEnabled = toolConfig.enabled ?? true

    // Check if this tool is configured for pricing-plan-specific overrides
    // which take precedence over the tool's default behavior.
    if (pricingPlan && pricingPlanToolOverride) {
      if (pricingPlanToolOverride.enabled !== undefined) {
        assert(
          pricingPlanToolOverride.enabled,
          isToolEnabled ? 403 : 404,
          `Tool "${tool.name}" is disabled for pricing plan "${pricingPlan.slug}"`
        )
      } else {
        assert(isToolEnabled, 404, `Tool "${tool.name}" is disabled`)
      }

      if (pricingPlanToolOverride.reportUsage !== undefined) {
        reportUsage &&= !!pricingPlanToolOverride.reportUsage
      }

      if (pricingPlanToolOverride.rateLimit !== undefined) {
        rateLimit = pricingPlanToolOverride.rateLimit
      }
    } else {
      assert(isToolEnabled, 404, `Tool "${tool.name}" is disabled`)
    }
  } else {
    if (cacheControl) {
      if (!isCacheControlPubliclyCacheable(cacheControl)) {
        // Incoming request explicitly requests to bypass the gateway's cache.
        cacheStatus = 'BYPASS'
      } else {
        // TODO: Should we allow incoming cache-control headers to override the
        // gateway's cache behavior?
      }
    } else {
      // Default to not caching any responses.
      cacheControl = 'no-store'
      cacheStatus = 'DYNAMIC'
    }
  }

  if (rateLimit) {
    // TODO: Consider decrementing rate limit if the response is cached or
    // errors? this doesn't seem too important, so will leave as-is for now.
    rateLimitResult = await enforceRateLimit({
      rateLimit,
      id: consumer?.id ?? ip ?? sessionId,
      cost: numRequestsCost,
      env,
      waitUntil
    })

    if (rateLimitResult && !rateLimitResult.passed) {
      throw new RateLimitError({ rateLimitResult })
    }
  }

  if (originAdapter.type === 'raw') {
    // TODO
    assert(false, 500, 'Raw origin adapter not implemented')
  } else {
    // Validate incoming request params against the tool's input schema.
    const toolCallArgs = cfValidateJsonSchema<Record<string, any>>({
      schema: tool.inputSchema,
      data: args,
      errorPrefix: `Invalid request parameters for tool "${tool.name}"`,
      strictAdditionalProperties:
        toolConfig?.inputSchemaAdditionalProperties === false
    })

    const originStartTimeMs = Date.now()

    if (originAdapter.type === 'openapi') {
      const operation = originAdapter.toolToOperationMap[tool.name]
      assert(operation, 404, `Tool "${tool.name}" not found in OpenAPI spec`)
      assert(toolCallArgs, 500)

      const originRequest = await createHttpRequestForOpenAPIOperation({
        toolCallArgs,
        operation,
        deployment
      })

      updateOriginRequest(originRequest, { consumer, deployment, cacheControl })

      const cacheKey = await getRequestCacheKey(originRequest)

      // TODO: transform origin 5XX errors to 502 errors...
      const originResponse = await fetchCache({
        cacheKey,
        fetchResponse: async () => {
          let response = await fetch(originRequest)

          if (cacheControl && isResponsePubliclyCacheable(response)) {
            response = new Response(response.body, response)
            response.headers.set('cache-control', cacheControl)
          }

          return response
        },
        waitUntil
      })

      // Fetch the origin response without caching (useful for debugging)
      // const originResponse = await fetch(originRequest)

      cacheStatus =
        (originResponse.headers.get('cf-cache-status') as CacheStatus) ??
        cacheStatus ??
        (cacheKey ? 'MISS' : 'BYPASS')

      return {
        cacheStatus,
        reportUsage,
        rateLimit,
        rateLimitResult,
        toolCallArgs,
        originRequest,
        originResponse,
        originTimespanMs: Date.now() - originStartTimeMs,
        numRequestsCost,
        toolConfig
      }
    } else if (originAdapter.type === 'mcp') {
      const { projectIdentifier } = parseDeploymentIdentifier(
        deployment.identifier,
        { errorStatusCode: 500 }
      )

      const id = env.DO_MCP_CLIENT.idFromName(sessionId)
      const originMcpClient = env.DO_MCP_CLIENT.get(
        id
      ) as DurableObjectStub<DurableMcpClientBase>

      await originMcpClient.init({
        url: deployment.originUrl,
        name: originAdapter.serverInfo.name,
        version: originAdapter.serverInfo.version
      })

      const originMcpRequestMetadata = {
        agenticProxySecret: deployment._secret,
        sessionId,
        ip,
        isCustomerSubscriptionActive: !!consumer?.isStripeSubscriptionActive,
        customerId: consumer?.id,
        customerSubscriptionPlan: consumer?.plan,
        customerSubscriptionStatus: consumer?.stripeStatus,
        userId: consumer?.user.id,
        userEmail: consumer?.user.email,
        userUsername: consumer?.user.username,
        userName: consumer?.user.name,
        userCreatedAt: consumer?.user.createdAt,
        userUpdatedAt: consumer?.user.updatedAt,
        deploymentId: deployment.id,
        deploymentIdentifier: deployment.identifier,
        projectId: deployment.projectId,
        projectIdentifier
      } as AgenticMcpRequestMetadata

      let cacheKey: Request | undefined

      if (cacheControl && isCacheControlPubliclyCacheable(cacheControl)) {
        const fakeOriginRequest = new Request(deployment.originUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'cache-control': cacheControl
          },
          body: JSON.stringify({
            name: tool.name,
            args: toolCallArgs,
            metadata: originMcpRequestMetadata
          })
        })

        cacheKey = await getRequestCacheKey(fakeOriginRequest)
        if (cacheKey) {
          const response = await caches.default.match(cacheKey)
          if (response) {
            return {
              cacheStatus: 'HIT',
              reportUsage,
              rateLimit,
              rateLimitResult,
              toolCallArgs,
              toolCallResponse: (await response.json()) as McpToolCallResponse,
              originTimespanMs: Date.now() - originStartTimeMs,
              numRequestsCost,
              toolConfig
            }
          }
        }
      }

      // TODO: add timeout support to the origin tool call?
      const toolCallResponseString = await originMcpClient.callTool({
        name: tool.name,
        args: toolCallArgs,
        metadata: originMcpRequestMetadata
      })
      const toolCallResponse = JSON.parse(
        toolCallResponseString
      ) as McpToolCallResponse

      if (cacheControl && cacheKey) {
        const fakeHttpResponse = new Response(toolCallResponseString, {
          headers: {
            'content-type': 'application/json',
            'cache-control': cacheControl
          }
        })
        waitUntil(caches.default.put(cacheKey, fakeHttpResponse))
      }

      return {
        cacheStatus: cacheStatus ?? (cacheKey ? 'MISS' : 'BYPASS'),
        reportUsage,
        rateLimit,
        rateLimitResult,
        toolCallArgs,
        toolCallResponse,
        originTimespanMs: Date.now() - originStartTimeMs,
        numRequestsCost,
        toolConfig
      }
    } else {
      assert(
        false,
        500,
        `Internal error: origin adapter type "${(originAdapter as any).type}"`
      )
    }
  }
}
