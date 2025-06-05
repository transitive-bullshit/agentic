import { assert } from '@agentic/platform-core'

import { and, db, eq, schema, type TeamMember } from '@/db'

import type { AuthenticatedHonoContext } from './types'
import { ensureAuthUser } from './ensure-auth-user'

export async function aclTeamAdmin(
  ctx: AuthenticatedHonoContext,
  {
    teamId,
    teamSlug,
    teamMember
  }: {
    teamId?: string
    teamSlug?: string
    teamMember?: TeamMember
  } & (
    | {
        teamId: string
        teamSlug?: never
      }
    | {
        teamId?: never
        teamSlug: string
      }
  )
) {
  const teamLabel = teamId ?? teamSlug
  assert(teamLabel, 500, 'Either teamSlug or teamId must be provided')

  const user = await ensureAuthUser(ctx)

  if (user.role === 'admin') {
    // TODO: Allow admins to access all team resources
    return
  }

  if (!teamMember) {
    teamMember = await db.query.teamMembers.findFirst({
      where: and(
        teamId
          ? eq(schema.teamMembers.teamId, teamId)
          : eq(schema.teamMembers.teamSlug, teamSlug!),
        eq(schema.teamMembers.userId, user.id)
      )
    })
  }

  assert(teamMember, 403, `User does not have access to team "${teamLabel}"`)

  assert(
    teamMember.role === 'admin',
    403,
    `User does not have "admin" role for team "${teamLabel}"`
  )

  assert(
    teamMember.userId === user.id,
    403,
    `User does not have access to team "${teamLabel}"`
  )

  assert(
    teamMember.confirmed,
    403,
    `User has not confirmed their invitation to team "${teamLabel}"`
  )
}
