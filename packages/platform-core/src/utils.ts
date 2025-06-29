import type { z, ZodType } from 'zod'
import slugifyImpl from '@sindresorhus/slugify'

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
  statusCode?: number,
  message?: string
): asserts expr
export function assert(
  expr: unknown,
  statusCodeOrMessage?: number | string,
  message = 'Internal assertion failed'
): asserts expr {
  if (expr) {
    return
  }

  if (typeof statusCodeOrMessage === 'number') {
    const error = new HttpError({ statusCode: statusCodeOrMessage, message })
    Error.captureStackTrace(error, assert)
    throw error
  } else {
    const error = new Error(statusCodeOrMessage ?? message)
    Error.captureStackTrace(error, assert)
    throw error
  }
}

/**
 * Parses the given input against the given Zod schema, throwing a
 * `ZodValidationError` if the input is invalid.
 */
export function parseZodSchema<TSchema extends ZodType<any, any, any>>(
  schema: TSchema,
  input: unknown,
  {
    error,
    statusCode = 500
  }: {
    error?: string
    statusCode?: number
  } = {}
): z.infer<TSchema> {
  try {
    return schema.parse(input)
  } catch (err) {
    throw new ZodValidationError({
      prefix: error,
      cause: err,
      statusCode
    })
  }
}

export async function sha256(
  input: string | ArrayBuffer | ArrayBufferView = crypto.randomUUID()
) {
  let dataBuffer: ArrayBuffer | ArrayBufferView

  if (typeof input === 'string') {
    dataBuffer = new TextEncoder().encode(input)
  } else {
    dataBuffer = input
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map((b) => ('00' + b.toString(16)).slice(-2))
    .join('')
  return hashHex
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
    | object = {},
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

export function pruneUndefined<T extends Record<string, any>>(
  obj: T
): NonNullable<{ [K in keyof T]: Exclude<T[K], undefined> }> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as NonNullable<T>
}

export function pruneNullOrUndefined<T extends Record<string, any>>(
  obj: T
): NonNullable<{ [K in keyof T]: Exclude<T[K], undefined | null> }> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null
    )
  ) as NonNullable<T>
}

export function pruneNullOrUndefinedDeep<T extends Record<string, any>>(
  obj: T
): NonNullable<{ [K in keyof T]: Exclude<T[K], undefined | null> }> {
  if (!obj || Array.isArray(obj) || typeof obj !== 'object') return obj

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) =>
        Array.isArray(value)
          ? [
              key,
              value
                .filter((v) => v !== undefined && v !== null)
                .map(pruneNullOrUndefinedDeep as any)
            ]
          : typeof value === 'object'
            ? [key, pruneNullOrUndefinedDeep(value)]
            : [key, value]
      )
  ) as NonNullable<T>
}

export function pruneEmpty<T extends Record<string, any>>(
  obj: T
): NonNullable<{ [K in keyof T]: Exclude<T[K], undefined | null> }> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && !value) return false
      if (Array.isArray(value) && !value.length) return false
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !Object.keys(value).length
      ) {
        return false
      }

      return true
    })
  ) as NonNullable<T>
}

export function pruneEmptyDeep<T>(
  value?: T
):
  | undefined
  | (T extends Record<string, any>
      ? { [K in keyof T]: Exclude<T[K], undefined | null> }
      : T extends Array<infer U>
        ? Array<Exclude<U, undefined | null>>
        : Exclude<T, null>) {
  if (value === undefined || value === null) return undefined

  if (typeof value === 'string') {
    if (!value) return undefined

    return value as any
  }

  if (Array.isArray(value)) {
    if (!value.length) return undefined

    value = value
      .map((v) => pruneEmptyDeep(v))
      .filter((v) => v !== undefined) as any

    if (!value || !Array.isArray(value) || !value.length) return undefined
    return value as any
  }

  if (typeof value === 'object') {
    if (!Object.keys(value).length) return undefined

    value = Object.fromEntries(
      Object.entries(value)
        .map(([k, v]) => [k, pruneEmptyDeep(v)])
        .filter(([, v]) => v !== undefined)
    )

    if (!value || !Object.keys(value).length) return undefined
    return value as any
  }

  return value as any
}

/**
 * Slugifies a string.
 *
 * - converts to lowercase
 * - decamelizes (fooBar -> foo-bar)
 * - replaces non-latin characters with latin equivalents (transliteration)
 * - replaces spaces with hyphens
 * - removes trailing hyphens
 * - removes leading hyphens
 * - removes multiple consecutive hyphens
 * - removes multiple consecutive spaces
 *
 * @see https://github.com/sindresorhus/slugify
 */
export function slugify(input: string): string {
  return slugifyImpl(input)
}
