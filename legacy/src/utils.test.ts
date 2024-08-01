import ky from 'ky'
import pThrottle from 'p-throttle'
import { describe, expect, test } from 'vitest'

import { mockKyInstance } from './_utils'
import {
  omit,
  pick,
  pruneEmpty,
  pruneEmptyDeep,
  sanitizeSearchParams,
  stringifyForModel,
  throttleKy
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

test('sanitizeSearchParams', () => {
  expect(
    sanitizeSearchParams({ a: 1, b: undefined, c: 13 }).toString()
  ).toMatchSnapshot()

  expect(sanitizeSearchParams({ a: [1, 2, 3] }).toString()).toMatchSnapshot()

  expect(
    sanitizeSearchParams({ b: ['a', 'b'], foo: true }).toString()
  ).toMatchSnapshot()

  expect(
    sanitizeSearchParams({ b: [false, true, false] }).toString()
  ).toMatchSnapshot()

  expect(
    sanitizeSearchParams({
      flag: ['foo', 'bar', 'baz'],
      token: 'test'
    }).toString()
  ).toMatchSnapshot()

  expect(sanitizeSearchParams({}).toString()).toMatchSnapshot()

  expect(sanitizeSearchParams({ a: [] }).toString()).toMatchSnapshot()
})

describe('stringifyForModel', () => {
  test('handles basic objects', () => {
    const input = {
      foo: 'bar',
      nala: ['is', 'cute'],
      kittens: null,
      cats: undefined,
      paws: 4.3
    }
    const result = stringifyForModel(input)
    expect(result).toEqual(JSON.stringify(input, null))
  })

  test('handles empty input', () => {
    const result = stringifyForModel()
    expect(result).toEqual('')
  })
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

test(
  'throttleKy should rate-limit requests to ky properly',
  async () => {
    const interval = 1000
    const throttle = pThrottle({
      limit: 1,
      interval,
      strict: true
    })

    const ky2 = mockKyInstance(throttleKy(ky, throttle))

    const url = 'https://httpbin.org/get'

    for (let i = 0; i < 10; i++) {
      const before = Date.now()
      const res = await ky2.get(url)
      const after = Date.now()

      const duration = after - before
      // console.log(duration, res.status)
      expect(res.status).toBe(200)

      // leave a bit of wiggle room for the interval
      if (i > 0) {
        expect(duration >= interval - interval / 5).toBeTruthy()
      }
    }
  },
  {
    timeout: 60_000
  }
)
