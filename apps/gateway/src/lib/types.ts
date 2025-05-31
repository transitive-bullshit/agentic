import type { AgenticApiClient } from '@agentic/platform-api-client'
import type {
  AdminDeployment,
  Consumer,
  Tool,
  User
} from '@agentic/platform-types'

import type { AgenticEnv } from './env'

export type Context = ExecutionContext & {
  req: Request
  env: AgenticEnv
  client: AgenticApiClient
}

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

export type AdminConsumer = Consumer & {
  user: User
}
