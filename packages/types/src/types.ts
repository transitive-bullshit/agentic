/**
 * This file exports backend model types which are inferred based on the
 * generated `openapi.d.ts` file. Some types are customized to provide stricter
 * types than what `@hono/zod-openapi` and `zod` v3 provide, but in general
 * these types are meant to use the backend API as a source of truth.
 */
import type { PricingPlan, ToolConfig } from '@agentic/platform-types'
import type { Simplify } from 'type-fest'

import type { components } from './openapi.d.ts'

export type Consumer = components['schemas']['Consumer']
export type Project = components['schemas']['Project']
export type User = components['schemas']['User']
export type Team = components['schemas']['Team']
export type TeamMember = components['schemas']['TeamMember']

export type Deployment = Simplify<
  Omit<components['schemas']['Deployment'], 'pricingPlans' | 'toolConfigs'> & {
    pricingPlans: PricingPlan[]
    toolConfigs: ToolConfig[]
  }
>

export type AdminDeployment = Simplify<
  Omit<
    components['schemas']['AdminDeployment'],
    'pricingPlans' | 'toolConfigs'
  > & {
    pricingPlans: PricingPlan[]
    toolConfigs: ToolConfig[]
  }
>

export type AdminConsumer = Simplify<components['schemas']['AdminConsumer']>
