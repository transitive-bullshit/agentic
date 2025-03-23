import { expect, test } from 'vitest'
import { z } from 'zod'

import { asSchema, createJsonSchema, isZodSchema } from './schema'

test('isZodSchema', () => {
  expect(isZodSchema(z.object({}))).toBe(true)
  expect(isZodSchema({})).toBe(false)
})

test('asSchema', () => {
  expect(asSchema(z.object({})).jsonSchema).toEqual({
    type: 'object',
    properties: {},
    additionalProperties: false
  })
  expect(asSchema(createJsonSchema({})).jsonSchema).toEqual({})
})
