import { validators } from '@agentic/platform-validators'
import { relations } from '@fisch0920/drizzle-orm'
import {
  index,
  pgTable,
  text,
  uniqueIndex
} from '@fisch0920/drizzle-orm/pg-core'

import { userIdSchema } from '../schemas'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  teamPrimaryId,
  teamSlug,
  timestamps,
  userId
} from './common'
import { teamMembers } from './team-member'
import { users } from './user'

export const teams = pgTable(
  'teams',
  {
    id: teamPrimaryId,
    ...timestamps,

    slug: teamSlug().unique().notNull(),
    name: text().notNull(),

    ownerId: userId().notNull()
  },
  (table) => [
    uniqueIndex('team_slug_idx').on(table.slug),
    index('team_createdAt_idx').on(table.createdAt),
    index('team_updatedAt_idx').on(table.updatedAt),
    index('team_deletedAt_idx').on(table.deletedAt)
  ]
)

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id]
  }),
  members: many(teamMembers)
}))

export const teamSelectSchema = createSelectSchema(teams)
  // .extend({
  //   owner: z
  //     .lazy(() => userSelectSchema)
  //     .optional()
  //     .openapi('User', { type: 'object' })
  // })
  .strip()
  .openapi('Team')

export const teamInsertSchema = createInsertSchema(teams, {
  slug: (schema) =>
    schema.refine((slug) => validators.team(slug), {
      message: 'Invalid team slug'
    })
})
  .omit({ id: true, createdAt: true, updatedAt: true, ownerId: true })
  .strict()

export const teamUpdateSchema = createUpdateSchema(teams, {
  ownerId: userIdSchema
})
  .pick({
    name: true,
    ownerId: true
  })
  .strict()
