import type { Context } from 'hono'

import type { TeamMember, User } from '@/db'

export type AuthenticatedEnvVariables = {
  user: User
  teamMember?: TeamMember
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

// TODO: currently unused
// export type NullToUndefinedDeep<T> = T extends null
//   ? undefined
//   : T extends Date
//     ? T
//     : T extends readonly (infer U)[]
//       ? NullToUndefinedDeep<U>[]
//       : T extends object
//         ? { [K in keyof T]: NullToUndefinedDeep<T[K]> }
//         : T
