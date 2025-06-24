/**
 * This file exports backend model types which are inferred based on the
 * generated `openapi.d.ts` file. Some types are customized to provide stricter
 * types than what `@hono/zod-openapi` and `zod` v3 provide, but in general
 * these types are meant to use the backend API as a source of truth.
 */
import type { Simplify } from 'type-fest'

import type { components } from './openapi.d.ts'
import type { PricingPlan } from './pricing'
import type { RateLimit } from './rate-limit.js'
import type { ToolConfig } from './tools'

// TODO: These extra simplify statements for populated references shouldn't be
// necessary here, but Hono's OpenAPI support is currently failing to generate
// these self-referential types correctly in some cases, so we're just hard-
// coding the types here to make them nicer.

export type User = components['schemas']['User']
export type Team = components['schemas']['Team']
export type TeamMember = components['schemas']['TeamMember']
export type AuthSession = components['schemas']['AuthSession']

export type Consumer = Simplify<
  components['schemas']['Consumer'] & {
    user?: User
    project?: Project
    deployment?: Deployment
  }
>
export type Project = Simplify<
  components['schemas']['Project'] & {
    user?: User
    team?: Team
    lastPublishedDeployment?: Deployment
    lastDeployment?: Deployment
  }
>
export type Deployment = Simplify<
  Omit<
    components['schemas']['Deployment'],
    'pricingPlans' | 'toolConfigs' | 'defaultRateLimit'
  > & {
    pricingPlans: PricingPlan[]
    toolConfigs: ToolConfig[]
    defaultRateLimit: RateLimit
    project?: components['schemas']['Project']
  }
>

export type AdminDeployment = Simplify<
  Omit<
    components['schemas']['AdminDeployment'],
    'pricingPlans' | 'toolConfigs' | 'defaultRateLimit'
  > & {
    pricingPlans: PricingPlan[]
    toolConfigs: ToolConfig[]
    defaultRateLimit: RateLimit
    project?: components['schemas']['Project']
  }
>

export type AdminConsumer = Simplify<
  components['schemas']['AdminConsumer'] & {
    user?: User
    project?: Project
    deployment?: Deployment
  }
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
