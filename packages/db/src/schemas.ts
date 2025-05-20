import { validators } from '@agentic/platform-validators'
import { z } from '@hono/zod-openapi'

import type { consumersRelations } from './schema/consumer'
import type { deploymentsRelations } from './schema/deployment'
import type { projectsRelations } from './schema/project'

function getCuidSchema(idLabel: string) {
  return z.string().refine((id) => validators.cuid(id), {
    message: `Invalid ${idLabel}`
  })
}

export const cuidSchema = getCuidSchema('id')
export const userIdSchema = getCuidSchema('user id')
export const teamIdSchema = getCuidSchema('team id')
export const consumerIdSchema = getCuidSchema('consumer id')
export const projectIdSchema = getCuidSchema('project id')
export const deploymentIdSchema = getCuidSchema('deployment id')
export const logEntryIdSchema = getCuidSchema('log entry id')

export const projectIdentifierSchema = z
  .string()
  .refine((id) => validators.projectIdentifier(id), {
    message: 'Invalid project identifier'
  })
  .openapi('ProjectIdentifier')

export const deploymentIdentifierSchema = z
  .string()
  .refine((id) => validators.deploymentIdentifier(id), {
    message: 'Invalid deployment identifier'
  })
  .openapi('DeploymentIdentifier')

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

export type ProjectRelationFields = keyof ReturnType<
  (typeof projectsRelations)['config']
>
export const projectRelationsSchema: z.ZodType<ProjectRelationFields> = z.enum([
  'user',
  'team',
  'lastPublishedDeployment',
  'lastDeployment'
])

export type DeploymentRelationFields = keyof ReturnType<
  (typeof deploymentsRelations)['config']
>
export const deploymentRelationsSchema: z.ZodType<DeploymentRelationFields> =
  z.enum(['user', 'team', 'project'])

export type ConsumerRelationFields = keyof ReturnType<
  (typeof consumersRelations)['config']
>
export const consumerRelationsSchema: z.ZodType<ConsumerRelationFields> =
  z.enum(['user', 'project', 'deployment'])
