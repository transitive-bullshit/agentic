import { type Equal, sql, type Writable } from '@fisch0920/drizzle-orm'
import {
  pgEnum,
  type PgTimestampBuilderInitial,
  type PgTimestampConfig,
  type PgTimestampStringBuilderInitial,
  type PgVarcharBuilderInitial,
  type PgVarcharConfig,
  timestamp as timestampImpl,
  varchar
} from '@fisch0920/drizzle-orm/pg-core'
import { createSchemaFactory } from '@fisch0920/drizzle-zod'
import { z } from '@hono/zod-openapi'
import { createId } from '@paralleldrive/cuid2'

import { hashObject, omit } from '@/lib/utils'

import type { RawProject } from '../types'
import type {
  PricingInterval,
  PricingPlan,
  PricingPlanMap,
  PricingPlanMetric
} from './types'

const usernameAndTeamSlugLength = 64 as const

/**
 * `cuid2`
 */
export function cuid<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, 24> {
  return varchar({ length: 24, ...config })
}

export function stripeId<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, 255> {
  return varchar({ length: 255, ...config })
}

/**
 * `namespace/projectName`
 */
export function projectId<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, 130> {
  return varchar({ length: 130, ...config })
}

/**
 * `namespace/projectName@hash`
 */
export function deploymentId<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, 160> {
  return varchar({ length: 160, ...config })
}

export function username<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, typeof usernameAndTeamSlugLength> {
  return varchar({ length: usernameAndTeamSlugLength, ...config })
}

export function teamSlug<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, typeof usernameAndTeamSlugLength> {
  return varchar({ length: usernameAndTeamSlugLength, ...config })
}

/**
 * Default `id` primary key as a cuid2
 */
export const id = varchar('id', { length: 24 })
  .primaryKey()
  .$defaultFn(createId)

/**
 * Timestamp with mode `string`
 */
export function timestamp<
  TMode extends PgTimestampConfig['mode'] & {} = 'string'
>(
  config?: PgTimestampConfig<TMode>
): Equal<TMode, 'string'> extends true
  ? PgTimestampStringBuilderInitial<''>
  : PgTimestampBuilderInitial<''> {
  return timestampImpl<TMode>({
    mode: 'string' as unknown as TMode,
    ...config
  })
}

export const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .default(sql`now()`)
}

export const userRoleEnum = pgEnum('UserRole', ['user', 'admin'])
export const teamMemberRoleEnum = pgEnum('TeamMemberRole', ['user', 'admin'])
export const logEntryTypeEnum = pgEnum('LogEntryType', ['log'])
export const logEntryLevelEnum = pgEnum('LogEntryLevel', [
  'trace',
  'debug',
  'info',
  'warn',
  'error'
])
export const pricingIntervalEnum = pgEnum('PricingInterval', [
  'day',
  'week',
  'month',
  'year'
])
export const pricingCurrencyEnum = pgEnum('PricingCurrency', ['usd'])

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    zodInstance: z,
    coerce: {
      // Coerce dates / strings to timetamps
      date: true
    }
  })

/**
 * Gets the hash used to uniquely map a PricingPlanMetric to its corresponding
 * Stripe Price in a stable way across deployments within a project.
 *
 * This hash is used as the key for the `Project._stripePriceIdMap`.
 */
export function getPricingPlanMetricHashForStripePrice({
  pricingPlanMetric,
  project
}: {
  pricingPlanMetric: PricingPlanMetric
  project: RawProject
}) {
  // TODO: use pricingPlan.slug as well here?
  // 'price:free:base:<hash>'
  // 'price:basic-monthly:base:<hash>'
  // 'price:basic-monthly:requests:<hash>'

  const hash = hashObject({
    ...omit(pricingPlanMetric, 'stripePriceId', 'stripeMeterId'),
    projectId: project.id,
    stripeAccountId: project._stripeAccountId,
    currency: project.pricingCurrency
  })

  return `price:${pricingPlanMetric.slug}:${hash}`
}

export function getPricingPlansByInterval({
  pricingInterval,
  pricingPlanMap
}: {
  pricingInterval: PricingInterval
  pricingPlanMap: PricingPlanMap
}): PricingPlan[] {
  return Object.values(pricingPlanMap).filter(
    (pricingPlan) => pricingPlan.interval === pricingInterval
  )
}

const pricingIntervalToLabelMap: Record<PricingInterval, string> = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly'
}

export function getLabelForPricingInterval(
  pricingInterval: PricingInterval
): string {
  return pricingIntervalToLabelMap[pricingInterval]
}
