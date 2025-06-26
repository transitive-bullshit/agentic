import { expect, test } from 'vitest'

import {
  omit,
  pick,
  pruneEmpty,
  pruneEmptyDeep,
  sha256,
  slugify
} from './utils'

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

test('pruneEmpty', () => {
  expect(
    pruneEmpty({
      a: 1,
      b: { foo: true },
      c: [true],
      d: 'foo',
      e: null,
      f: undefined
    })
  ).toEqual({
    a: 1,
    b: { foo: true },
    c: [true],
    d: 'foo'
  })

  expect(pruneEmpty({ a: 0, b: {}, c: [], d: '' })).toEqual({
    a: 0
  })
  expect(pruneEmpty({ b: {}, c: [], d: '' })).toEqual({})

  expect(
    pruneEmpty({
      a: null,
      b: { foo: [{}], bar: [null, undefined, ''] },
      c: ['', '', ''],
      d: '',
      e: undefined,
      f: [],
      g: {}
    })
  ).toEqual({
    b: { foo: [{}], bar: [null, undefined, ''] },
    c: ['', '', '']
  })
})

test('pruneEmptyDeep', () => {
  expect(
    pruneEmptyDeep({ a: 1, b: { foo: true }, c: [true], d: 'foo' })
  ).toEqual({
    a: 1,
    b: { foo: true },
    c: [true],
    d: 'foo'
  })

  expect(pruneEmptyDeep({ a: 0, b: {}, c: [], d: '' })).toEqual({
    a: 0
  })

  expect(
    pruneEmptyDeep({
      a: null,
      b: { foo: [{}], bar: [null, undefined, ''] },
      c: ['', '', ''],
      d: '',
      e: undefined
    })
  ).toEqual(undefined)
})

test('slugify', () => {
  expect(slugify('Foo Bar')).toBe('foo-bar')
  expect(slugify('FooBar')).toBe('foo-bar')
  expect(slugify('FooBarBaz')).toBe('foo-bar-baz')
  expect(slugify('FooBarBazQux')).toBe('foo-bar-baz-qux')
  expect(slugify('FooBarBazQuxQuux')).toBe('foo-bar-baz-qux-quux')
  expect(slugify('foo-bar')).toBe('foo-bar')
  expect(slugify('--foo BAR --')).toBe('foo-bar')
  expect(slugify('я люблю единорогов')).toBe('ya-lyublyu-edinorogov')
  expect(slugify('fooBar 123 $#%')).toBe('foo-bar-123')
  expect(slugify('  Déjà Vu!  ')).toBe('deja-vu')
  expect(slugify('I ♥ Dogs')).toBe('i-love-dogs')
  expect(slugify('')).toBe('')
  expect(slugify('    ')).toBe('')
  expect(slugify('-')).toBe('')
  expect(slugify('--')).toBe('')
  expect(slugify('- -')).toBe('')
})
