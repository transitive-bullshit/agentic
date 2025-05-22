import type { components } from './openapi'

export type Consumer = components['schemas']['Consumer']
export type Project = components['schemas']['Project']
export type Deployment = components['schemas']['Deployment']
export type User = components['schemas']['User']
export type Team = components['schemas']['Team']
export type TeamMember = components['schemas']['TeamMember']

export type AuthProviderType = components['schemas']['AuthProviderType']
export type AuthProvider = components['schemas']['AuthProvider']
export type AuthProviders = components['schemas']['AuthProviders']

export type ProjectIdentifier = components['schemas']['ProjectIdentifier']
export type DeploymentIdentifier = components['schemas']['DeploymentIdentifier']

export type DeploymentOriginAdapter =
  components['schemas']['DeploymentOriginAdapter']

export type RateLimit = components['schemas']['RateLimit']
export type PricingInterval = components['schemas']['PricingInterval']
export type PricingPlanTier = components['schemas']['PricingPlanTier']
export type PricingPlanLineItem = components['schemas']['PricingPlanLineItem']
export type PricingPlan = components['schemas']['PricingPlan']

export type PricingPlanName = components['schemas']['name']
export type PricingPlanSlug = components['schemas']['slug']
export type PricingPlanLabel = components['schemas']['label']

export type AuthSession = {
  session: Session
  user: AuthUser
}

export interface Session {
  id: string
  token: string
  userId: string
  ipAddress?: string | null
  userAgent?: string | null
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  name: string
  role: string
  username?: string
  email: string
  emailVerified: boolean
  image?: string
  createdAt: string
  updatedAt: string
}
