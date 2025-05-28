import type { AuthUser } from '@agentic/platform-schemas'
import type { Tokens as AuthTokens } from '@openauthjs/openauth/client'

import type { components } from './openapi'

export type Consumer = components['schemas']['Consumer']
export type Project = components['schemas']['Project']
export type Deployment = components['schemas']['Deployment']
export type User = components['schemas']['User']
export type Team = components['schemas']['Team']
export type TeamMember = components['schemas']['TeamMember']

export type ProjectIdentifier = components['schemas']['ProjectIdentifier']
export type DeploymentIdentifier = components['schemas']['DeploymentIdentifier']

export type OriginAdapter = components['schemas']['OriginAdapter']

export type RateLimit = components['schemas']['RateLimit']
export type PricingInterval = components['schemas']['PricingInterval']
export type PricingPlanTier = components['schemas']['PricingPlanTier']
export type PricingPlanLineItem = components['schemas']['PricingPlanLineItem']
export type PricingPlan = components['schemas']['PricingPlan']

export type PricingPlanName = components['schemas']['name']
export type PricingPlanSlug = components['schemas']['slug']
export type PricingPlanLabel = components['schemas']['label']

export type { AuthUser } from '@agentic/platform-schemas'
export type {
  AuthorizeResult,
  Tokens as AuthTokens
} from '@openauthjs/openauth/client'

export type OnUpdateAuthSessionFunction = (update?: {
  session: AuthTokens
  user: AuthUser
}) => unknown
