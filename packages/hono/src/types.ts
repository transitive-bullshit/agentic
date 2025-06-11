import type { Logger } from '@agentic/platform-core'
import type { Context } from 'hono'
import type { Simplify } from 'type-fest'

import type { Env } from './env'
import type { Sentry } from './sentry'

export type { Env } from './env'
export type { Sentry } from './sentry'

export type Environment = Env['ENVIRONMENT']
export type Service = Env['SERVICE']

export type DefaultHonoVariables = {
  sentry: Sentry
  requestId: string
  logger: Logger
  isJsonRpcRequest?: boolean
  ip?: string
}

export type DefaultHonoBindings = Simplify<
  Env & {
    sentry: Sentry
  }
>

export type DefaultHonoEnv = {
  Bindings: DefaultHonoBindings
  Variables: DefaultHonoVariables
}

export type DefaultHonoContext = Context<DefaultHonoEnv>
