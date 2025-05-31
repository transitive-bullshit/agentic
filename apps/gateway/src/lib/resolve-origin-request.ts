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

  const { originAdapter } = deployment
  let originRequest: Request | undefined

  if (originAdapter.type === 'openapi' || originAdapter.type === 'raw') {
    // TODO: For OpenAPI, we need to convert from POST to the correct operation?
    // Or, do we only support a single public MCP interface?
    if (originAdapter.type === 'openapi') {
      const operation = originAdapter.toolToOperationMap[tool.name]
      assert(operation, 404, `Tool "${tool.name}" not found in OpenAPI spec`)

      const tempInitialRequest = ctx.req.clone()
      const tempInitialRequestBody: any = await tempInitialRequest.json()

      const params = Object.entries(operation.parameterSources)
      const bodyParams = params.filter(([_key, source]) => source === 'body')
      const formDataParams = params.filter(
        ([_key, source]) => source === 'formData'
      )
      const headerParams = params.filter(
        ([_key, source]) => source === 'header'
      )
      const pathParams = params.filter(([_key, source]) => source === 'path')
      const queryParams = params.filter(([_key, source]) => source === 'query')
      const cookieParams = params.filter(
        ([_key, source]) => source === 'cookie'
      )

      const headers: Record<string, string> = {}
      if (headerParams.length > 0) {
        for (const [key] of headerParams) {
          headers[key] = tempInitialRequest.headers.get(key) as string
        }
      }

      let body: string | undefined
      if (bodyParams.length > 0) {
        body = JSON.stringify(
          Object.fromEntries(
            bodyParams.map(([key]) => [key, tempInitialRequestBody[key] as any])
          )
        )

        headers['content-type'] ??= 'application/json'
      } else if (formDataParams.length > 0) {
        body = JSON.stringify(
          Object.fromEntries(
            formDataParams.map(([key]) => [
              key,
              tempInitialRequestBody[key] as any
            ])
          )
        )

        headers['content-type'] ??= 'application/x-www-form-urlencoded'
      }

      let path = operation.path
      if (pathParams.length > 0) {
        for (const [key] of pathParams) {
          const value: string = tempInitialRequestBody[key]
          assert(value, 400, `Missing required parameter "${key}"`)

          const pathParamPlaceholder = `{${key}}`
          assert(
            path.includes(pathParamPlaceholder),
            500,
            `Misconfigured OpenAPI deployment "${deployment.id}": invalid path "${operation.path}" missing required path parameter "${key}"`
          )

          path = path.replaceAll(pathParamPlaceholder, value)
        }
      }
      assert(
        !/\{\w+\}/.test(path),
        500,
        `Misconfigured OpenAPI deployment "${deployment.id}": invalid path "${operation.path}"`
      )

      const query = new URLSearchParams()
      for (const [key] of queryParams) {
        query.set(key, tempInitialRequestBody[key] as string)
      }

      for (const [key] of cookieParams) {
        headers[key] = tempInitialRequestBody[key] as string
      }

      const queryString = query.toString()
      const originRequestUrl = `${deployment.originUrl}${path}${
        queryString ? `?${queryString}` : ''
      }`
      originRequest = new Request(originRequestUrl, {
        method: operation.method,
        body,
        headers
      })
    } else {
      const originRequestUrl = `${deployment.originUrl}${toolPath}${search}`
      originRequest = new Request(originRequestUrl, req)
    }

    console.log('originRequestUrl', originRequest.url)
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
