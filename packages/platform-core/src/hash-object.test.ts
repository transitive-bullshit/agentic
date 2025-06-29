import { describe, expect, test } from 'vitest'

import { hashObject } from './hash-object'

describe('hashObject', () => {
  test('basic', async () => {
    await expect(hashObject({ unicorn: 'rainbow' })).resolves.toBe(
      '0bdeed89f3fbb21d7c4fa488992470030e98387c4ad3f4e18cebb70d7dac59dd'
    )

    await expect(hashObject({ a: 0, b: { a: 0, b: 0 } })).resolves.toBe(
      await hashObject({ b: { b: 0, a: 0 }, a: 0 })
    )

    await expect(hashObject({ a: 'b' })).resolves.not.toBe(
      await hashObject({ a: 'c' })
    )
  })

  test('handles circular references', async () => {
    const object = {
      a: {
        b: {}
      }
    }

    object.a.b = object // Create a circular reference.

    await expect(hashObject(object)).resolves.toBe(
      'fe15b32f1f303e18ac292a995c18e0560c1031d0a7a5999a1c5cacea06cead87'
    )
  })
})
