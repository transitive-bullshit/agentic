import { assert } from '@agentic/platform-core'
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
import { createId as createCuid2 } from '@paralleldrive/cuid2'

export const namespaceMaxLength = 64 as const

// prefix is max 5 characters
// separator is 1 character
// cuid2 is max 24 characters
// so use 32 characters to be safe for storing ids
export const idMaxLength = 32 as const

export const idPrefixMap = {
  team: 'team',
  project: 'proj',
  deployment: 'depl',
  consumer: 'csmr',
  logEntry: 'log',

  // auth
  user: 'user',
  account: 'acct'
} as const

export type ModelType = keyof typeof idPrefixMap

export function createIdForModel(modelType: ModelType): string {
  const prefix = idPrefixMap[modelType]
  assert(prefix, 500, `Invalid model type: ${modelType}`)

  return `${prefix}_${createCuid2()}`
}

/**
 * Returns the primary `id` key to use for a given model type.
 */
function getPrimaryId(modelType: ModelType) {
  return {
    id: id()
      .primaryKey()
      .$defaultFn(() => createIdForModel(modelType))
  }
}

export const projectPrimaryId = getPrimaryId('project')
export const deploymentPrimaryId = getPrimaryId('deployment')
export const consumerPrimaryId = getPrimaryId('consumer')
export const logEntryPrimaryId = getPrimaryId('logEntry')
export const teamPrimaryId = getPrimaryId('team')
export const userPrimaryId = getPrimaryId('user')
export const accountPrimaryId = getPrimaryId('account')

/**
 * All of our model primary ids have the following format:
 *
 * `${modelPrefix}_${cuid2}`
 */
export function id<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, typeof idMaxLength> {
  return varchar({ length: idMaxLength, ...config })
}

export const projectId = id
export const deploymentId = id
export const consumerId = id
export const logEntryId = id
export const teamId = id
export const userId = id

export function stripeId<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, 255> {
  return varchar({ length: 255, ...config })
}

/**
 * `namespace/project-name`
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
 * `namespace/project-name@hash`
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
): PgVarcharBuilderInitial<'', Writable<T>, typeof namespaceMaxLength> {
  return varchar({ length: namespaceMaxLength, ...config })
}

export function teamSlug<U extends string, T extends Readonly<[U, ...U[]]>>(
  config?: PgVarcharConfig<T | Writable<T>, never>
): PgVarcharBuilderInitial<'', Writable<T>, typeof namespaceMaxLength> {
  return varchar({ length: namespaceMaxLength, ...config })
}

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
export const authProviderTypeEnum = pgEnum('AuthProviderType', [
  'github',
  'password'
])

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    zodInstance: z,
    coerce: {
      // Coerce dates / strings to timetamps
      date: true
    }
  })
