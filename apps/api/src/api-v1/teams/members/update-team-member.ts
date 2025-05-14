import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import { aclTeamMember } from '@/lib/acl-team-member'
import {
  assert,
  openapiErrorResponse404,
  openapiErrorResponses,
  parseZodSchema
} from '@/lib/utils'

import { teamSlugTeamMemberUserIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a team member.',
  tags: ['teams'],
  operationId: 'updateTeamMember',
  method: 'put',
  path: 'teams/{team}/members/{userId}',
  security: [{ bearerAuth: [] }],
  request: {
    params: teamSlugTeamMemberUserIdParamsSchema,
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
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { team: teamSlug, userId } = c.req.valid('param')
    const body = c.req.valid('json')

    await aclTeamAdmin(c, { teamSlug })
    await aclTeamMember(c, { teamSlug, userId })

    const [teamMember] = await db
      .update(schema.teamMembers)
      .set(body)
      .where(
        and(
          eq(schema.teamMembers.teamSlug, teamSlug),
          eq(schema.teamMembers.userId, userId)
        )
      )
      .returning()
    assert(
      teamMember,
      400,
      `Failed to update team member "${userId}" for team "${teamSlug}"`
    )

    return c.json(parseZodSchema(schema.teamMemberSelectSchema, teamMember))
  })
}
