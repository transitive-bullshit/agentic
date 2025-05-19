import { relations } from '@fisch0920/drizzle-orm'
import { index, jsonb, pgTable, text } from '@fisch0920/drizzle-orm/pg-core'

import {
  createInsertSchema,
  createSelectSchema,
  cuid,
  deploymentId,
  id,
  logEntryLevelEnum,
  logEntryTypeEnum,
  projectId,
  timestamps
} from './common'
import { consumers } from './consumer'
import { deployments } from './deployment'
import { projects } from './project'
import { users } from './user'

/**
 * A `LogEntry` is an internal audit log entry.
 */
export const logEntries = pgTable(
  'log_entries',
  {
    id,
    ...timestamps,

    // core data (required)
    type: logEntryTypeEnum().notNull().default('log'),
    level: logEntryLevelEnum().notNull().default('info'),
    message: text().notNull(),

    // context info (required)
    environment: text(),
    service: text(),
    requestId: text(),
    traceId: text(),

    // relations (optional)
    userId: cuid(),
    projectId: projectId(),
    deploymentId: deploymentId(),
    consumerId: cuid(),

    // misc metadata (optional)
    metadata: jsonb().$type<Record<string, unknown>>().default({}).notNull()
  },
  (table) => [
    index('log_entry_type_idx').on(table.type),
    index('log_entry_level_idx').on(table.level),
    index('log_entry_environment_idx').on(table.environment),
    index('log_entry_service_idx').on(table.service),
    index('log_entry_requestId_idx').on(table.requestId),
    index('log_entry_traceId_idx').on(table.traceId),
    index('log_entry_userId_idx').on(table.userId),
    index('log_entry_projectId_idx').on(table.projectId),
    index('log_entry_deploymentId_idx').on(table.deploymentId),
    index('log_entry_consumerId_idx').on(table.consumerId),
    index('log_entry_createdAt_idx').on(table.createdAt),
    index('log_entry_updatedAt_idx').on(table.updatedAt)
  ]
)

export const logEntriesRelations = relations(logEntries, ({ one }) => ({
  user: one(users, {
    fields: [logEntries.userId],
    references: [users.id]
  }),
  project: one(projects, {
    fields: [logEntries.projectId],
    references: [projects.id]
  }),
  deployment: one(deployments, {
    fields: [logEntries.deploymentId],
    references: [deployments.id]
  }),
  consumer: one(consumers, {
    fields: [logEntries.consumerId],
    references: [consumers.id]
  })
}))

export const logEntrySelectSchema = createSelectSchema(logEntries)
  // .extend({
  //   user: z
  //     .lazy(() => userSelectSchema)
  //     .optional()
  //     .openapi('User', { type: 'object' }),

  //   project: z
  //     .lazy(() => projectSelectSchema)
  //     .optional()
  //     .openapi('Project', { type: 'object' }),

  //   deployment: z
  //     .lazy(() => deploymentSelectSchema)
  //     .optional()
  //     .openapi('Deployment', { type: 'object' }),

  //   consumer: z
  //     .lazy(() => consumerSelectSchema)
  //     .optional()
  //     .openapi('Consumer', { type: 'object' })
  // })
  .strip()
  .openapi('LogEntry')

export const logEntryInsertSchema = createInsertSchema(logEntries)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .strict()
