import type { AgenticApiClient } from '@agentic/platform-api-client'
import type {
  DefaultHonoBindings,
  DefaultHonoVariables
} from '@agentic/platform-hono'
import type {
  AdminDeployment,
  Consumer,
  Tool,
  User
} from '@agentic/platform-types'
import type { Context } from 'hono'
import type { Simplify } from 'type-fest'

import type { Env } from './env'

export type AdminConsumer = Simplify<
  Consumer & {
    user: User
  }
>

export type GatewayHonoVariables = Simplify<
  DefaultHonoVariables & {
    client: AgenticApiClient
    cache: Cache
  }
>

export type GatewayHonoBindings = Simplify<DefaultHonoBindings & Env>

export type GatewayHonoEnv = {
  Bindings: GatewayHonoBindings
  Variables: GatewayHonoVariables
}

export type GatewayHonoContext = Context<GatewayHonoEnv>

export interface ResolvedOriginRequest {
  originRequest?: Request
  deployment: AdminDeployment
  consumer?: AdminConsumer
  tool: Tool
  method: string
  reportUsage: boolean
  ip?: string
  pricingPlanSlug?: string
}
