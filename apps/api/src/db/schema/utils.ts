import { createId } from '@paralleldrive/cuid2'
import { sql, type Writable } from 'drizzle-orm'
import {
  pgEnum,
  type PgVarcharBuilderInitial,
  type PgVarcharConfig,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core'
import { createSchemaFactory } from 'drizzle-zod'

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

export const id = varchar('id', { length: 24 })
  .primaryKey()
  .$defaultFn(createId)

export const timestamps = {
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .default(sql`now()`)
}

export const userRoleEnum = pgEnum('UserRole', ['user', 'admin'])
export const teamMemberRoleEnum = pgEnum('TeamMemberRole', ['user', 'admin'])

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    coerce: {
      // Coerce dates / strings to timetamps
      date: true
    }
  })
