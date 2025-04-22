// import type { Context } from 'hono'

import type { TeamMemberWithTeam, User } from '@/db'

export type AuthenticatedContext = {
  user: User
  teamMember?: TeamMemberWithTeam
}
