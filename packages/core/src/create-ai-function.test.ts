import { describe, expect, test } from 'vitest'
import { z } from 'zod'

import { createAIFunction } from './create-ai-function'
import { type Msg } from './message'

const fullName = createAIFunction(
  {
    name: 'fullName',
    description: 'Returns the full name of a person.',
    inputSchema: z.object({
      first: z.string(),
      last: z.string()
    })
  },
  async ({ first, last }) => {
    return `${first} ${last}`
  }
)

describe('createAIFunction()', () => {
  test('exposes OpenAI function calling spec', () => {
    expect(fullName.spec.name).toEqual('fullName')
    expect(fullName.spec.description).toEqual(
      'Returns the full name of a person.'
    )
    expect(fullName.spec.parameters).toEqual({
      properties: {
        first: { type: 'string' },
        last: { type: 'string' }
      },
      required: ['first', 'last'],
      type: 'object',
      additionalProperties: false
    })
  })

  test('executes the function with JSON string', async () => {
    expect(await fullName('{"first": "John", "last": "Doe"}')).toEqual(
      'John Doe'
    )
  })

  test('executes the function with OpenAI Message', async () => {
    const message: Msg.FuncCall = {
      role: 'assistant',
      content: null,
      function_call: {
        name: 'fullName',
        arguments: '{"first": "Jane", "last": "Smith"}'
      }
    }

    expect(await fullName(message)).toEqual('Jane Smith')
  })
})
