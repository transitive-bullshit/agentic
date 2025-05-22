import { pgTable, text, timestamp } from '@fisch0920/drizzle-orm/pg-core'

import {
  accountPrimaryId,
  authTimestamps,
  sessionPrimaryId,
  userId,
  verificationPrimaryId
} from './common'
import { users } from './user'

// These tables are all managed by better-auth.

export const sessions = pgTable('sessions', {
  ...sessionPrimaryId,
  ...authTimestamps,

  token: text().notNull().unique(),
  expiresAt: timestamp({ mode: 'date' }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: userId()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
})

export const accounts = pgTable('accounts', {
  ...accountPrimaryId,
  ...authTimestamps,

  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: userId()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  accessTokenExpiresAt: timestamp({ mode: 'date' }),
  refreshTokenExpiresAt: timestamp({ mode: 'date' }),
  scope: text(),
  idToken: text(),
  password: text()
})

export const verifications = pgTable('verifications', {
  ...verificationPrimaryId,
  ...authTimestamps,

  identifier: text().notNull(),
  value: text().notNull(),

  expiresAt: timestamp({ mode: 'date' }).notNull()
})
