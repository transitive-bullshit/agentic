import { and, db, eq, type RawTeamMember, schema } from '@/db'

import type { AuthenticatedContext } from './types'
import { ensureAuthUser } from './ensure-auth-user'
import { assert } from './utils'

export async function aclTeamMember(
  ctx: AuthenticatedContext,
  {
    teamSlug,
    teamId,
    teamMember,
    userId
  }: {
    teamSlug?: string
    teamId?: string
    teamMember?: RawTeamMember
    userId?: string
  } & (
    | { teamSlug: string }
    | { teamId: string }
    | { teamMember: RawTeamMember }
  )
) {
  const user = await ensureAuthUser(ctx)
  assert(teamSlug || teamId, 500, 'Either teamSlug or teamId must be provided')

  if (user.role === 'admin') {
    // TODO: Allow admins to access all team resources
    return
  }

  userId ??= user.id

  if (!teamMember) {
    teamMember = await db.query.teamMembers.findFirst({
      where: and(
        teamSlug
          ? eq(schema.teamMembers.teamSlug, teamSlug)
          : eq(schema.teamMembers.teamId, teamId!),
        eq(schema.teamMembers.userId, userId)
      )
    })
  }

  assert(teamMember, 403, `User does not have access to team "${teamSlug}"`)
  if (!ctx.get('teamMember')) {
    ctx.set('teamMember', teamMember)
  }

  assert(
    teamMember.userId === userId,
    403,
    `User does not have access to team "${teamSlug}"`
  )

  assert(
    teamMember.confirmed,
    403,
    `User has not confirmed their invitation to team "${teamSlug}"`
  )
}
