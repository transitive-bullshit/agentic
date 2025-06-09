import type {
  AdminDeployment,
  PricingPlan,
  RateLimit,
  Tool
} from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'

import type { RawEnv } from './env'
import type {
  AdminConsumer,
  AgenticMcpRequestMetadata,
  McpToolCallResponse,
  ToolCallArgs
} from './types'
import { cfValidateJsonSchema } from './cf-validate-json-schema'
import { createRequestForOpenAPIOperation } from './create-request-for-openapi-operation'
import { enforceRateLimit } from './enforce-rate-limit'
import { fetchCache } from './fetch-cache'
import { getRequestCacheKey } from './get-request-cache-key'
import { updateOriginRequest } from './update-origin-request'

// type State = { counter: number }

export type ResolvedOriginToolCallResult = {
  toolCallArgs: ToolCallArgs
  originRequest?: Request
  originResponse?: Response
  toolCallResponse?: McpToolCallResponse
} & (
  | {
      originRequest: Request
      originResponse: Response
      toolCallResponse?: never
    }
  | {
      originRequest?: never
      originResponse?: never
      toolCallResponse: McpToolCallResponse
    }
)

export async function resolveOriginToolCall({
  tool,
  args,
  deployment,
  consumer,
  pricingPlan,
  sessionId,
  env,
  ip,
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
  waitUntil: (promise: Promise<any>) => void
}): Promise<ResolvedOriginToolCallResult> {
  // TODO: rate-limiting
  // TODO: caching
  // TODO: usage tracking / reporting
  // TODO: all of this per-request logic should maybe be moved to a diff method
  // since it's not specific to tool calls. eg, other MCP requests may still
  // need to be rate-limited / cached / tracked / etc.

  const { originAdapter } = deployment
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
    await enforceRateLimit({
      id: consumer?.id ?? ip,
      interval: rateLimit.interval,
      maxPerInterval: rateLimit.maxPerInterval
    })
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

      const originRequest = await createRequestForOpenAPIOperation({
        toolCallArgs,
        operation,
        deployment
      })

      updateOriginRequest(originRequest, { consumer, deployment })

      const cacheKey = await getRequestCacheKey(originRequest)

      // TODO: transform origin 5XX errors to 502 errors...
      const originResponse = await fetchCache({
        cacheKey,
        fetchResponse: () => fetch(originRequest),
        waitUntil
      })

      // non-cached version
      // const originResponse = await fetch(originRequest)

      return {
        toolCallArgs,
        originRequest,
        originResponse
      }
    } else if (originAdapter.type === 'mcp') {
      const id: DurableObjectId = env.DO_MCP_CLIENT.idFromName(sessionId)
      const originMcpClient = env.DO_MCP_CLIENT.get(id)

      await originMcpClient.init({
        url: deployment.originUrl,
        name: originAdapter.serverInfo.name,
        version: originAdapter.serverInfo.version
      })

      const { projectIdentifier } = parseDeploymentIdentifier(
        deployment.identifier,
        { errorStatusCode: 500 }
      )

      const originMcpRequestMetadata = {
        agenticProxySecret: deployment._secret,
        sessionId,
        // ip,
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

      // TODO: add timeout support to the origin tool call?
      // TODO: add response caching for origin MCP tool calls
      const toolCallResponseString = await originMcpClient.callTool({
        name: tool.name,
        args: toolCallArgs,
        metadata: originMcpRequestMetadata!
      })
      const toolCallResponse = JSON.parse(
        toolCallResponseString
      ) as McpToolCallResponse

      return {
        toolCallArgs,
        toolCallResponse
      }
    } else {
      assert(false, 500)
    }
  }
}
