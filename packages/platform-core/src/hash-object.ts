import type { LiteralUnion } from 'type-fest'
import decircular from 'decircular'
import isObject from 'is-obj'
import sortKeys from 'sort-keys'

import { sha256 } from './utils'

export type Algorithm = LiteralUnion<
  'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  string
>

export type HashObjectOptions = {
  /** @default 'SHA-256' */
  readonly algorithm?: Algorithm
}

function normalizeObject(object: any): any {
  if (typeof object === 'string') {
    return object.normalize('NFD')
  }

  if (Array.isArray(object)) {
    return object.map((element) => normalizeObject(element))
  }

  if (isObject(object)) {
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [
        key.normalize('NFD'),
        normalizeObject(value)
      ])
    )
  }

  return object
}

/**
 * Returns a stable, deterministic hash of the given object, defaulting to
 * using `sha256` as the hashing algorithm and `hex` as the encoding.
 */
export async function hashObject(object: Record<string, any>): Promise<string> {
  if (!isObject(object)) {
    throw new TypeError('Expected an object')
  }

  const normalizedObject = normalizeObject(decircular(object))
  const input = JSON.stringify(sortKeys(normalizedObject, { deep: true }))

  return sha256(input)
}
