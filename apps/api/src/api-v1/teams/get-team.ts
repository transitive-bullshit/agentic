import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclTeamMember } from '@/lib/acl-team-member'
import { assert, parseZodSchema } from '@/lib/utils'

import { teamSlugParamsSchema } from './schemas'

const route = createRoute({
  description: 'Gets a team by slug.',
  tags: ['teams'],
  operationId: 'getTeam',
  method: 'get',
  path: 'teams/{team}',
  security: [{ bearerAuth: [] }],
  request: {
    params: teamSlugParamsSchema
  },
  responses: {
    200: {
      description: 'A team object',
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

export function registerV1TeamsGetTeam(app: OpenAPIHono<AuthenticatedEnv>) {
  return app.openapi(route, async (c) => {
    const { team: teamSlug } = c.req.valid('param')
    await aclTeamMember(c, { teamSlug })

    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.slug, teamSlug)
    })
    assert(team, 404, `Team not found "${teamSlug}"`)

    return c.json(parseZodSchema(schema.teamSelectSchema, team))
  })
}
