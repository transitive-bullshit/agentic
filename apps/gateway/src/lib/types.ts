import type { AgenticApiClient } from '@agentic/platform-api-client'
import type { RateLimitResult } from '@agentic/platform-core'
import type {
  DefaultHonoBindings,
  DefaultHonoVariables
} from '@agentic/platform-hono'
import type { Consumer, User } from '@agentic/platform-types'
import type { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import type { Context } from 'hono'
import type { Simplify } from 'type-fest'

import type { Env } from './env'

export type { RateLimitResult } from '@agentic/platform-core'

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

export type RateLimitState = {
  current: number
  resetTimeMs: number
}

export type RateLimitCache = Map<string, RateLimitState>

export type ResolvedOriginToolCallResult = {
  rateLimitResult?: RateLimitResult
  toolCallArgs: ToolCallArgs
  originRequest?: Request
  originResponse?: Response
  toolCallResponse?: McpToolCallResponse
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

export type AgenticMcpRequestMetadata = {
  agenticProxySecret: string
  sessionId: string
  isCustomerSubscriptionActive: boolean

  customerId?: string
  customerSubscriptionStatus?: string
  customerSubscriptionPlan?: string

  userId?: string
  userEmail?: string
  userUsername?: string
  userName?: string
  userCreatedAt?: string
  userUpdatedAt?: string

  deploymentId: string
  deploymentIdentifier: string
  projectId: string
  projectIdentifier: string

  ip?: string
} & (
  | {
      // If the customer has an active subscription, these fields are guaranteed
      // to be present in the metadata.
      isCustomerSubscriptionActive: true

      customerId: string
      customerSubscriptionStatus: string

      userId: string
      userEmail: string
      userUsername: string
      userCreatedAt: string
      userUpdatedAt: string
    }
  | {
      // If the customer does not have an active subscription, then the customer
      // fields may or may not be present.
      isCustomerSubscriptionActive: false
    }
)
