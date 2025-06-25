import { drizzle as neonPostgresDrizzle } from '@fisch0920/drizzle-orm/neon-http'
import { drizzle as postgresDrizzle } from '@fisch0920/drizzle-orm/postgres-js'
import { neon } from '@neondatabase/serverless'
import postgres from 'postgres'

import { env } from '@/lib/env'

import * as schema from './schema'

type PostgresClient = ReturnType<typeof postgres> | ReturnType<typeof neon>

// TODO: consider using neon for both dev and prod; it would be simpler, but
// we'd lose the ability to connect to a 100% local postgres database which is
// nice for flights. could also consider just using `postgres-js` for both, but
// would need to find a different prod db hosting provider.
let _postgresClient: PostgresClient | undefined
const postgresClient =
  _postgresClient ??
  (_postgresClient = env.isDev
    ? postgres(env.DATABASE_URL)
    : neon(env.DATABASE_URL))

export const db = env.isDev
  ? postgresDrizzle({
      client: postgresClient as ReturnType<typeof postgres>,
      schema
    })
  : neonPostgresDrizzle({
      client: postgresClient as ReturnType<typeof neon>,
      schema
    })

export * as schema from './schema'
export {
  createIdForModel,
  idMaxLength,
  idPrefixMap,
  type ModelType
} from './schema/common'
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
