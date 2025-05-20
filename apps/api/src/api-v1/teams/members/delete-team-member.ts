import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import { aclTeamMember } from '@/lib/acl-team-member'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { teamIdTeamMemberUserIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Deletes a team member.',
  tags: ['teams'],
  operationId: 'deleteTeamMember',
  method: 'delete',
  path: 'teams/{teamId}/members/{userId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: teamIdTeamMemberUserIdParamsSchema
  },
  responses: {
    200: {
      description: 'The deleted team member',
      content: {
        'application/json': {
          schema: schema.teamMemberSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1TeamsMembersDeleteTeamMember(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { teamId, userId } = c.req.valid('param')

    await aclTeamAdmin(c, { teamId })
    await aclTeamMember(c, { teamId, userId })

    const [teamMember] = await db
      .delete(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.teamId, teamId),
          eq(schema.teamMembers.userId, userId)
        )
      )
      .returning()
    assert(
      teamMember,
      400,
      `Failed to update team member "${userId}" for team "${teamId}"`
    )

    return c.json(parseZodSchema(schema.teamMemberSelectSchema, teamMember))
  })
}
