import { drizzle } from '@fisch0920/drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/lib/env'

import * as schema from './schema'

type PostgresClient = ReturnType<typeof postgres>

let _postgresClient: PostgresClient | undefined
const postgresClient =
  _postgresClient ?? (_postgresClient = postgres(env.DATABASE_URL))

export const db = drizzle({ client: postgresClient, schema })

export * as schema from './schema'
export {
  createIdForModel,
  idMaxLength,
  idPrefixMap,
  type ModelType
} from './schema/common'
export * from './schema/schemas'
export * from './schemas'
export type * from './types'
export * from './utils'
export {
  and,
  arrayContained,
  arrayContains,
  arrayOverlaps,
  asc,
  between,
  desc,
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
