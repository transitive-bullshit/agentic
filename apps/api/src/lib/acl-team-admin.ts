import { and, db, eq, schema, type TeamMember } from '@/db'

import type { AuthenticatedContext } from './types'
import { assert } from './utils'

export async function aclTeamAdmin(
  ctx: AuthenticatedContext,
  {
    teamSlug,
    teamMember
  }: {
    teamSlug: string
    teamMember?: TeamMember
  }
) {
  const user = ctx.get('user')
  assert(user, 401, 'Authentication required')

  if (user.role === 'admin') {
    // TODO: Allow admins to access all team resources
    return
  }

  if (!teamMember) {
    teamMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(schema.teamMembers.teamSlug, teamSlug),
        eq(schema.teamMembers.userId, user.id)
      )
    })
  }

  assert(teamMember, 403, `User does not have access to team "${teamSlug}"`)

  assert(
    teamMember.role === 'admin',
    403,
    `User does not have "admin" role for team "${teamSlug}"`
  )

  assert(
    teamMember.userId === user.id,
    403,
    `User does not have access to team "${teamSlug}"`
  )

  assert(
    teamMember.confirmed,
    403,
    `User has not confirmed their invitation to team "${teamSlug}"`
  )
}
