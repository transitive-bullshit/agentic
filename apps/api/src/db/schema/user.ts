import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

import { sha256 } from '@/lib/utils'

import type { AuthProviders } from './types'
import { teams } from './team'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  id,
  timestamps,
  userRoleEnum
} from './utils'

export const users = pgTable(
  'users',
  {
    id,
    ...timestamps,

    username: text().notNull().unique(),
    role: userRoleEnum().default('user').notNull(),

    email: text().unique(),
    password: text(),

    // metadata
    firstName: text(),
    lastName: text(),
    image: text(),

    emailConfirmed: boolean().default(false),
    emailConfirmedAt: timestamp(),
    emailConfirmToken: text().unique().default(sha256()),
    passwordResetToken: text().unique(),

    isStripeConnectEnabledByDefault: boolean().default(true),

    // third-party auth providers
    providers: jsonb().$type<AuthProviders>().default({}),

    stripeCustomerId: text()
  },
  (table) => [
    uniqueIndex('user_email_idx').on(table.email),
    uniqueIndex('user_username_idx').on(table.username),
    uniqueIndex('user_emailConfirmToken_idx').on(table.emailConfirmToken),
    uniqueIndex('user_passwordResetToken_idx').on(table.passwordResetToken),
    index('user_createdAt_idx').on(table.createdAt),
    index('user_updatedAt_idx').on(table.updatedAt)
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  teamsOwned: many(teams)

  // TODO: team memberships
}))

export type User = typeof users.$inferSelect

export const userInsertSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  image: true
})

export const userSelectSchema = createSelectSchema(users)
export const userUpdateSchema = createUpdateSchema(users)
