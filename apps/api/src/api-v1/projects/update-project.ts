import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { assert, parseZodSchema } from '@/lib/utils'

import { projectIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a project.',
  tags: ['projects'],
  operationId: 'updateProject',
  method: 'put',
  path: 'projects/{projectId}',
  security: [{ bearerAuth: [] }],
  request: {
    params: projectIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.projectUpdateSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'The updated project',
      content: {
        'application/json': {
          schema: schema.projectSelectSchema
        }
      }
    }
    // TODO
    // ...openApiErrorResponses
  }
})

export function registerV1ProjectsUpdateProject(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { projectId } = c.req.valid('param')
    const body = c.req.valid('json')

    const [project] = await db
      .update(schema.projects)
      .set(body)
      .where(eq(schema.projects.id, projectId))
      .returning()
    assert(project, 404, `Failed to update project "${projectId}"`)

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
