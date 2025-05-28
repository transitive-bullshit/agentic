import type { Consumer } from '@agentic/platform-api-client'
import type { PricingPlan } from '@agentic/platform-schemas'

import type { Context } from './types'
import * as config from './config'
import { ctxAssert } from './ctx-assert'
import { getConsumer } from './get-consumer'
import { getDeployment } from './get-deployment'
import { getService } from './get-service'
import { rateLimit } from './rate-limit'
import { updateOriginRequest } from './update-origin-request'

const isProd = config.get('isProd')

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

  const service = getService({
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
    consumer = await getConsumer(event, token)
    ctxAssert(consumer, 401, `Invalid auth token "${token}"`)
    ctxAssert(
      consumer.enabled || deployment.proxyMode !== 'active',
      402,
      `Auth token "${token}" does not have an active subscription`
    )
    ctxAssert(
      consumer.project === deployment.project,
      403,
      `Auth token "${token}" is not authorized for project "${deployment.project}"`
    )

    // TODO: ensure that consumer.plan is compatible with the target deployment
    // TODO: this could definitely cause issues when changing pricing plans...

    pricingPlan = deployment.pricingPlans.find(
      (plan) => consumer.plan === plan.slug
    )

    // ctxAssert(
    //   pricingPlan,
    //   403,
    //   `Auth token "${token}" unable to find matching pricing plan for project "${deployment.project}"`
    // )
  } else {
    pricingPlan = deployment.pricingPlans.find((plan) => plan.slug === 'free')

    // ctxAssert(
    //   pricingPlan,
    //   403,
    //   `Auth error, unable to find matching pricing plan for project "${deployment.project}"`
    // )

    // ctxAssert(
    //   !pricingPlan.auth,
    //   403,
    //   `Auth error, encountered invalid pricing plan "${pricingPlan.slug}" for project "${deployment.project}"`
    // )
  }

  if (pricingPlan) {
    let serviceRateLimit = pricingPlan.rateLimit

    if (service.rateLimit !== undefined) {
      serviceRateLimit = service.rateLimit
    }

    if (service.reportUsage !== undefined) {
      reportUsage = !!service.reportUsage
    }

    if (service.pricingPlanConfig) {
      const servicePricingPlanConfig =
        service.pricingPlanConfig[pricingPlan.slug]

      if (servicePricingPlanConfig) {
        ctxAssert(
          servicePricingPlanConfig.enabled !== false,
          403,
          `Auth error, service "${service.name}" is disabled for pricing plan "${pricingPlan.slug}"`
        )

        if (servicePricingPlanConfig.rateLimit !== undefined) {
          serviceRateLimit = servicePricingPlanConfig.rateLimit
        }

        if (servicePricingPlanConfig.reportUsage !== undefined) {
          reportUsage = !!servicePricingPlanConfig.reportUsage
        }
      }
    }

    // enforce rate limits
    if (serviceRateLimit && serviceRateLimit.enabled) {
      await rateLimit(event, {
        id: consumer ? consumer.id : ip,
        duration: serviceRateLimit.requestsInterval * 1000,
        max: serviceRateLimit.requestsMaxPerInterval,
        method,
        pathname
      })
    }
  }

  // TODO: decide whether or not this is something we actually want to support
  // for long-term DX
  const targetUrlOverride = isProd ? null : req.headers.get('x-saasify-target')
  const baseUrl = (targetUrlOverride || deployment._url).replaceAll(/\/$/g, '')
  const originUrl = `${baseUrl}${toolPath}${search}`
  console.log('originUrl', originUrl)

  const originReq = new Request(originUrl, req)
  updateOriginRequest(originReq, { consumer, deployment, ip })

  return {
    originReq,
    deployment: deployment.id,
    project: deployment.project,
    service,
    consumer,
    date,
    ip,
    method,
    plan: pricingPlan ? pricingPlan.slug : null,
    reportUsage
  }
}
