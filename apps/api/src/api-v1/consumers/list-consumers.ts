import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { paginationAndPopulateConsumerSchema } from './schemas'

const route = createRoute({
  description: 'Lists all of the customer subscriptions for the current user.',
  tags: ['consumers'],
  operationId: 'listConsumers',
  method: 'get',
  path: 'consumers',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: paginationAndPopulateConsumerSchema
  },
  responses: {
    200: {
      description: 'A list of consumers',
      content: {
        'application/json': {
          schema: z.array(schema.consumerSelectSchema)
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1ListConsumers(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt',
      populate = []
    } = c.req.valid('query')

    const user = await ensureAuthUser(c)

    const consumers = await db.query.consumers.findMany({
      where: eq(schema.consumers.userId, user.id),
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      },
      orderBy: (consumers, { asc, desc }) => [
        sort === 'desc' ? desc(consumers[sortBy]) : asc(consumers[sortBy])
      ],
      offset,
      limit
    })

    return c.json(
      parseZodSchema(z.array(schema.consumerSelectSchema), consumers)
    )
  })
}
