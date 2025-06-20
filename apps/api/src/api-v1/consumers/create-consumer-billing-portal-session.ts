import { assert } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { env } from '@/lib/env'
import { stripe } from '@/lib/external/stripe'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { consumerIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Creates a Stripe billing portal session for a customer.',
  tags: ['consumers'],
  operationId: 'createConsumerBillingPortalSession',
  method: 'post',
  path: 'consumers/{consumerId}/billing-portal',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: consumerIdParamsSchema
  },
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

export function registerV1CreateConsumerBillingPortalSession(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { consumerId } = c.req.valid('param')
    const consumer = await db.query.consumers.findFirst({
      where: eq(schema.consumers.id, consumerId)
    })
    assert(consumer, 404, `Consumer not found "${consumerId}"`)
    await acl(c, consumer, { label: 'Consumer' })

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: consumer._stripeCustomerId,
      return_url: `${env.AGENTIC_WEB_BASE_URL}/app/consumers/${consumerId}`
    })

    return c.json({ url: portalSession.url })
  })
}
