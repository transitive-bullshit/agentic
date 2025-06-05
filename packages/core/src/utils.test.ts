import { expect, test } from 'vitest'

import { omit, pick, sha256 } from './utils'

test('pick', () => {
  expect(pick({ a: 1, b: 2, c: 3 }, 'a', 'c')).toEqual({ a: 1, c: 3 })
  expect(
    pick({ a: { b: 'foo' }, d: -1, foo: null } as any, 'b', 'foo')
  ).toEqual({ foo: null })
})

test('omit', () => {
  expect(omit({ a: 1, b: 2, c: 3 }, 'a', 'c')).toEqual({ b: 2 })
  expect(omit({ a: { b: 'foo' }, d: -1, foo: null }, 'b', 'foo')).toEqual({
    a: { b: 'foo' },
    d: -1
  })
  expect(omit({ a: 1, b: 2, c: 3 }, 'foo', 'bar', 'c')).toEqual({ a: 1, b: 2 })
})

test('sha256', async () => {
  // Test default behavior (random UUID)
  const hash1 = await sha256()
  const hash2 = await sha256()
  expect(hash1).toHaveLength(64) // SHA-256 produces 64 character hex string
  expect(hash2).toHaveLength(64)
  expect(hash1).not.toBe(hash2) // Different UUIDs should produce different hashes

  const hash3 = await sha256('foo')
  const hash4 = await sha256('foo')
  expect(hash3).toBe(hash4) // Same input should produce the same hash

  const hash5 = await sha256('foo1')
  expect(hash1).not.toBe(hash5)
  expect(hash2).not.toBe(hash5)
  expect(hash3).not.toBe(hash5)
  expect(hash4).not.toBe(hash5)

  expect(await sha256('test')).toMatchSnapshot()
})
