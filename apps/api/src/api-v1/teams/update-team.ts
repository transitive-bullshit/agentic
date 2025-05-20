import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { teamIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a team.',
  tags: ['teams'],
  operationId: 'updateTeam',
  method: 'post',
  path: 'teams/{teamId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: teamIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.teamUpdateSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'The updated team',
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

export function registerV1TeamsUpdateTeam(app: OpenAPIHono<AuthenticatedEnv>) {
  return app.openapi(route, async (c) => {
    const { teamId } = c.req.valid('param')
    const body = c.req.valid('json')
    await aclTeamAdmin(c, { teamId })

    const [team] = await db
      .update(schema.teams)
      .set(body)
      .where(eq(schema.teams.id, teamId))
      .returning()
    assert(team, 404, `Team not found "${teamId}"`)

    return c.json(parseZodSchema(schema.teamSelectSchema, team))
  })
}
