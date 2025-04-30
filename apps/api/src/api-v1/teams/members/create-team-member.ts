import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import { assert, parseZodSchema } from '@/lib/utils'

import { teamSlugParamsSchema } from '../schemas'

const route = createRoute({
  description: 'Creates a team member.',
  tags: ['teams'],
  operationId: 'createTeamMember',
  method: 'post',
  path: 'teams/{team}/members',
  security: [{ bearerAuth: [] }],
  request: {
    params: teamSlugParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.teamMemberInsertSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'The created team member',
      content: {
        'application/json': {
          schema: schema.teamMemberSelectSchema
        }
      }
    }
    // TODO
    // ...openApiErrorResponses
  }
})

export function registerV1TeamsMembersCreateTeamMember(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { team: teamSlug } = c.req.valid('param')
    const body = c.req.valid('json')
    await aclTeamAdmin(c, { teamSlug })

    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.slug, teamSlug)
    })
    assert(team, 404, `Team not found "${teamSlug}"`)

    const existingTeamMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(schema.teamMembers.teamSlug, teamSlug),
        eq(schema.teamMembers.userId, body.userId)
      )
    })
    assert(
      existingTeamMember,
      409,
      `User "${body.userId}" is already a member of team "${teamSlug}"`
    )

    const [teamMember] = await db.insert(schema.teamMembers).values({
      ...body,
      teamSlug,
      teamId: team.id
    })
    assert(
      teamMember,
      400,
      `Failed to create team member "${body.userId}"for team "${teamSlug}"`
    )

    // TODO: send team invite email

    return c.json(parseZodSchema(schema.teamMemberSelectSchema, teamMember))
  })
}
