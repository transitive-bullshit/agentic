import test from 'ava'

import {
  chunkString,
  defaultIDGeneratorFn,
  extractJSONArrayFromString,
  extractJSONObjectFromString,
  isValidTaskIdentifier,
  sleep,
  stringifyForModel
} from '@/utils'

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

test('extractJSONObjectFromString should extract JSON object from string', (t) => {
  const jsonString = 'Some text {"name":"John Doe"} more text'
  const result = extractJSONObjectFromString(jsonString)
  t.is(result, '{"name":"John Doe"}')
})

test('extractJSONArrayFromString should extract JSON array from string', (t) => {
  const jsonString = 'Some text [1,2,3] more text'
  const result = extractJSONArrayFromString(jsonString)
  t.is(result, '[1,2,3]')
})

test('extractJSONObjectFromString should return undefined if no JSON object is found', (t) => {
  const jsonString = 'Some text'
  const result = extractJSONObjectFromString(jsonString)
  t.is(result, undefined)
})

test('extractJSONArrayFromString should return undefined if no JSON array is found', (t) => {
  const jsonString = 'Some text'
  const result = extractJSONArrayFromString(jsonString)
  t.is(result, undefined)
})

test('sleep should delay execution', async (t) => {
  const start = Date.now()
  await sleep(1000) // for example, 1000ms / 1sec
  const end = Date.now()
  t.true(end - start >= 1000)
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
    'Hello, this',
    'is a test',
    'string for',
    'chunkString',
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
