import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, schema } from '@/db'
import { aclTeamMember } from '@/lib/acl-team-member'
import { assert, parseZodSchema } from '@/lib/utils'

const route = createRoute({
  description: 'Creates a new project.',
  tags: ['projects'],
  operationId: 'createProject',
  method: 'post',
  path: 'projects',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.projectInsertSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'The created project',
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

export function registerV1ProjectsCreateProject(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const body = c.req.valid('json')
    const user = c.get('user')

    if (body.teamId) {
      await aclTeamMember(c, { teamId: body.teamId })
    }

    const teamMember = c.get('teamMember')
    const namespace = teamMember ? teamMember.teamSlug : user.username
    const id = `${namespace}/${body.name}`

    const [project] = await db
      .insert(schema.projects)
      .values({
        ...body,
        teamId: teamMember?.teamId,
        userId: user.id,
        id
      })
      .returning()
    assert(project, 404, `Failed to create project "${body.name}"`)

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
