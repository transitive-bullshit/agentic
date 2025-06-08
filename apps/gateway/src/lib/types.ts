import type { AgenticApiClient } from '@agentic/platform-api-client'
import type {
  DefaultHonoBindings,
  DefaultHonoVariables
} from '@agentic/platform-hono'
import type {
  AdminDeployment,
  Consumer,
  PricingPlan,
  Tool,
  User
} from '@agentic/platform-types'
import type { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import type { Context } from 'hono'
import type { Simplify } from 'type-fest'

import type { DurableMcpClient } from './durable-mcp-client'
import type { Env } from './env'

export type McpToolCallResponse = Simplify<
  Awaited<ReturnType<McpClient['callTool']>>
>

export type AdminConsumer = Simplify<
  Consumer & {
    user: User
  }
>

export type GatewayHonoVariables = Simplify<
  DefaultHonoVariables & {
    client: AgenticApiClient
    cache: Cache
    sessionId?: string
    reportUsage?: boolean
  }
>

export type GatewayHonoBindings = Simplify<DefaultHonoBindings & Env>

export type GatewayHonoEnv = {
  Bindings: GatewayHonoBindings
  Variables: GatewayHonoVariables
}

export type GatewayHonoContext = Context<GatewayHonoEnv>

// TODO: better type here
export type ToolCallArgs = Record<string, any>

export type ResolvedOriginRequest = {
  deployment: AdminDeployment
  tool: Tool

  consumer?: AdminConsumer
  pricingPlan?: PricingPlan

  toolCallArgs?: ToolCallArgs
  originRequest?: Request
  mcpClient?: DurableObjectStub<DurableMcpClient>
}
