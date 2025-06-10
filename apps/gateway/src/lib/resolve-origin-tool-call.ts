import type {
  AdminDeployment,
  PricingPlan,
  RateLimit,
  Tool
} from '@agentic/platform-types'
import { assert, RateLimitError } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'

import type { RawEnv } from './env'
import type {
  AdminConsumer,
  AgenticMcpRequestMetadata,
  McpToolCallResponse,
  RateLimitResult,
  ResolvedOriginToolCallResult,
  ToolCallArgs
} from './types'
import { cfValidateJsonSchema } from './cf-validate-json-schema'
import { createHttpRequestForOpenAPIOperation } from './create-http-request-for-openapi-operation'
import { fetchCache } from './fetch-cache'
import { getRequestCacheKey } from './get-request-cache-key'
import { isCacheControlPubliclyCacheable } from './is-cache-control-publicly-cacheable'
import { enforceRateLimit } from './rate-limits/enforce-rate-limit'
import { updateOriginRequest } from './update-origin-request'

export async function resolveOriginToolCall({
  tool,
  args,
  deployment,
  consumer,
  pricingPlan,
  sessionId,
  env,
  ip,
  cacheControl,
  waitUntil
}: {
  tool: Tool
  args?: ToolCallArgs
  deployment: AdminDeployment
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
  sessionId: string
  env: RawEnv
  ip?: string
  cacheControl?: string
  waitUntil: (promise: Promise<any>) => void
}): Promise<ResolvedOriginToolCallResult> {
  // TODO: rate-limiting
  // TODO: caching
  // TODO: usage tracking / reporting
  // TODO: all of this per-request logic should maybe be moved to a diff method
  // since it's not specific to tool calls. eg, other MCP requests may still
  // need to be rate-limited / cached / tracked / etc.

  const { originAdapter } = deployment
  let rateLimitResult: RateLimitResult | undefined
  let rateLimit: RateLimit | undefined | null
  let reportUsage = true

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

    if (!cacheControl) {
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
      }
    }

    const pricingPlanToolConfig = pricingPlan
      ? toolConfig.pricingPlanConfig?.[pricingPlan.slug]
      : undefined

    if (pricingPlan && pricingPlanToolConfig) {
      assert(
        pricingPlanToolConfig.enabled ||
          (pricingPlanToolConfig.enabled === undefined && toolConfig.enabled),
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
    rateLimitResult = await enforceRateLimit({
      id: consumer?.id ?? ip ?? sessionId,
      interval: rateLimit.interval,
      maxPerInterval: rateLimit.maxPerInterval,
      async: rateLimit.async,
      env,
      waitUntil
    })

    if (!rateLimitResult.passed) {
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
      strictAdditionalProperties: true
    })

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
        fetchResponse: () => fetch(originRequest),
        waitUntil
      })

      return {
        rateLimitResult,
        toolCallArgs,
        originRequest,
        originResponse
      }
    } else if (originAdapter.type === 'mcp') {
      const { projectIdentifier } = parseDeploymentIdentifier(
        deployment.identifier,
        { errorStatusCode: 500 }
      )

      const id = env.DO_MCP_CLIENT.idFromName(sessionId)
      const originMcpClient = env.DO_MCP_CLIENT.get(id)

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
            metadata: originMcpRequestMetadata!
          })
        })

        cacheKey = await getRequestCacheKey(fakeOriginRequest)
        if (cacheKey) {
          const response = await caches.default.match(cacheKey)
          if (response) {
            return {
              rateLimitResult,
              toolCallArgs,
              toolCallResponse: (await response.json()) as McpToolCallResponse
            }
          }
        }
      }

      // TODO: add timeout support to the origin tool call?
      const toolCallResponseString = await originMcpClient.callTool({
        name: tool.name,
        args: toolCallArgs,
        metadata: originMcpRequestMetadata!
      })
      const toolCallResponse = JSON.parse(
        toolCallResponseString
      ) as McpToolCallResponse

      if (cacheKey && cacheControl) {
        const fakeHttpResponse = new Response(toolCallResponseString, {
          headers: {
            'content-type': 'application/json',
            'cache-control': cacheControl
          }
        })
        waitUntil(caches.default.put(cacheKey, fakeHttpResponse))
      }

      return {
        rateLimitResult,
        toolCallArgs,
        toolCallResponse
      }
    } else {
      assert(false, 500)
    }
  }
}
