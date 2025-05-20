import { assert } from '@agentic/platform-core'

import { and, db, eq, type RawTeamMember, schema } from '@/db'

import type { AuthenticatedContext } from './types'
import { ensureAuthUser } from './ensure-auth-user'

export async function aclTeamMember(
  ctx: AuthenticatedContext,
  {
    teamId,
    teamSlug,
    teamMember,
    userId
  }: {
    teamId?: string
    teamSlug?: string
    teamMember?: RawTeamMember
    userId?: string
  } & (
    | { teamSlug: string }
    | { teamId: string }
    | { teamMember: RawTeamMember }
  )
) {
  const teamLabel = teamId ?? teamSlug
  assert(teamLabel, 500, 'Either teamSlug or teamId must be provided')

  const user = await ensureAuthUser(ctx)

  if (user.role === 'admin') {
    // TODO: Allow admins to access all team resources
    return
  }

  userId ??= user.id

  if (!teamMember) {
    teamMember = await db.query.teamMembers.findFirst({
      where: and(
        teamId
          ? eq(schema.teamMembers.teamId, teamId)
          : eq(schema.teamMembers.teamSlug, teamSlug!),
        eq(schema.teamMembers.userId, userId)
      )
    })
  }

  assert(teamMember, 403, `User does not have access to team "${teamLabel}"`)
  if (!ctx.get('teamMember')) {
    ctx.set('teamMember', teamMember)
  }

  assert(
    teamMember.userId === userId,
    403,
    `User does not have access to team "${teamLabel}"`
  )

  assert(
    teamMember.confirmed,
    403,
    `User has not confirmed their invitation to team "${teamLabel}"`
  )
}
