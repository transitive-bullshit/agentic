import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import { assert, parseZodSchema } from '@/lib/utils'

import { TeamSlugParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a team.',
  tags: ['teams'],
  operationId: 'updateTeam',
  method: 'put',
  path: 'teams/{team}',
  security: [{ bearerAuth: [] }],
  request: {
    params: TeamSlugParamsSchema,
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
    }
    // TODO
    // ...openApiErrorResponses
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
    assert(team, 404, `Failed to update team "${teamSlug}"`)

    return c.json(parseZodSchema(schema.teamSelectSchema, team))
  })
}
