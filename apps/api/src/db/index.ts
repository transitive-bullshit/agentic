import { drizzle } from '@fisch0920/drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/lib/env'

import * as schema from './schema'

let _postgresClient: ReturnType<typeof postgres> | undefined
const postgresClient =
  _postgresClient ?? (_postgresClient = postgres(env.DATABASE_URL))

export const db = drizzle({ client: postgresClient, schema })

export * as schema from './schema'
export * from './schemas'
export type * from './types'
export {
  and,
  arrayContained,
  arrayContains,
  arrayOverlaps,
  between,
  eq,
  exists,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  notBetween,
  notExists,
  notIlike,
  notInArray,
  notLike,
  or
} from '@fisch0920/drizzle-orm'
