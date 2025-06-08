import type { PricingPlan, RateLimit } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseToolIdentifier } from '@agentic/platform-validators'

import type { DurableMcpClient } from './durable-mcp-client'
import type {
  AdminConsumer,
  GatewayHonoContext,
  ResolvedOriginRequest,
  ToolCallArgs
} from './types'
import { createRequestForOpenAPIOperation } from './create-request-for-openapi-operation'
import { enforceRateLimit } from './enforce-rate-limit'
import { getAdminConsumer } from './get-admin-consumer'
import { getAdminDeployment } from './get-admin-deployment'
import { getTool } from './get-tool'
import { getToolArgsFromRequest } from './get-tool-args-from-request'
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
  const ip = ctx.get('ip')

  const { method } = ctx.req
  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestedToolIdentifier = pathname.replace(/^\//, '').replace(/\/$/, '')
  const parsedToolIdentifier = parseToolIdentifier(requestedToolIdentifier)
  assert(
    parsedToolIdentifier,
    404,
    `Invalid tool identifier "${requestedToolIdentifier}"`
  )
  const { toolName } = parsedToolIdentifier

  const deployment = await getAdminDeployment(
    ctx,
    parsedToolIdentifier.deploymentIdentifier
  )

  const tool = getTool({
    method,
    deployment,
    toolName
  })

  logger.debug('request', {
    method,
    pathname,
    deploymentIdentifier: deployment.identifier,
    toolName,
    tool
  })

  let pricingPlan: PricingPlan | undefined
  let consumer: AdminConsumer | undefined
  let reportUsage = ctx.get('reportUsage') ?? true

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

    if (!ctx.get('sessionId')) {
      ctx.set('sessionId', `${consumer.id}:${deployment.id}`)
    }
  } else {
    // For unauthenticated requests, default to a free pricing plan if available.
    pricingPlan = deployment.pricingPlans.find((plan) => plan.slug === 'free')

    if (!ctx.get('sessionId')) {
      assert(ip, 500, 'IP address is required for unauthenticated requests')
      ctx.set('sessionId', `${ip}:${deployment.projectId}`)
    }
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

  ctx.set('reportUsage', reportUsage)

  if (rateLimit) {
    await enforceRateLimit(ctx, {
      id: consumer?.id ?? ip,
      interval: rateLimit.interval,
      maxPerInterval: rateLimit.maxPerInterval
    })
  }

  const { originAdapter } = deployment
  let originRequest: Request | undefined
  let toolCallArgs: ToolCallArgs | undefined

  if (originAdapter.type === 'raw') {
    const originRequestUrl = `${deployment.originUrl}/${toolName}${requestUrl.search}`
    originRequest = new Request(originRequestUrl, ctx.req.raw)
  } else {
    // Parse tool call args from the request body for both OpenAPI and MCP
    // origin adapters.
    toolCallArgs = await getToolArgsFromRequest(ctx, {
      tool,
      deployment
    })
  }

  let mcpClient: DurableObjectStub<DurableMcpClient> | undefined
  if (originAdapter.type === 'openapi') {
    const operation = originAdapter.toolToOperationMap[tool.name]
    assert(operation, 404, `Tool "${tool.name}" not found in OpenAPI spec`)
    assert(toolCallArgs, 500)

    originRequest = await createRequestForOpenAPIOperation(ctx, {
      toolCallArgs,
      operation,
      deployment
    })
  } else if (originAdapter.type === 'mcp') {
    const sessionId = ctx.get('sessionId')
    assert(sessionId, 500, 'Session ID is required for MCP origin requests')

    const id: DurableObjectId = ctx.env.DO_MCP_CLIENT.idFromName(sessionId)
    mcpClient = ctx.env.DO_MCP_CLIENT.get(id)

    await mcpClient.init({
      url: deployment.originUrl,
      name: originAdapter.serverInfo.name,
      version: originAdapter.serverInfo.version
    })
  }

  if (originRequest) {
    logger.info('originRequestUrl', originRequest.url)
    updateOriginRequest(originRequest, { consumer, deployment })
  }

  assert(ctx.get('sessionId'), 500, 'Internal error: sessionId should be set')

  return {
    deployment,
    consumer,
    tool,
    pricingPlan,
    toolCallArgs,
    originRequest,
    mcpClient
  }
}
