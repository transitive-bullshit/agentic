import type { Logger } from '@agentic/platform-core'
import type { Context } from 'hono'

import type { RawTeamMember, RawUser } from '@/db'

import type { Env } from './env'

export type Environment = Env['NODE_ENV']
export type Service = 'api'

export type DefaultEnvVariables = {
  requestId: string
  logger: Logger
}

export type AuthenticatedEnvVariables = DefaultEnvVariables & {
  userId: string
  user?: RawUser
  teamMember?: RawTeamMember
}

export type DefaultEnv = {
  Variables: DefaultEnvVariables
}

export type AuthenticatedEnv = {
  Variables: AuthenticatedEnvVariables
}

export type DefaultContext = Context<DefaultEnv>
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

// // TODO: currently unused
// export type UndefinedToNullDeep<T> = T extends undefined
//   ? T | null
//   : T extends Date
//     ? T | null
//     : T extends readonly (infer U)[]
//       ? UndefinedToNullDeep<U>[]
//       : T extends object
//         ? { [K in keyof T]: UndefinedToNullDeep<T[K]> }
//         : T | null

// // TODO: currently unused
// export type UndefinedValuesToNullableValues<T> = T extends object
//   ? { [K in keyof T]: T[K] extends undefined ? T[K] | null : T[K] }
//   : T
