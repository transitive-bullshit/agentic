import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { teamIdParamsSchema } from '../schemas'

const route = createRoute({
  description: 'Creates a team member.',
  tags: ['teams'],
  operationId: 'createTeamMember',
  method: 'post',
  path: 'teams/{teamId}/members',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: teamIdParamsSchema,
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
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404,
    ...openapiErrorResponse409
  }
})

export function registerV1TeamsMembersCreateTeamMember(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { teamId } = c.req.valid('param')
    const body = c.req.valid('json')
    await aclTeamAdmin(c, { teamId })

    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.id, teamId)
    })
    assert(team, 404, `Team not found "${teamId}"`)

    const existingTeamMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(schema.teamMembers.teamId, teamId),
        eq(schema.teamMembers.userId, body.userId)
      )
    })
    assert(
      existingTeamMember,
      409,
      `User "${body.userId}" is already a member of team "${teamId}"`
    )

    const [teamMember] = await db.insert(schema.teamMembers).values({
      ...body,
      teamId,
      teamSlug: team.slug
    })
    assert(
      teamMember,
      500,
      `Failed to create team member "${body.userId}"for team "${teamId}"`
    )

    // TODO: send team invite email

    return c.json(parseZodSchema(schema.teamMemberSelectSchema, teamMember))
  })
}
