import type { AgenticApiClient } from '@agentic/platform-api-client'
import type { RateLimitResult } from '@agentic/platform-core'
import type {
  DefaultHonoBindings,
  DefaultHonoVariables
} from '@agentic/platform-hono'
import type {
  AdminConsumer as AdminConsumerImpl,
  AdminDeployment,
  PricingPlan,
  RateLimit,
  Tool,
  ToolConfig,
  User
} from '@agentic/platform-types'
import type { ParsedToolIdentifier } from '@agentic/platform-validators'
import type { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import type { Context } from 'hono'
import type { Simplify } from 'type-fest'

import type { Env } from './env'

export type { RateLimitResult } from '@agentic/platform-core'

export type McpToolCallResponse = Simplify<
  Awaited<ReturnType<McpClient['callTool']>>
>

export type AdminConsumer = Simplify<
  AdminConsumerImpl & {
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

export type RateLimitState = {
  current: number
  resetTimeMs: number
}

export type RateLimitCache = Map<string, RateLimitState>

export type CacheStatus = 'HIT' | 'MISS' | 'BYPASS' | 'DYNAMIC'
export type EdgeRequestMode = 'MCP' | 'HTTP'

export type WaitUntil = (promise: Promise<any>) => void

export interface ResolvedEdgeRequest extends Record<string, unknown> {
  edgeRequestMode: EdgeRequestMode
  parsedToolIdentifier: ParsedToolIdentifier
  deployment: AdminDeployment
  requestId: string
  ip?: string
}

export interface ResolvedMcpEdgeRequest extends ResolvedEdgeRequest {
  edgeRequestMode: 'MCP'
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
}

export interface ResolvedHttpEdgeRequest extends ResolvedEdgeRequest {
  edgeRequestMode: 'HTTP'
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
  tool: Tool
  toolCallArgs: ToolCallArgs
  cacheControl?: string
}

export type ResolvedOriginToolCallResult = {
  toolCallArgs: ToolCallArgs
  originRequest?: Request
  originResponse?: Response
  toolCallResponse?: McpToolCallResponse
  rateLimit?: RateLimit
  rateLimitResult?: RateLimitResult
  cacheStatus: CacheStatus
  reportUsage: boolean
  toolConfig?: ToolConfig
  originTimespanMs: number
  numRequestsCost: number
} & (
  | {
      originRequest: Request
      originResponse: Response
      toolCallResponse?: never
    }
  | {
      originRequest?: never
      originResponse?: never
      toolCallResponse: McpToolCallResponse
    }
)
