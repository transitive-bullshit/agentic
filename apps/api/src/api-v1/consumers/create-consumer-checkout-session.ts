import { pick } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { schema } from '@/db'
import { parseConsumerSelectSchema } from '@/db/schema'
import { upsertConsumerStripeCheckout } from '@/lib/consumers/upsert-consumer-stripe-checkout'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'

const route = createRoute({
  description:
    'Creates a Stripe checkout session for a consumer to modify their subscription to a project.',
  tags: ['consumers'],
  operationId: 'createConsumerCheckoutSession',
  method: 'post',
  path: 'consumers/checkout',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.consumerInsertSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'A consumer object',
      content: {
        'application/json': {
          schema: z.object({
            checkoutSession: z.object({
              id: z.string(),
              url: z.string().url()
            }),
            consumer: schema.consumerSelectSchema
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

export function registerV1CreateConsumerCheckoutSession(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const body = c.req.valid('json')
    const { checkoutSession, consumer } = await upsertConsumerStripeCheckout(
      c,
      body
    )

    return c.json({
      checkoutSession: pick(checkoutSession, 'id', 'url'),
      consumer: parseConsumerSelectSchema(consumer)
    })
  })
}
