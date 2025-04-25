import { createSchemaFactory } from '@fisch0920/drizzle-zod'
import { z } from '@hono/zod-openapi'
import { createId } from '@paralleldrive/cuid2'
import { sql, type Writable } from 'drizzle-orm'
import {
  pgEnum,
  type PgVarcharBuilderInitial,
  type PgVarcharConfig,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core'

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

export const id = varchar('id', { length: 24 })
  .primaryKey()
  .$defaultFn(createId)

export const timestamps = {
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' })
    .notNull()
    .default(sql`now()`)
}

export const userRoleEnum = pgEnum('UserRole', ['user', 'admin'])
export const teamMemberRoleEnum = pgEnum('TeamMemberRole', ['user', 'admin'])

// TODO: Currently unused after forking drizzle-zod.
// export function makeNullablePropsOptional<Schema extends z.AnyZodObject>(
//   schema: Schema
// ): z.ZodObject<{
//   [key in keyof Schema['shape']]: Schema['shape'][key] extends z.ZodNullable<
//     infer T
//   >
//     ? z.ZodOptional<T>
//     : Schema['shape'][key]
// }> {
//   const entries = Object.entries(schema.shape)
//   const newProps: any = {}

//   for (const [key, value] of entries) {
//     newProps[key] =
//       value instanceof z.ZodNullable ? value.unwrap().optional() : value
//     return newProps
//   }

//   return z.object(newProps) as any
// }

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    zodInstance: z,
    coerce: {
      // Coerce dates / strings to timetamps
      date: true
    }
  })
