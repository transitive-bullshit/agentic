import { expect, test } from 'vitest'
import { z } from 'zod'

import { AIFunctionSet } from './ai-function-set.js'
import { aiFunction, AIFunctionsProvider } from './fns.js'
import { calculator } from './tools/calculator.js'

class MockAITool extends AIFunctionsProvider {
  @aiFunction({
    name: 'echo',
    description: 'Echoes the input.',
    inputSchema: z.object({
      query: z.string().describe('input query to echo')
    })
  })
  async echo({ query }: { query: string }) {
    return query
  }
}

test('AIFunctionSet constructor', () => {
  const mockAITool = new MockAITool()
  const s0 = new AIFunctionSet([mockAITool, calculator])

  expect(s0.size).toEqual(2)
  expect(s0.get('echo')).toBeDefined()
  expect(s0.get('calculator')).toBeDefined()
  expect([...s0].length).toEqual(2)

  const s1 = new AIFunctionSet([s0, mockAITool, calculator, calculator])
  expect(s0.size).toEqual(2)
  expect(s1.size).toEqual(2)
  expect(s1.get('echo')).toBeDefined()
  expect(s1.get('calculator')).toBeDefined()
  expect([...s1].length).toEqual(2)
})

test('AIFunctionSet constructor invalid function', () => {
  const mockAITool = new MockAITool()

  expect(
    () => new AIFunctionSet([mockAITool, calculator, { spec: {} } as any])
  ).toThrowError('Invalid AIFunctionLike: [object Object]')
})
