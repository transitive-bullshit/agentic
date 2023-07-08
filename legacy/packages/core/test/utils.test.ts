import test from 'ava'
import ky from 'ky'
import pThrottle from 'p-throttle'

import {
  chunkString,
  defaultIDGeneratorFn,
  extractFunctionIdentifierFromString,
  isValidTaskIdentifier,
  sleep,
  stringifyForModel,
  throttleKy
} from '@/utils'

import { mockKyInstance } from './_utils'

test('isValidTaskIdentifier - valid', async (t) => {
  t.true(isValidTaskIdentifier('foo'))
  t.true(isValidTaskIdentifier('foo_bar_179'))
  t.true(isValidTaskIdentifier('fooBarBAZ'))
  t.true(isValidTaskIdentifier('foo-bar-baz_'))
  t.true(isValidTaskIdentifier('_'))
  t.true(isValidTaskIdentifier('_foo___'))
})

test('isValidTaskIdentifier - invalid', async (t) => {
  t.false(isValidTaskIdentifier(null as any))
  t.false(isValidTaskIdentifier(''))
  t.false(isValidTaskIdentifier('-'))
  t.false(isValidTaskIdentifier('x'.repeat(65)))
  t.false(isValidTaskIdentifier('-foo'))
})

test('sleep should delay execution', async (t) => {
  const start = Date.now()
  await sleep(1000) // for example, 1000ms / 1sec
  const end = Date.now()

  // NOTE (travis): I was seeing sporadic failures on CI here, so I added a 10ms buffer
  const duration = end - start
  t.true(duration >= 1000 - 10)
})

test('defaultIDGeneratorFn should generate URL-safe string', (t) => {
  const result = defaultIDGeneratorFn()

  // Check if generated string matches URL-safe characters:
  t.regex(result, /^[A-Za-z0-9\-_]+$/)
})

test('chunkString should split string into chunks', (t) => {
  const text = 'Hello, this is a test string for chunkString function.'
  const chunks = chunkString(text, 12)
  t.deepEqual(chunks, [
    'Hello, ',
    'this is a ',
    'test ',
    'string for ',
    'chunkString ',
    'function.'
  ])
})

test('stringifyForModel should stringify JSON values correctly', (t) => {
  const input = { a: 1, b: 2 }
  const expectedOutput = '{a:1,b:2}'
  const actualOutput = stringifyForModel(input)
  t.is(actualOutput, expectedOutput)
})

test('stringifyForModel should stringify primitive values correctly', (t) => {
  const input = true
  const expectedOutput = 'true'
  const actualOutput = stringifyForModel(input)
  t.is(actualOutput, expectedOutput)

  const input2 = 1
  const expectedOutput2 = '1'
  const actualOutput2 = stringifyForModel(input2)
  t.is(actualOutput2, expectedOutput2)

  const input3 = 'foo'
  const expectedOutput3 = '"foo"'
  const actualOutput3 = stringifyForModel(input3)
  t.is(actualOutput3, expectedOutput3)
})

test('stringifyForModel should stringify nested objects correctly', (t) => {
  const input = { a: 1, b: { c: 3, d: 4 } }
  const expectedOutput = '{a:1,b:{c:3,d:4}}'
  const actualOutput = stringifyForModel(input)

  t.is(actualOutput, expectedOutput)
})

test('stringifyForModel should stringify arrays correctly', (t) => {
  const input = { a: 'Hello World!', b: [2, 3] }
  const expectedOutput = '{a:"Hello World!",b:[2,3]}'
  const actualOutput = stringifyForModel(input)

  t.is(actualOutput, expectedOutput)
})

test('stringifyForModel should stringify objects with null values correctly', (t) => {
  const input = { a: 'baz', b: null }
  const expectedOutput = '{a:"baz",b:null}'
  const actualOutput = stringifyForModel(input)

  t.is(actualOutput, expectedOutput)
})

test('extractFunctionIdentifierFromString valid', (t) => {
  t.is(extractFunctionIdentifierFromString('foo'), 'foo')
  t.is(extractFunctionIdentifierFromString('fooBar_BAZ'), 'fooBar_BAZ')
  t.is(extractFunctionIdentifierFromString('functions.fooBar'), 'fooBar')
  t.is(
    extractFunctionIdentifierFromString('function fooBar1234_'),
    'fooBar1234_'
  )
})

test('extractFunctionIdentifierFromString invalid', (t) => {
  t.is(extractFunctionIdentifierFromString(''), undefined)
  t.is(extractFunctionIdentifierFromString('  '), undefined)
  t.is(extractFunctionIdentifierFromString('.-'), undefined)
})

test('throttleKy should rate-limit requests to ky properly', async (t) => {
  t.timeout(30_1000)

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
    t.is(res.status, 200)

    // leave a bit of wiggle room for the interval
    if (i > 0) {
      t.true(duration >= interval - interval / 5)
    }
  }
})
