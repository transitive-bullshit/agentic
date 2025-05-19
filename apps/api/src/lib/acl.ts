import { assert } from '@agentic/platform-core'

import type { AuthenticatedContext } from './types'
import { ensureAuthUser } from './ensure-auth-user'

export async function acl<
  TModel extends Record<string, unknown>,
  TUserField extends keyof TModel = 'userId',
  TTeamField extends keyof TModel = 'teamId'
>(
  ctx: AuthenticatedContext,
  model: TModel,
  {
    label,
    userField = 'userId' as TUserField,
    teamField = 'teamId' as TTeamField
  }: {
    label: string
    userField?: TUserField
    teamField?: TTeamField
  }
) {
  const user = await ensureAuthUser(ctx)
  const teamMember = ctx.get('teamMember')

  const userFieldValue = model[userField]
  const teamFieldValue = model[teamField]

  const isAuthUserOwner = userFieldValue && userFieldValue === user.id
  const isAuthUserAdmin = user.role === 'admin'
  const hasTeamAccess =
    teamMember && teamFieldValue && teamFieldValue === teamMember.teamId

  assert(
    isAuthUserOwner || isAuthUserAdmin || hasTeamAccess,
    403,
    `User does not have access to ${label} "${model.id ?? userFieldValue}"`
  )
}
