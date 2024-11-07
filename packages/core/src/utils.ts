import dedent from 'dedent'

import type * as types from './types'

export { assert } from './assert'
export { default as delay } from 'delay'

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
 * Function that does nothing.
 */
export const noop = () => undefined

/**
 * Throttles HTTP requests made by a ky instance.
 *
 * Very useful for enforcing rate limits.
 */
export function throttleKy(
  ky: types.KyInstance,
  throttleFn: <Arguments extends readonly unknown[], ReturnValue>(
    function_: (...args_: Arguments) => ReturnValue
  ) => types.ThrottledFunction<(...args_: Arguments) => ReturnValue>
) {
  return ky.extend({
    hooks: {
      beforeRequest: [throttleFn(noop)]
    }
  })
}

/**
 * Creates a new `URLSearchParams` object with all values coerced to strings
 * that correctly handles arrays of values as repeated keys.
 */
export function sanitizeSearchParams(
  searchParams:
    | Record<
        string,
        string | number | boolean | string[] | number[] | boolean[] | undefined
      >
    | object,
  { csv = false }: { csv?: boolean } = {}
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

/**
 * Stringifies a JSON value in a way that's optimized for use with LLM prompts.
 */
export function stringifyForModel(
  jsonObject?: types.RelaxedJsonifiable
): string {
  if (jsonObject === undefined) {
    return ''
  }

  if (typeof jsonObject === 'string') {
    return jsonObject
  }

  return JSON.stringify(jsonObject, null, 0)
}

const dedenter = dedent.withOptions({ escapeSpecialCharacters: true })

/**
 * Clean a string by removing extra newlines and indentation.
 *
 * @see: https://github.com/dmnd/dedent
 */
export function cleanStringForModel(text: string): string {
  return dedenter(text).trim()
}

export function isAIFunction(obj: any): obj is types.AIFunction {
  if (!obj) return false
  if (typeof obj !== 'function') return false
  if (!obj.inputSchema) return false
  if (!obj.parseInput) return false
  if (!obj.spec) return false
  if (!obj.impl) return false
  if (!obj.spec.name || typeof obj.spec.name !== 'string') return false

  return true
}

export function getErrorMessage(error?: unknown): string {
  if (!error) {
    return 'unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  const message = (error as any).message
  if (message && typeof message === 'string') {
    return message
  }

  try {
    return JSON.stringify(error)
  } catch {
    return 'unknown error'
  }
}

export function getShortDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]!
}
