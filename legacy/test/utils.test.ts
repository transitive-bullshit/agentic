import test from 'ava'

import {
  chunkString,
  defaultIDGeneratorFn,
  extractJSONArrayFromString,
  extractJSONObjectFromString,
  isValidTaskIdentifier,
  sleep
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
