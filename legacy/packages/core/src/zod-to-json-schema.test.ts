import { describe, expect, test } from 'vitest'
import { z } from 'zod'

import { zodToJsonSchema } from './zod-to-json-schema'

describe('zodToJsonSchema', () => {
  test('handles basic objects', () => {
    const params = zodToJsonSchema(
      z.object({
        name: z.string().min(1).describe('Name of the person'),
        age: z.number().int().optional().describe('Age in years')
      })
    )

    expect(params).toEqual({
      additionalProperties: false,
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Name of the person',
          minLength: 1
        },
        age: {
          type: 'integer',
          description: 'Age in years'
        }
      }
    })
  })

  test('handles enums and unions', () => {
    const params = zodToJsonSchema(
      z.object({
        name: z.string().min(1).describe('Name of the person'),
        sexEnum: z.enum(['male', 'female']),
        sexUnion: z.union([z.literal('male'), z.literal('female')])
      })
    )

    expect(params).toEqual({
      additionalProperties: false,
      type: 'object',
      required: ['name', 'sexEnum', 'sexUnion'],
      properties: {
        name: {
          type: 'string',
          description: 'Name of the person',
          minLength: 1
        },
        sexEnum: {
          type: 'string',
          enum: ['male', 'female']
        },
        sexUnion: {
          type: 'string',
          enum: ['male', 'female']
        }
      }
    })
  })
})
