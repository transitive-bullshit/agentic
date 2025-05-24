import { createHash, randomUUID } from 'node:crypto'

import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ZodSchema, ZodTypeDef } from 'zod'
import hashObjectImpl, { type Options as HashObjectOptions } from 'hash-object'

import { HttpError, ZodValidationError } from './errors'

export { default as parseJson } from 'parse-json'

/**
 * From `inputObj`, create a new object that does not include `keys`.
 *
 * @example
 * ```js
 * omit({ a: 1, b: 2, c: 3 }, 'a', 'c') // { b: 2 }
 * ```
 */
export const omit = <
  T extends Record<string, unknown> | object,
  K extends keyof any
>(
  inputObj: T,
  ...keys: K[]
): Omit<T, K> => {
  const keysSet = new Set(keys)
  return Object.fromEntries(
    Object.entries(inputObj).filter(([k]) => !keysSet.has(k as any))
  ) as any
}

/**
 * From `inputObj`, create a new object that only includes `keys`.
 *
 * @example
 * ```js
 * pick({ a: 1, b: 2, c: 3 }, 'a', 'c') // { a: 1, c: 3 }
 * ```
 */
export const pick = <
  T extends Record<string, unknown> | object,
  K extends keyof T
>(
  inputObj: T,
  ...keys: K[]
): Pick<T, K> => {
  const keysSet = new Set(keys)
  return Object.fromEntries(
    Object.entries(inputObj).filter(([k]) => keysSet.has(k as any))
  ) as any
}

export function assert(expr: unknown, message?: string): asserts expr
export function assert(
  expr: unknown,
  statusCode?: ContentfulStatusCode,
  message?: string
): asserts expr
export function assert(
  expr: unknown,
  statusCodeOrMessage?: ContentfulStatusCode | string,
  message = 'Internal assertion failed'
): asserts expr {
  if (expr) {
    return
  }

  if (typeof statusCodeOrMessage === 'number') {
    throw new HttpError({ statusCode: statusCodeOrMessage, message })
  } else {
    throw new Error(statusCodeOrMessage ?? message)
  }
}

/**
 * Parses the given input against the given Zod schema, throwing a
 * `ZodValidationError` if the input is invalid.
 */
export function parseZodSchema<
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
>(
  schema: ZodSchema<Output, Def, Input>,
  input: unknown,
  {
    error
  }: {
    error?: string
  } = {}
): Output {
  try {
    return schema.parse(input)
  } catch (err) {
    throw new ZodValidationError({
      prefix: error,
      cause: err
    })
  }
}

export function sha256(input: string = randomUUID()) {
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Returns a stable, deterministic hash of the given object, defaulting to
 * using `sha256` as the hashing algorithm and `hex` as the encoding.
 */
export function hashObject(
  object: Record<string, any>,
  options?: HashObjectOptions
): string {
  return hashObjectImpl(object, {
    algorithm: 'sha256',
    encoding: 'hex',
    ...options
  })
}

export function getEnv(name: string): string | undefined {
  try {
    return typeof process !== 'undefined'
      ? // eslint-disable-next-line no-process-env
        process.env?.[name]
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Creates a new `URLSearchParams` object with all values coerced to strings
 * that correctly handles arrays of values as repeated keys (or CSV) and
 * correctly removes `undefined` keys and values.
 */
export function sanitizeSearchParams(
  searchParams:
    | Record<
        string,
        string | number | boolean | string[] | number[] | boolean[] | undefined
      >
    | object,
  {
    csv = false
  }: {
    /**
     * Whether to use comma-separated-values for arrays or multiple entries.
     *
     * Defaults to `false` and will use multiple entries.
     */
    csv?: boolean
  } = {}
): URLSearchParams {
  const entries = Object.entries(searchParams).flatMap(([key, value]) => {
    if (key === undefined || value === undefined) {
      return []
    }

    if (Array.isArray(value)) {
      return value.map((v) => [key, String(v)])
    }

    return [[key, String(value)]]
  }) as [string, string][]

  if (!csv) {
    return new URLSearchParams(entries)
  }

  const csvEntries: Record<string, string> = {}
  for (const [key, value] of entries) {
    csvEntries[key] = csvEntries[key] ? `${csvEntries[key]},${value}` : value
  }

  return new URLSearchParams(csvEntries)
}
