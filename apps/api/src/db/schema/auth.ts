import { pgTable, text, timestamp } from '@fisch0920/drizzle-orm/pg-core'

import {
  accountPrimaryId,
  sessionPrimaryId,
  timestamps,
  userId,
  verificationPrimaryId
} from './common'
import { users } from './user'

// These tables are all managed by better-auth.

export const sessions = pgTable('sessions', {
  ...sessionPrimaryId,
  ...timestamps,

  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: userId()
    .notNull()
    .references(() => users.id)
})

export const accounts = pgTable('accounts', {
  ...accountPrimaryId,
  ...timestamps,

  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: userId()
    .notNull()
    .references(() => users.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt').notNull(),
  password: text('password')
})

export const verifications = pgTable('verifications', {
  ...verificationPrimaryId,
  ...timestamps,

  identifier: text('identifier').notNull(),
  value: text('value').notNull(),

  expiresAt: timestamp('expiresAt').notNull()
})
