import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { projectIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a project.',
  tags: ['projects'],
  operationId: 'updateProject',
  method: 'post',
  path: 'projects/{projectId}',
  security: openapiAuthenticatedSecuritySchemas,
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
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1ProjectsUpdateProject(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { projectId } = c.req.valid('param')
    const body = c.req.valid('json')

    // First ensure the project exists and the user has access to it
    let project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId)
    })
    assert(project, 404, `Project not found "${projectId}"`)
    await acl(c, project, { label: 'Project' })

    // Update the project
    ;[project] = await db
      .update(schema.projects)
      .set(body)
      .where(eq(schema.projects.id, projectId))
      .returning()
    assert(project, 500, `Failed to update project "${projectId}"`)

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
