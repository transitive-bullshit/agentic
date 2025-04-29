import type { AuthenticatedContext } from './types'
import { assert } from './utils'

export async function acl<
  TModel extends Record<string, unknown>,
  TUserField extends keyof TModel = 'user',
  TTeamField extends keyof TModel = 'team'
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
  const user = ctx.get('user')
  assert(user, 401, 'Authentication required')

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
