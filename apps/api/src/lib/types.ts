import type { Context } from 'hono'

import type { TeamMemberWithTeam, User } from '@/db'

export type AuthenticatedEnvVariables = {
  user: User
  teamMember?: TeamMemberWithTeam
  jwtPayload:
    | {
        type: 'user'
        userId: string
        username: string
      }
    | {
        type: 'project'
        projectId: string
      }
}

export type AuthenticatedEnv = {
  Variables: AuthenticatedEnvVariables
}

export type AuthenticatedContext = Context<AuthenticatedEnv>
