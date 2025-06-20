import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { upsertStripeCustomer } from '@/lib/billing/upsert-stripe-customer'
import { env } from '@/lib/env'
import { stripe } from '@/lib/external/stripe'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'

const route = createRoute({
  description:
    'Creates a Stripe billing portal session for the authenticated user.',
  tags: ['consumers'],
  operationId: 'createBillingPortalSession',
  method: 'post',
  path: 'consumers/billing-portal',
  security: openapiAuthenticatedSecuritySchemas,
  responses: {
    200: {
      description: 'A billing portal session URL',
      content: {
        'application/json': {
          schema: z.object({
            url: z.string().url()
          })
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404,
    ...openapiErrorResponse409,
    ...openapiErrorResponse410
  }
})

export function registerV1CreateBillingPortalSession(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { stripeCustomer } = await upsertStripeCustomer(c)

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.id,
      return_url: `${env.AGENTIC_WEB_BASE_URL}/app/consumers`
    })

    return c.json({ url: portalSession.url })
  })
}
