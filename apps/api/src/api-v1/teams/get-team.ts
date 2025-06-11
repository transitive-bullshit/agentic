import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclTeamMember } from '@/lib/acl-team-member'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { teamIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Gets a team by ID.',
  tags: ['teams'],
  operationId: 'getTeam',
  method: 'get',
  path: 'teams/{teamId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: teamIdParamsSchema
  },
  responses: {
    200: {
      description: 'A team object',
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

export function registerV1TeamsGetTeam(app: OpenAPIHono<AuthenticatedHonoEnv>) {
  return app.openapi(route, async (c) => {
    const { teamId } = c.req.valid('param')
    await aclTeamMember(c, { teamId })

    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.id, teamId)
    })
    assert(team, 404, `Team not found "${teamId}"`)

    return c.json(parseZodSchema(schema.teamSelectSchema, team))
  })
}
