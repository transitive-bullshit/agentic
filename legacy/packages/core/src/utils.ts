import { customAlphabet, urlAlphabet } from 'nanoid'
import type { ThrottledFunction } from 'p-throttle'
import { JsonValue } from 'type-fest'

import * as types from './types'

/**
 * Pauses the execution of a function for a specified time.
 *
 * @param ms - number of milliseconds to pause
 * @returns promise that resolves after the specified number of milliseconds
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * A default ID generator function that uses a custom alphabet based on URL safe symbols.
 */
export const defaultIDGeneratorFn: types.IDGeneratorFunction =
  customAlphabet(urlAlphabet)

const TASK_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_-]{0,63}$/

/**
 * Checks if a string is a valid task identifier.
 *
 * @param id - identifier to check
 * @returns whether the identifier is valid
 */
export function isValidTaskIdentifier(id: string): boolean {
  return !!id && TASK_NAME_REGEX.test(id)
}

/**
 * Extracts a valid function task identifier from the input text string.
 *
 * @param text - input text string to extract the identifier from
 * @returns extracted task identifier if one is found, `undefined` otherwise
 */
export function extractFunctionIdentifierFromString(
  text: string
): string | undefined {
  text = text?.trim()

  if (!text) {
    return
  }

  if (isValidTaskIdentifier(text)) {
    return text
  }

  const splits = text
    .split(/[^a-zA-Z0-9_-]/)
    .map((s) => {
      s = s.trim()
      return isValidTaskIdentifier(s) ? s : undefined
    })
    .filter(Boolean)

  return splits[splits.length - 1]
}

/**
 * Chunks a string into an array of chunks.
 *
 * @param text - string to chunk
 * @param maxLength - maximum length of each chunk
 * @param separator - character to split on (will be included in each previous chunk)
 * @returns array of chunks
 */
export function chunkString(
  text: string,
  maxLength: number,
  separator = ' '
): string[] {
  const segments = text.split(new RegExp(`(?<=${separator})`))
  const chunks: string[] = []
  let chunk = ''

  for (const segment of segments) {
    if (segment.length > maxLength) {
      if (chunk) {
        chunks.push(chunk)
        chunk = ''
      }

      let start = 0
      while (start < segment.length) {
        const end =
          start + maxLength < segment.length
            ? start + maxLength
            : segment.length
        chunks.push(segment.substring(start, end))
        start = end
      }
    } else if ((chunk && chunk + separator + segment).length > maxLength) {
      chunks.push(chunk)
      chunk = segment
    } else {
      chunk += segment
    }
  }

  if (chunk) chunks.push(chunk)

  return chunks
}

/**
 * Chunks an array of strings into an array of chunks while preserving existing sections.
 *
 * @param textSections - array of strings to chunk
 * @param maxLength - maximum length of each chunk
 * @returns array of chunks
 */
export function chunkMultipleStrings(
  textSections: string[],
  maxLength: number
): string[] {
  return textSections.map((section) => chunkString(section, maxLength)).flat()
}

export function stringifyForDebugging(
  json?: types.Jsonifiable | void,
  {
    maxLength
  }: {
    maxLength?: number
  } = {}
): string {
  if (json === undefined) {
    return ''
  }

  const out = stringifyForModel(json)

  if (maxLength) {
    return out.length > maxLength
      ? out.substring(0, Math.max(0, maxLength - 1)) + '…'
      : out
  } else {
    return out
  }
}

/**
 * Stringifies a JSON value for use in an LLM prompt.
 *
 * @param json - JSON value to stringify
 * @returns stringified value with all double quotes around object keys removed
 */
export function stringifyForModel(
  json: types.Jsonifiable | void,
  omit: string[] = []
): string {
  if (json === undefined) {
    return ''
  }

  const UNIQUE_PREFIX = defaultIDGeneratorFn()
  return (
    JSON.stringify(json, replacer)
      // Remove all double quotes around keys:
      .replace(new RegExp('"' + UNIQUE_PREFIX + '(.*?)"', 'g'), '$1')
  )

  /**
   * Replacer function prefixing all keys with a unique identifier.
   */
  function replacer(key: string, value: JsonValue) {
    if (omit.includes(key)) {
      return undefined
    }

    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value
      }

      const replacement = {}

      for (const k in value) {
        if (Object.hasOwnProperty.call(value, k) && !omit.includes(k)) {
          replacement[UNIQUE_PREFIX + k] = value[k]
        }
      }

      return replacement
    }

    return value
  }
}

/**
 * Picks keys from an object.
 *
 * @param obj - object to pick keys from
 * @param keys - keys to pick from the object
 * @returns new object with only the picked keys
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
) {
  return keys.reduce((result, key) => {
    result[key] = obj[key]
    return result
  }, {} as Pick<T, K>)
}

/**
 * Omits keys from an object.
 *
 * @param obj - object to omit keys from
 * @param keys - keys to omit from the object
 * @returns new object without the omitted keys
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
) {
  const keySet = new Set(keys)
  return Object.keys(obj).reduce((result, key) => {
    if (!keySet.has(key as K)) {
      result[key] = obj[key as keyof T]
    }

    return result
  }, {} as Omit<T, K>)
}

/**
 * Function that does nothing.
 */
const noop = () => undefined

/**
 * Throttles HTTP requests made by a ky instance. Very useful for enforcing rate limits.
 */
export function throttleKy(
  ky: types.KyInstance,
  throttleFn: <Argument extends readonly unknown[], ReturnValue>(
    function_: (...args: Argument) => ReturnValue
  ) => ThrottledFunction<Argument, ReturnValue>
) {
  return ky.extend({
    hooks: {
      beforeRequest: [throttleFn(noop)]
    }
  })
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

export function identity<T>(x: T): T {
  return x
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
