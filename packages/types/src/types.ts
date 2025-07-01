/**
 * This file exports backend model types which are inferred based on the
 * generated `openapi.d.ts` file. Some types are customized to provide stricter
 * types than what `@hono/zod-openapi` and `zod` v3 provide, but in general
 * these types are meant to use the backend API as a source of truth.
 */
import type { Simplify } from 'type-fest'

import type { components } from './openapi.d.ts'
import type { OriginAdapter } from './origin-adapter.js'
import type { PricingPlan } from './pricing'
import type { RateLimit } from './rate-limit.js'
import type { ToolConfig } from './tools'

// TODO: These extra simplify statements for populated references shouldn't be
// necessary here, but Hono's OpenAPI support is currently failing to generate
// these self-referential types correctly in some cases, so we're just hard-
// coding the types here to make them nicer. Same with derived fields.

export type User = components['schemas']['User']
export type Team = components['schemas']['Team']
export type TeamMember = components['schemas']['TeamMember']
export type AuthSession = components['schemas']['AuthSession']

export type Consumer = Simplify<
  components['schemas']['Consumer'] & {
    user?: User
    project?: Project
    deployment?: Deployment

    /**
     * A private admin URL for managing the customer's subscription. This URL
     * is only accessible by the customer.
     *
     * @example https://agentic.so/app/consumers/cons_123
     */
    adminUrl: string
  }
>
export type Project = Simplify<
  Omit<
    components['schemas']['Project'],
    'lastPublishedDeployment' | 'lastDeployment'
  > & {
    user?: User
    team?: Team
    lastPublishedDeployment?: Simplify<Omit<Deployment, 'project'>>
    lastDeployment?: Simplify<Omit<Deployment, 'project'>>

    /**
     * The public base HTTP URL for the project supporting HTTP POST requests for
     * individual tools at `/tool-name` subpaths.
     *
     * @example https://gateway.agentic.so/@agentic/search
     */
    gatewayBaseUrl: string

    /**
     * The public MCP URL for the project supporting the Streamable HTTP transport.
     *
     * @example https://gateway.agentic.so/@agentic/search/mcp
     */
    gatewayMcpUrl: string

    /**
     * The public marketplace URL for the project.
     *
     * @example https://agentic.so/marketplace/projects/@agentic/search
     */
    marketplaceUrl: string

    /**
     * A private admin URL for managing the project. This URL is only accessible
     * by project owners.
     *
     * @example https://agentic.so/app/projects/@agentic/search
     */
    adminUrl: string
  }
>
export type Deployment = Simplify<
  Omit<
    components['schemas']['Deployment'],
    'pricingPlans' | 'toolConfigs' | 'defaultRateLimit' | 'project'
  > & {
    pricingPlans: PricingPlan[]
    toolConfigs: ToolConfig[]
    defaultRateLimit: RateLimit
    project?: Simplify<
      Omit<Project, 'lastPublishedDeployment' | 'lastDeployment'>
    >

    /**
     * The public base HTTP URL for the deployment supporting HTTP POST requests
     * for individual tools at `/tool-name` subpaths.
     *
     * @example https://gateway.agentic.so/@agentic/search@latest
     */
    gatewayBaseUrl: string

    /**
     * The public MCP URL for the deployment supporting the Streamable HTTP
     * transport.
     *
     * @example https://gateway.agentic.so/@agentic/search@latest/mcp
     */
    gatewayMcpUrl: string

    /**
     * The public marketplace URL for the deployment's project.
     *
     * Note that only published deployments are visible on the marketplace.
     *
     * @example https://agentic.so/marketplace/projects/@agentic/search
     */
    marketplaceUrl: string

    /**
     * A private admin URL for managing the deployment. This URL is only accessible
     * by project owners.
     *
     * @example https://agentic.so/app/projects/@agentic/search/deployments/123
     */
    adminUrl: string
  }
>

export type AdminDeployment = Simplify<
  Omit<
    components['schemas']['AdminDeployment'],
    'pricingPlans' | 'toolConfigs' | 'defaultRateLimit' | 'origin' | 'project'
  > & {
    pricingPlans: PricingPlan[]
    toolConfigs: ToolConfig[]
    defaultRateLimit: RateLimit
    origin: OriginAdapter
  } & Pick<
      Deployment,
      | 'gatewayBaseUrl'
      | 'gatewayMcpUrl'
      | 'marketplaceUrl'
      | 'adminUrl'
      | 'project'
    >
>

export type AdminConsumer = Simplify<
  components['schemas']['AdminConsumer'] & {
    user?: User
    project?: Project
    deployment?: Deployment
  } & Pick<Consumer, 'adminUrl'>
>

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
