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
