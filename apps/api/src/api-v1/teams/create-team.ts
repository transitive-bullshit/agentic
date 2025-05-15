import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import { ensureUniqueTeamSlug } from '@/lib/ensure-unique-team-slug'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { assert, parseZodSchema } from '@/lib/utils'

const route = createRoute({
  description: 'Creates a team.',
  tags: ['teams'],
  operationId: 'createTeam',
  method: 'post',
  path: 'teams',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.teamInsertSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'The created team',
      content: {
        'application/json': {
          schema: schema.teamSelectSchema
        }
      }
    },
    ...openapiErrorResponses
  }
})

export function registerV1TeamsCreateTeam(app: OpenAPIHono<AuthenticatedEnv>) {
  return app.openapi(route, async (c) => {
    const user = await ensureAuthUser(c)
    const body = c.req.valid('json')

    await ensureUniqueTeamSlug(body.slug)

    return db.transaction(async (tx) => {
      const [team] = await tx
        .insert(schema.teams)
        .values({
          ...body,
          ownerId: user.id
        })
        .returning()
      assert(team, 500, `Failed to create team "${body.slug}"`)

      const [teamMember] = await tx.insert(schema.teamMembers).values({
        userId: user.id,
        teamId: team.id,
        teamSlug: team.slug,
        role: 'admin',
        confirmed: true
      })
      assert(
        teamMember,
        500,
        `Failed to create team member owner for team "${body.slug}"`
      )

      return c.json(parseZodSchema(schema.teamSelectSchema, team))
    })
  })
}
