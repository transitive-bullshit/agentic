import { validators } from '@agentic/validators'
import { z } from '@hono/zod-openapi'

function getCuidSchema(idLabel: string) {
  return z.string().refine((id) => validators.cuid(id), {
    message: `Invalid ${idLabel}`
  })
}

export const cuidSchema = getCuidSchema('id')
export const userIdSchema = getCuidSchema('user id')
export const consumerIdSchema = getCuidSchema('consumer id')

export const projectIdSchema = z
  .string()
  .refine((id) => validators.projectId(id), {
    message: 'Invalid project id'
  })

export const deploymentIdSchema = z
  .string()
  .refine((id) => validators.deploymentId(id), {
    message: 'Invalid deployment id'
  })

export const usernameSchema = z
  .string()
  .refine((username) => validators.username(username), {
    message: 'Invalid username'
  })

export const teamSlugSchema = z
  .string()
  .refine((slug) => validators.team(slug), {
    message: 'Invalid team slug'
  })

export const paginationSchema = z.object({
  offset: z.number().int().nonnegative().default(0).optional(),
  limit: z.number().int().positive().max(100).default(10).optional(),
  sort: z.enum(['asc', 'desc']).default('desc').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt').optional()
})

// import type { PgTable, TableConfig } from '@fisch0920/drizzle-orm/pg-core'
// import type { AnyZodObject } from 'zod'
//
// export function createWhereFilterSchema<
//   TTableConfig extends TableConfig,
//   TTable extends PgTable<TTableConfig>,
//   T extends AnyZodObject
// >(table: TTable, schema: T) {
//   return z.object({
//     where: z.record(
//       z.enum(Object.keys(table._.columns) as [string, ...string[]]),
//       z.string()
//     )
//   })
// }
