import { relations } from '@fisch0920/drizzle-orm'
import { index, pgTable, text } from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import { consumers, consumerSelectSchema } from './consumer'
import { deployments, deploymentSelectSchema } from './deployment'
import { projects, projectSelectSchema } from './project'
import { users, userSelectSchema } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  cuid,
  deploymentId,
  id,
  projectId,
  stripeId,
  timestamps
} from './utils'

export const logEntries = pgTable(
  'log_entries',
  {
    id,
    ...timestamps,

    type: text().notNull(),
    level: text().notNull().default('info'), // TODO: enum

    // relations
    userId: cuid(),
    projectId: projectId(),
    deploymentId: deploymentId(),
    consumerId: cuid(),

    // (optional) misc context info
    service: text(),
    hostname: text(),
    provider: text(),
    ip: text(),
    plan: text(),
    subtype: text(),

    // (optional) denormalized info
    username: text(),
    email: text(),
    token: text(),

    // (optional) denormalized stripe info
    stripeCustomer: stripeId(),
    stripeSubscription: stripeId()
  },
  (table) => [
    index('log_entry_type_idx').on(table.type),
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
  .extend({
    user: z
      .lazy(() => userSelectSchema)
      .optional()
      .openapi('User', { type: 'object' }),

    project: z
      .lazy(() => projectSelectSchema)
      .optional()
      .openapi('Project', { type: 'object' }),

    deployment: z
      .lazy(() => deploymentSelectSchema)
      .optional()
      .openapi('Deployment', { type: 'object' }),

    consumer: z
      .lazy(() => consumerSelectSchema)
      .optional()
      .openapi('Consumer', { type: 'object' })
  })
  .strip()
  .openapi('LogEntry')

export const logEntryInsertSchema = createInsertSchema(logEntries)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .strict()
