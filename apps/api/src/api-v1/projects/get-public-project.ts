import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import { db, eq, schema } from '@/db'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { populateProjectSchema, projectIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Gets a public project by ID.',
  tags: ['projects'],
  operationId: 'getPublicProject',
  method: 'get',
  path: 'projects/public/{projectId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: projectIdParamsSchema,
    query: populateProjectSchema
  },
  responses: {
    200: {
      description: 'A project',
      content: {
        'application/json': {
          schema: schema.projectSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GetPublicProject(app: OpenAPIHono<DefaultHonoEnv>) {
  return app.openapi(route, async (c) => {
    const { projectId } = c.req.valid('param')
    const { populate = [] } = c.req.valid('query')

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
      with: {
        lastPublishedDeployment: true,
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(
      project && project.private && project.lastPublishedDeploymentId,
      404,
      `Public project not found "${projectId}"`
    )

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
