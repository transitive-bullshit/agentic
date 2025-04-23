import { drizzle, type NodePgClient } from 'drizzle-orm/node-postgres'
import postgres from 'postgres'

import { env } from '@/lib/env'

import * as schema from './schema'

let _postgresClient: NodePgClient | undefined
const postgresClient =
  _postgresClient ?? (_postgresClient = postgres(env.DATABASE_URL))

export const db = drizzle({ client: postgresClient, schema })

export * as schema from './schema'
export type * from './types'
