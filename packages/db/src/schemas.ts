import { assert } from '@agentic/platform-core'
import { validators } from '@agentic/platform-validators'
import { z } from '@hono/zod-openapi'

import type { consumersRelations } from './schema/consumer'
import type { deploymentsRelations } from './schema/deployment'
import type { projectsRelations } from './schema/project'
import { idPrefixMap, type ModelType } from './schema/common'

export function getIdSchemaForModelType(modelType: ModelType) {
  const idPrefix = idPrefixMap[modelType]
  assert(idPrefix, 500, `Invalid model type: ${modelType}`)

  // Convert model type to PascalCase
  const modelDisplayName =
    modelType.charAt(0).toUpperCase() + modelType.slice(1)
  const example = `${idPrefix}_tz4a98xxat96iws9zmbrgj3a`

  return z
    .string()
    .refine(
      (id) => {
        const parts = id.split('_')
        if (parts.length !== 2) return false
        if (parts[0] !== idPrefix) return false
        if (!validators.cuid(parts[1])) return false

        return true
      },
      {
        message: `Invalid ${modelDisplayName} id`
      }
    )
    .describe(`${modelDisplayName} id (e.g. "${example}")`)
  // TODO: is this necessary?
  // .openapi(`${modelDisplayName}Id`, { example })
}

export const userIdSchema = getIdSchemaForModelType('user')
export const teamIdSchema = getIdSchemaForModelType('team')
export const consumerIdSchema = getIdSchemaForModelType('consumer')
export const projectIdSchema = getIdSchemaForModelType('project')
export const deploymentIdSchema = getIdSchemaForModelType('deployment')
export const logEntryIdSchema = getIdSchemaForModelType('logEntry')

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
