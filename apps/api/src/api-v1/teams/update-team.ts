import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { assert, parseZodSchema } from '@/lib/utils'

import { teamSlugParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a team.',
  tags: ['teams'],
  operationId: 'updateTeam',
  method: 'put',
  path: 'teams/{team}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: teamSlugParamsSchema,
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
    const { team: teamSlug } = c.req.valid('param')
    const body = c.req.valid('json')
    await aclTeamAdmin(c, { teamSlug })

    const [team] = await db
      .update(schema.teams)
      .set(body)
      .where(eq(schema.teams.slug, teamSlug))
      .returning()
    assert(team, 404, `Team not found "${teamSlug}"`)

    return c.json(parseZodSchema(schema.teamSelectSchema, team))
  })
}
