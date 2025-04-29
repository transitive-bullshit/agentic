import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { aclTeamAdmin } from '@/lib/acl-team-admin'
import { aclTeamMember } from '@/lib/acl-team-member'
import { assert, parseZodSchema } from '@/lib/utils'

import { TeamSlugParamsSchema } from '../schemas'
import { TeamMemberUserIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Deletes a team member.',
  tags: ['teams'],
  operationId: 'deleteTeamMember',
  method: 'delete',
  path: 'teams/{team}/members/{userId}',
  security: [{ bearerAuth: [] }],
  request: {
    params: TeamSlugParamsSchema.merge(TeamMemberUserIdParamsSchema)
  },
  responses: {
    200: {
      description: 'The deleted team member',
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

export function registerV1TeamsMembersDeleteTeamMember(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { team: teamSlug, userId } = c.req.valid('param')

    await aclTeamAdmin(c, { teamSlug })
    await aclTeamMember(c, { teamSlug, userId })

    const [teamMember] = await db
      .delete(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.teamSlug, teamSlug),
          eq(schema.teamMembers.userId, userId)
        )
      )
      .returning()
    assert(
      teamMember,
      404,
      `Team member "${userId}" for team "${teamSlug}" not found`
    )

    return c.json(parseZodSchema(schema.teamMemberSelectSchema, teamMember))
  })
}
