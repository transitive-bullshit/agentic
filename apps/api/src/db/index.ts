import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/lib/env'

import * as schema from './schema'

let _postgresClient: ReturnType<typeof postgres> | undefined
const postgresClient =
  _postgresClient ?? (_postgresClient = postgres(env.DATABASE_URL))

export const db = drizzle({ client: postgresClient, schema })

export * as schema from './schema'
export type * from './types'
