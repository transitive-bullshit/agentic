 
// The only place we allow `@agentic/platform-db` imports is in this directory.

import {
  drizzle,
  postgres,
  type PostgresClient,
  schema
} from '@agentic/platform-db'

import { env } from '@/lib/env'

let _postgresClient: PostgresClient | undefined
const postgresClient =
  _postgresClient ?? (_postgresClient = postgres(env.DATABASE_URL))

export const db = drizzle({ client: postgresClient, schema })

export * from '@agentic/platform-db'
