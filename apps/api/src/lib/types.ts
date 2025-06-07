import type {
  DefaultHonoBindings,
  DefaultHonoEnv,
  DefaultHonoVariables
} from '@agentic/platform-hono'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Context } from 'hono'
import type { Simplify } from 'type-fest'

import type { RawTeamMember, RawUser } from '@/db'

import type { Env } from './env'

export type AuthenticatedHonoVariables = Simplify<
  DefaultHonoVariables & {
    userId: string
    user?: RawUser
    teamMember?: RawTeamMember
  }
>

export type AuthenticatedHonoBindings = Simplify<DefaultHonoBindings & Env>

export type AuthenticatedHonoEnv = {
  Bindings: AuthenticatedHonoBindings
  Variables: AuthenticatedHonoVariables
}

export type AuthenticatedHonoContext = Context<AuthenticatedHonoEnv>

export type HonoApp = OpenAPIHono<DefaultHonoEnv>
export type AuthenticatedHonoApp = OpenAPIHono<AuthenticatedHonoEnv>
