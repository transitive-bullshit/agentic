import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { assert, parseZodSchema } from '@/lib/utils'

import { projectIdParamsSchema } from '../projects/schemas'
import { paginationAndPopulateConsumerSchema } from './schemas'

const route = createRoute({
  description: 'Lists all of the customers for a project.',
  tags: ['consumers'],
  operationId: 'listConsumers',
  method: 'get',
  path: 'projects/{projectId}/consumers',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: projectIdParamsSchema,
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

export function registerV1ProjectsListConsumers(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt',
      populate = []
    } = c.req.valid('query')

    const { projectId } = c.req.valid('param')
    assert(projectId, 400, 'Project ID is required')

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId)
    })
    assert(project, 404, `Project not found "${projectId}"`)
    await acl(c, project, { label: 'Project' })

    const consumers = await db.query.consumers.findMany({
      where: eq(schema.consumers.projectId, projectId),
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
