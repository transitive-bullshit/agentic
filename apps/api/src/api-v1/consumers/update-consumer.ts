import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { schema } from '@/db'
import { upsertConsumer } from '@/lib/consumers/upsert-consumer'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { consumerIdParamsSchema } from './schemas'

const route = createRoute({
  description:
    "Updates a consumer's subscription to a different deployment or pricing plan. Set `plan` to undefined to cancel the subscription.",
  tags: ['consumers'],
  operationId: 'updateConsumer',
  method: 'post',
  path: 'consumers/{consumerId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: consumerIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.consumerUpdateSchema
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

export function registerV1ConsumersUpdateConsumer(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { consumerId } = c.req.valid('param')
    const body = c.req.valid('json')

    const consumer = await upsertConsumer(c, {
      ...body,
      consumerId
    })

    return c.json(parseZodSchema(schema.consumerSelectSchema, consumer))
  })
}
