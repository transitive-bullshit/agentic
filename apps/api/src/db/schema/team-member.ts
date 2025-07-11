import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  primaryKey
} from '@fisch0920/drizzle-orm/pg-core'

import { userIdSchema } from '../schemas'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  teamId,
  teamMemberRoleEnum,
  teamSlug,
  timestamp,
  timestamps,
  userId
} from './common'
import { teams } from './team'
import { users } from './user'

export const teamMembers = pgTable(
  'team_members',
  {
    ...timestamps,

    userId: userId()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    teamSlug: teamSlug()
      .notNull()
      .references(() => teams.slug, { onDelete: 'cascade' }),
    teamId: teamId()
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
    index('team_member_slug_idx').on(table.teamSlug),
    index('team_member_createdAt_idx').on(table.createdAt),
    index('team_member_updatedAt_idx').on(table.updatedAt),
    index('team_member_deletedAt_idx').on(table.deletedAt)
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

export const teamMemberSelectSchema = createSelectSchema(teamMembers)
  // .extend({
  //   user: z
  //     .lazy(() => userSelectSchema)
  //     .optional()
  //     .openapi('User', { type: 'object' }),

  //   team: z
  //     .lazy(() => teamSelectSchema)
  //     .optional()
  //     .openapi('Team', { type: 'object' })
  // })
  .strip()
  .openapi('TeamMember')

export const teamMemberInsertSchema = createInsertSchema(teamMembers, {
  userId: userIdSchema
})
  .pick({
    userId: true,
    role: true
  })
  .strict()

export const teamMemberUpdateSchema = createUpdateSchema(teamMembers)
  .pick({
    role: true
  })
  .strict()
