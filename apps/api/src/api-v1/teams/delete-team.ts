import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { teamIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Deletes a team by slug.',
  tags: ['teams'],
  operationId: 'deleteTeam',
  method: 'delete',
  path: 'teams/{teamId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: teamIdParamsSchema
  },
  responses: {
    200: {
      description: 'The team that was deleted',
      content: {
        'application/json': {
          schema: schema.teamSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1TeamsDeleteTeam(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { teamId } = c.req.valid('param')
    await aclTeamAdmin(c, { teamId })

    const [team] = await db
      .delete(schema.teams)
      .where(eq(schema.teams.id, teamId))
      .returning()
    assert(team, 404, `Team not found "${teamId}"`)

    return c.json(parseZodSchema(schema.teamSelectSchema, team))
  })
}
