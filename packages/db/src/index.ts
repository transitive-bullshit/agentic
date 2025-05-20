import type postgres from 'postgres'

export { drizzle } from '@fisch0920/drizzle-orm/postgres-js'

export type PostgresClient = ReturnType<typeof postgres>

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
export { default as postgres } from 'postgres'
