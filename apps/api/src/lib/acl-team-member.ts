import type { TeamMemberWithTeam } from '@/db'

import type { AuthenticatedContext } from './types'
import { assert } from './utils'

export async function aclTeamMember(
  ctx: AuthenticatedContext,
  teamMember: TeamMemberWithTeam
) {
  const user = ctx.get('user')
  assert(user, 401, 'Authentication required')

  assert(
    teamMember.userId === user.id,
    403,
    `User does not have access to team "${teamMember.team.slug}"`
  )

  assert(
    teamMember.confirmed,
    403,
    `User has not confirmed their invitation to team "${teamMember.team.slug}"`
  )
}
