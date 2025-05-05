import type { Context } from 'hono'

import type { RawTeamMember, RawUser } from '@/db'

export type AuthenticatedEnvVariables = {
  userId: string
  user?: RawUser
  teamMember?: RawTeamMember
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

export type UndefinedToNullDeep<T> = T extends undefined
  ? T | null
  : T extends Date
    ? T | null
    : T extends readonly (infer U)[]
      ? UndefinedToNullDeep<U>[]
      : T extends object
        ? { [K in keyof T]: UndefinedToNullDeep<T[K]> }
        : T | null
