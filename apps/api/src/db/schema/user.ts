import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex
} from '@fisch0920/drizzle-orm/pg-core'

import { accounts } from './account'
import {
  createSelectSchema,
  createUpdateSchema,
  stripeId,
  timestamps,
  username,
  // username,
  userPrimaryId,
  userRoleEnum
} from './common'

export const users = pgTable(
  'users',
  {
    ...userPrimaryId,
    ...timestamps,

    username: username().unique().notNull(),
    role: userRoleEnum().default('user').notNull(),

    email: text().notNull().unique(),
    isEmailVerified: boolean().default(false).notNull(),

    name: text(),
    bio: text(),
    image: text(),

    //isStripeConnectEnabledByDefault: boolean().default(true).notNull(),

    stripeCustomerId: stripeId()
  },
  (table) => [
    uniqueIndex('user_email_idx').on(table.email),
    uniqueIndex('user_username_idx').on(table.username),
    index('user_createdAt_idx').on(table.createdAt),
    index('user_updatedAt_idx').on(table.updatedAt)
    // index('user_deletedAt_idx').on(table.deletedAt)
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts)
}))

export const userSelectSchema = createSelectSchema(users)
  .strip()
  .openapi('User')

export const userUpdateSchema = createUpdateSchema(users)
  .pick({
    name: true,
    bio: true,
    image: true
    //isStripeConnectEnabledByDefault: true
  })
  .strict()
