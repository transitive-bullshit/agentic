import decircular from 'decircular'
import isObject from 'is-obj'
import sortKeys from 'sort-keys'

import { sha256 } from './utils'

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
