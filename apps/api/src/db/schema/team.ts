import { relations } from 'drizzle-orm'
import { index, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { teamMembers } from './team-members'
import { users } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  cuid,
  id,
  timestamps
} from './utils'

export const teams = pgTable(
  'teams',
  {
    id,
    ...timestamps,

    slug: text().notNull().unique(),
    name: text().notNull(),

    ownerId: cuid().notNull()
  },
  (table) => [
    uniqueIndex('team_slug_idx').on(table.slug),
    index('team_createdAt_idx').on(table.createdAt),
    index('team_updatedAt_idx').on(table.updatedAt)
  ]
)

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id]
  }),
  members: many(teamMembers)
}))

export type Team = typeof teams.$inferSelect

export const teamInsertSchema = createInsertSchema(teams, {
  slug: (schema) => schema.min(3).max(20) // TODO
})
export const teamSelectSchema = createSelectSchema(teams)
export const teamUpdateSchema = createUpdateSchema(teams).omit({ slug: true })
