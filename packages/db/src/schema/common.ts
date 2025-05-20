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
export function projectIdentifier<
  U extends string,
  T extends Readonly<[U, ...U[]]>
>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, 130> {
  return varchar({ length: 130, ...config })
}

/**
 * `namespace/projectName@hash`
 */
export function deploymentIdentifier<
  U extends string,
  T extends Readonly<[U, ...U[]]>
>(
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
    .default(sql`now()`),
  deletedAt: timestamp()
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
