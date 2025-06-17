import { jsonb, pgTable, text, timestamp } from '@fisch0920/drizzle-orm/pg-core'

import { timestamps } from './common'

// Simple key-value store of JSON data for OpenAuth-related state.
// TODO: remove this and/or replace this with non-openauth version
export const authData = pgTable('auth_data', {
  // Example ID keys:
  // "oauth:refresh\u001fuser:f99d3004946f9abb\u001f2cae301e-3fdc-40c4-8cda-83b25a616d06"
  // "signing:key\u001ff001a516-838d-4c88-aa9e-719d8fc9d5a3"
  // "email\u001ft@t.com\u001fpassword"
  // "encryption:key\u001f14d3c324-f9c7-4867-81a9-b0b77b0db0be"
  id: text().primaryKey(),
  ...timestamps,

  value: jsonb().$type<Record<string, any>>().notNull(),
  expiry: timestamp()
})
