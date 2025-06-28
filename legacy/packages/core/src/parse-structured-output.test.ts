import { assert, expect, test } from 'vitest'
import { z } from 'zod'

import {
  extractJSONFromString,
  parseArrayOutput,
  parseBooleanOutput,
  parseNumberOutput,
  parseObjectOutput,
  parseStructuredOutput
} from './parse-structured-output'

test('extractJSONFromString should extract JSON object from string', () => {
  let jsonStr = 'Some text {"name":"John Doe"} more text'
  let result = extractJSONFromString(jsonStr, 'object')
  assert.deepEqual(result[0], { name: 'John Doe' })

  jsonStr =
    'Some text {"name":"John Doe","age":42,"address":{"street":"Main Street","number":42}} more text'
  result = extractJSONFromString(jsonStr, 'object')
  assert.deepEqual(result[0], {
    name: 'John Doe',
    age: 42,
    address: { street: 'Main Street', number: 42 }
  })

  jsonStr = 'foo {"name":"John Doe","school":"St. John\'s"} bar'
  result = extractJSONFromString(jsonStr, 'object')
  assert.deepEqual(result[0], { name: 'John Doe', school: "St. John's" })
})

test('extractJSONFromString should extract an invalid JSON object from string', () => {
  let jsonStr = 'Some text {"name":\'John Doe\'} more text'
  let result = extractJSONFromString(jsonStr, 'object')
  assert.deepEqual(result[0], { name: 'John Doe' })

  jsonStr = 'Some text {"name":"John Doe","age":42,} more text'
  result = extractJSONFromString(jsonStr, 'object')
  assert.deepEqual(result[0], { name: 'John Doe', age: 42 })
})

test('extractJSONFromString should extract multiple JSON objects from string', () => {
  let jsonStr = 'Some text {"name":"John Doe"} more text {"name":"Jane Doe"}'
  let result = extractJSONFromString(jsonStr, 'object')
  assert.deepEqual(result[0], { name: 'John Doe' })
  assert.deepEqual(result[1], { name: 'Jane Doe' })

  jsonStr =
    'Some text {"name":"John Doe","age":42,"address":{"street":"Main Street","number":42}} more text {"name":"Jane Doe","age":42,"address":{"street":"Main Street","number":42}}'
  result = extractJSONFromString(jsonStr, 'object')
  assert.deepEqual(result[0], {
    name: 'John Doe',
    age: 42,
    address: { street: 'Main Street', number: 42 }
  })
  assert.deepEqual(result[1], {
    name: 'Jane Doe',
    age: 42,
    address: { street: 'Main Street', number: 42 }
  })
})

test('extractJSONFromString should extract JSON array from string', () => {
  let jsonString = 'Some text [1,2,3] more text'
  let result = extractJSONFromString(jsonString, 'array')
  assert.deepEqual(result[0], [1, 2, 3])

  jsonString = 'Some text ["foo","bar","\'quoted\'"] more text'
  result = extractJSONFromString(jsonString, 'array')
  assert.deepEqual(result[0], ['foo', 'bar', "'quoted'"])
})

test('extractJSONFromString should extract an invalid JSON array from string', () => {
  let jsonString = 'Some text [1,2,3,] more text'
  let result = extractJSONFromString(jsonString, 'array')
  assert.deepEqual(result[0], [1, 2, 3])

  jsonString = "Some text ['foo','bar'] more text"
  result = extractJSONFromString(jsonString, 'array')
  assert.deepEqual(result[0], ['foo', 'bar'])
})

test('extractJSONFromString should extract multiple JSON arrays from string', () => {
  const jsonString = 'Some text [1,2,3] more text [4,5,6]'
  const result = extractJSONFromString(jsonString, 'array')
  assert.deepEqual(result[0], [1, 2, 3])
  assert.deepEqual(result[1], [4, 5, 6])
})

test('extractJSONFromString should return an empty array if no JSON object is found', () => {
  const jsonString = 'Some text'
  const result = extractJSONFromString(jsonString, 'object')
  assert.deepEqual(result, [])
})

test('extractJSONFromString should return an empty array if no JSON array is found', () => {
  const jsonString = 'Some text'
  const result = extractJSONFromString(jsonString, 'array')
  assert.deepEqual(result, [])
})

test('parseArrayOutput - handles valid arrays correctly', () => {
  const output1 = parseArrayOutput('[1,2,3]')
  const output2 = parseArrayOutput('["a", "b", "c"]')
  const output3 = parseArrayOutput('[{"a": 1}, {"b": 2}]')

  expect(output1).toMatchSnapshot('should return [1, 2, 3] for "[1,2,3]"')
  expect(output2).toMatchSnapshot(
    'should return ["a", "b", "c"] for "["a", "b", "c"]'
  )
  expect(output3).toMatchSnapshot(
    'should return [{"a": 1}, {"b": 2}] for [{"a": 1}, {"b": 2}]'
  )
})

test('parseArrayOutput - handles arrays surrounded by text correctly', () => {
  const output1 = parseArrayOutput('The array is [1,2,3]')
  const output2 = parseArrayOutput('Array: ["a", "b", "c"]. That\'s all!')
  const output3 = parseArrayOutput(
    'This is the array [{"a": 1}, {"b": 2}] in the text'
  )

  expect(output1).toMatchSnapshot(
    'should return [1, 2, 3] for "The array is [1,2,3]"'
  )
  expect(output2).toMatchSnapshot(
    'should return ["a", "b", "c"] for "Array: ["a", "b", "c"]. That\'s all!"'
  )
  expect(output3).toMatchSnapshot(
    'should return [{"a": 1}, {"b": 2}] for "This is the array [{"a": 1}, {"b": 2}] in the text"'
  )
})

test('parseArrayOutput - throws error for invalid arrays', () => {
  assert.throws(() => {
    parseArrayOutput('not a valid array')
  })
})

test('parseObjectOutput - handles valid objects correctly', () => {
  const output1 = parseObjectOutput('{"a":1,"b":2,"c":3}')
  const output2 = parseObjectOutput(
    '{"name":"John","age":30,"city":"New York"}'
  )

  expect(output1).toMatchSnapshot(
    'should return {"a":1,"b":2,"c":3} for {"a":1,"b":2,"c":3}'
  )
  expect(output2).toMatchSnapshot(
    'should return {"name":"John","age":30,"city":"New York"} for {"name":"John","age":30,"city":"New York"}'
  )
})

test('parseObjectOutput - handles objects surrounded by text correctly', () => {
  const output1 = parseObjectOutput('The object is {"a":1,"b":2,"c":3}')
  const output2 = parseObjectOutput(
    'Object: {"name":"John","age":30,"city":"New York"}. That\'s all!'
  )

  expect(output1).toMatchSnapshot(
    'should return {"a":1,"b":2,"c":3} for "The object is {"a":1,"b":2,"c":3}"'
  )
  expect(output2).toMatchSnapshot(
    'should return {"name":"John","age":30,"city":"New York"} for "Object: {"name":"John","age":30,"city":"New York"}. That\'s all!"'
  )
})

test('parseObjectOutput - handles JSON array of objects', () => {
  const output = parseObjectOutput('[{"a":1,"b":2},{"c":3,"d":4}]')

  expect(output).toMatchSnapshot(
    'should return first object {"a":1,"b":2} for [{"a":1,"b":2},{"c":3,"d":4}]'
  )
})

test('parseObjectOutput - throws error for invalid objects', () => {
  assert.throws(() => {
    parseObjectOutput('not a valid object')
  })
})

test('parseBooleanOutput - handles `true` outputs correctly', () => {
  const output1 = parseBooleanOutput('True')
  const output2 = parseBooleanOutput('TRUE')
  const output3 = parseBooleanOutput('true.')

  expect(output1).toMatchSnapshot('should return true for "True"')
  expect(output2).toMatchSnapshot('should return true for "TRUE"')
  expect(output3).toMatchSnapshot('should return true for "true."')
})

test('parseBooleanOutput - handles `false` outputs correctly', () => {
  const output1 = parseBooleanOutput('False')
  const output2 = parseBooleanOutput('FALSE')
  const output3 = parseBooleanOutput('false!')

  expect(output1).toMatchSnapshot('should return false for "False"')
  expect(output2).toMatchSnapshot('should return false for "FALSE"')
  expect(output3).toMatchSnapshot('should return false for "false!"')
})

test('parseBooleanOutput - throws error for invalid outputs', () => {
  assert.throws(() => {
    parseBooleanOutput('NotBooleanValue')
  })
})

test('parseNumberOutput - handles integer outputs correctly', () => {
  const output1 = parseNumberOutput('42', z.number().int())
  const output2 = parseNumberOutput('  -5 ', z.number().int())

  expect(output1).toMatchSnapshot('should return 42 for "42"')
  expect(output2).toMatchSnapshot('should return -5 for "  -5 "')
})

test('parseNumberOutput - handles float outputs correctly', () => {
  const output1 = parseNumberOutput('42.42', z.number())
  const output2 = parseNumberOutput('   -5.5 ', z.number())

  expect(output1).toMatchSnapshot('should return 42.42 for "42.42"')
  expect(output2).toMatchSnapshot('should return -5.5 for "   -5.5 "')
})

test('parseNumberOutput - throws error for invalid outputs', () => {
  assert.throws(() => {
    parseNumberOutput('NotANumber', z.number())
  })
})

test('parseStructuredOutput - handles arrays correctly', () => {
  const arraySchema = z.array(z.number())
  const output = '[1, 2, 3]'
  const result = parseStructuredOutput(output, arraySchema)

  expect(result).toMatchSnapshot(
    'should parse and return [1, 2, 3] for "[1, 2, 3]"'
  )
})

test('parseStructuredOutput - handles objects correctly', () => {
  const objectSchema = z.object({ a: z.number(), b: z.string() })
  const output = '{"a": 1, "b": "two"}'
  const result = parseStructuredOutput(output, objectSchema)

  expect(result).toMatchSnapshot(
    'should parse and return {"a": 1, "b": "two"} for "{"a": 1, "b": "two"}"'
  )
})

test('parseStructuredOutput - handles booleans correctly', () => {
  const booleanSchema = z.boolean()
  const output = 'True'
  const result = parseStructuredOutput(output, booleanSchema)

  expect(result).toMatchSnapshot('should parse and return true for "True"')
})

test('parseStructuredOutput - handles numbers correctly', () => {
  const numberSchema = z.number()
  const output = '123.45'
  const result = parseStructuredOutput(output, numberSchema)

  expect(result).toMatchSnapshot('should parse and return 123.45 for "123.45"')
})

test('parseStructuredOutput - throws error for invalid data', () => {
  const numberSchema = z.number()
  const output = 'not a number'

  assert.throws(() => {
    parseStructuredOutput(output, numberSchema)
  })
})
