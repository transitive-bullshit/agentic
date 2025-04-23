import { and, eq } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, schema } from '@/db'

import { aclTeamMember } from '../acl-team-member'
import { assert } from '../utils'

export const team = createMiddleware<AuthenticatedEnv>(async (ctx, next) => {
  const teamId = ctx.req.query('teamId')
  const user = ctx.get('user')

  if (teamId && user) {
    const teamMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(schema.teamMembers.teamId, teamId),
        eq(schema.teamMembers.userId, user.id)
      ),
      with: { team: true }
    })
    assert(teamMember, 401, 'Unauthorized')

    await aclTeamMember(ctx, teamMember)

    ctx.set('teamMember', teamMember)
  }

  await next()
})
