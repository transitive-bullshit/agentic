import { relations } from '@fisch0920/drizzle-orm'
import { index, pgTable, text, timestamp } from '@fisch0920/drizzle-orm/pg-core'

import { userIdSchema } from '../schemas'
import {
  accountPrimaryId,
  authProviderTypeEnum,
  createSelectSchema,
  timestamps,
  userId
} from './common'
import { users } from './user'

export const accounts = pgTable(
  'accounts',
  {
    ...accountPrimaryId,
    ...timestamps,

    userId: userId()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: authProviderTypeEnum().notNull(),

    /** Provider-specific account ID (or email in the case of `password` provider) */
    accountId: text().notNull(),

    /** Provider-specific username */
    accountUsername: text(),

    /** Standard OAuth2 access token */
    accessToken: text(),

    /** Standard OAuth2 refresh token */
    refreshToken: text(),

    /** Standard OAuth2 access token expires at */
    accessTokenExpiresAt: timestamp(),

    /** Standard OAuth2 refresh token expires at */
    refreshTokenExpiresAt: timestamp(),

    /** OAuth scope(s) */
    scope: text()
  },
  (table) => [
    index('account_provider_idx').on(table.provider),
    index('account_userId_idx').on(table.userId),
    index('account_createdAt_idx').on(table.createdAt),
    index('account_updatedAt_idx').on(table.updatedAt),
    index('account_deletedAt_idx').on(table.deletedAt)
  ]
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}))

export const accountSelectSchema = createSelectSchema(accounts, {
  userId: userIdSchema
})
  .omit({
    accessToken: true,
    refreshToken: true,
    accessTokenExpiresAt: true,
    refreshTokenExpiresAt: true
  })
  .strip()
  .openapi('Account')
