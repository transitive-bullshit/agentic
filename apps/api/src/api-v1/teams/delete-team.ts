import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import { assert, parseZodSchema } from '@/lib/utils'

import { teamSlugParamsSchema } from './schemas'

const route = createRoute({
  description: 'Deletes a team by slug.',
  tags: ['teams'],
  operationId: 'deleteTeam',
  method: 'delete',
  path: 'teams/{team}',
  security: [{ bearerAuth: [] }],
  request: {
    params: teamSlugParamsSchema
  },
  responses: {
    200: {
      description: 'The team that was deleted',
      content: {
        'application/json': {
          schema: schema.teamSelectSchema
        }
      }
    }
    // TODO
    // ...openApiErrorResponses
  }
})

export function registerV1TeamsDeleteTeam(app: OpenAPIHono<AuthenticatedEnv>) {
  return app.openapi(route, async (c) => {
    const { team: teamSlug } = c.req.valid('param')
    await aclTeamAdmin(c, { teamSlug })

    const [team] = await db
      .delete(schema.teams)
      .where(eq(schema.teams.slug, teamSlug))
      .returning()
    assert(team, 404, `Team not found "${teamSlug}"`)

    return c.json(parseZodSchema(schema.teamSelectSchema, team))
  })
}
