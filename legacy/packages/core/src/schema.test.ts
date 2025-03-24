import { expect, test } from 'vitest'
import { z } from 'zod'

import { asAgenticSchema, createJsonSchema, isZodSchema } from './schema'

test('isZodSchema', () => {
  expect(isZodSchema(z.object({}))).toBe(true)
  expect(isZodSchema({})).toBe(false)
})

test('asAgenticSchema', () => {
  expect(asAgenticSchema(z.object({})).jsonSchema).toEqual({
    type: 'object',
    properties: {},
    additionalProperties: false
  })
  expect(asAgenticSchema(createJsonSchema({})).jsonSchema).toEqual({})
})
