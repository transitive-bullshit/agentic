import { createHash, randomUUID } from 'node:crypto'

import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ZodSchema, ZodTypeDef } from 'zod'
import hashObjectImpl, { type Options as HashObjectOptions } from 'hash-object'

import { HttpError, ZodValidationError } from './errors'

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
