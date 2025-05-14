import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  assert,
  openapiErrorResponse404,
  openapiErrorResponses,
  parseZodSchema
} from '@/lib/utils'

import { populateProjectSchema, projectIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Gets a project',
  tags: ['projects'],
  operationId: 'getProject',
  method: 'get',
  path: 'projects/{projectId}',
  security: [{ bearerAuth: [] }],
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

export function registerV1ProjectsGetProject(
  app: OpenAPIHono<AuthenticatedEnv>
) {
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
    assert(project, 404, `Project not found "${projectId}"`)
    await acl(c, project, { label: 'Project' })

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
