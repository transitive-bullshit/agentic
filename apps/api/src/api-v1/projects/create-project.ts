import { assert, parseZodSchema, sha256 } from '@agentic/platform-core'
import { parseProjectIdentifier } from '@agentic/platform-validators'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import { env } from '@/lib/env'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponses
} from '@/lib/openapi-utils'

const route = createRoute({
  description: 'Creates a new project.',
  tags: ['projects'],
  operationId: 'createProject',
  method: 'post',
  path: 'projects',
  security: openapiAuthenticatedSecuritySchemas,
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
    },
    ...openapiErrorResponses
  }
})

export function registerV1CreateProject(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const body = c.req.valid('json')
    const user = await ensureAuthUser(c)

    // if (body.teamId) {
    //   await aclTeamMember(c, { teamId: body.teamId })
    // }

    const teamMember = c.get('teamMember')
    const namespace = teamMember ? teamMember.teamSlug : user.username
    const identifier = `@${namespace}/${body.name}`
    const parsedProjectIdentifier = parseProjectIdentifier(identifier)
    assert(
      parsedProjectIdentifier,
      400,
      `Invalid project identifier "${identifier}"`
    )

    // Used for testing e2e fixtures in the development marketplace
    const isPrivate = !(
      (user.username === 'dev' && env.isDev) ||
      user.username === 'agentic'
    )

    const [project] = await db
      .insert(schema.projects)
      .values({
        ...body,
        identifier: parsedProjectIdentifier.projectIdentifier,
        namespace: parsedProjectIdentifier.projectNamespace,
        name: parsedProjectIdentifier.projectName,
        teamId: teamMember?.teamId,
        userId: user.id,
        private: isPrivate,
        _secret: await sha256()
      })
      .returning()
    assert(project, 500, `Failed to create project "${body.name}"`)

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
