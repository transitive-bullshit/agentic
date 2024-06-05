import type { Jsonifiable } from 'type-fest'
import dedent from 'dedent'
import hashObjectImpl, { type Options as HashObjectOptions } from 'hash-object'

import type * as types from './types.js'

export { assert } from './assert.js'
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
  T extends Record<any, unknown> | object,
  K extends keyof T = keyof T
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
  T extends Record<any, unknown> | object,
  K extends keyof T = keyof T
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
  searchParams: Record<
    string,
    string | number | boolean | string[] | number[] | boolean[] | undefined
  >
): URLSearchParams {
  return new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) => {
      if (key === undefined || value === undefined) {
        return []
      }

      if (Array.isArray(value)) {
        return value.map((v) => [key, String(v)])
      }

      return [[key, String(value)]]
    })
  )
}

/**
 * Stringifies a JSON value in a way that's optimized for use with LLM prompts.
 */
export function stringifyForModel(jsonObject?: Jsonifiable): string {
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

export function hashObject(
  object: Record<string, any>,
  options?: HashObjectOptions
): string {
  return hashObjectImpl(object, { algorithm: 'sha256', ...options })
}
