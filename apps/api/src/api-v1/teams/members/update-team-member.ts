import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
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
  description: 'Updates a team member.',
  tags: ['teams'],
  operationId: 'updateTeamMember',
  method: 'post',
  path: 'teams/{teamId}/members/{userId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: teamIdTeamMemberUserIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.teamMemberUpdateSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'The updated team member',
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

export function registerV1TeamsMembersUpdateTeamMember(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { teamId, userId } = c.req.valid('param')
    const body = c.req.valid('json')

    await aclTeamAdmin(c, { teamId })
    await aclTeamMember(c, { teamId, userId })

    const [teamMember] = await db
      .update(schema.teamMembers)
      .set(body)
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
