import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  primaryKey
} from '@fisch0920/drizzle-orm/pg-core'

import { teams } from './team'
import { users } from './user'
import {
  createSelectSchema,
  cuid,
  teamMemberRoleEnum,
  timestamp,
  timestamps
} from './utils'

export const teamMembers = pgTable(
  'team_members',
  {
    ...timestamps,

    userId: cuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    teamId: cuid()
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    role: teamMemberRoleEnum().default('user').notNull(),

    confirmed: boolean().default(false).notNull(),
    confirmedAt: timestamp()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.teamId] }),
    index('team_member_user_idx').on(table.userId),
    index('team_member_team_idx').on(table.teamId),
    index('team_member_createdAt_idx').on(table.createdAt),
    index('team_member_updatedAt_idx').on(table.updatedAt)
  ]
)

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id]
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id]
  })
}))

export const teamMemberSelectSchema =
  createSelectSchema(teamMembers).openapi('TeamMember')
