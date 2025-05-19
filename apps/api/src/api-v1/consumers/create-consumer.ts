import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { schema } from '@/db'
import { upsertConsumer } from '@/lib/billing/upsert-consumer'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'

const route = createRoute({
  description: 'Creates a new consumer by subscribing a customer to a project.',
  tags: ['consumers'],
  operationId: 'createConsumer',
  method: 'post',
  path: 'consumers',
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
          schema: schema.consumerSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404,
    ...openapiErrorResponse409,
    ...openapiErrorResponse410
  }
})

export function registerV1ConsumersCreateConsumer(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const body = c.req.valid('json')
    const consumer = await upsertConsumer(c, body)

    return c.json(parseZodSchema(schema.consumerSelectSchema, consumer))
  })
}
