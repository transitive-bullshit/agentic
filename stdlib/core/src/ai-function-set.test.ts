import { expect, test } from 'vitest'
import { z } from 'zod'

import { AIFunctionSet } from './ai-function-set'
import { createAIFunction } from './create-ai-function'
import { EchoAITool } from './echo'

export const CalculatorInputSchema = z.object({
  expr: z.string().describe('mathematical expression to evaluate')
})
export type CalculatorInput = z.infer<typeof CalculatorInputSchema>

const mockCalculator = createAIFunction(
  {
    name: 'calculator',
    description:
      'Computes the result of simple mathematical expressions. Handles basic arithmetic operations like addition, subtraction, multiplication, and division. Example expressions: "1 + 2", "3.4 * 5 / 9", "4 - 2"',
    inputSchema: CalculatorInputSchema
  },
  async (input: CalculatorInput) => {
    // eslint-disable-next-line no-eval, security/detect-eval-with-expression
    const result: number = eval(input.expr)
    return result
  }
)

test('AIFunctionSet constructor', () => {
  const mockAITool = new EchoAITool()
  const s0 = new AIFunctionSet([mockAITool, mockCalculator])

  expect(s0.size).toEqual(2)
  expect(s0.get('echo')).toBeDefined()
  expect(s0.get('calculator')).toBeDefined()
  expect([...s0].length).toEqual(2)

  const s1 = new AIFunctionSet([s0, mockAITool, mockCalculator, mockCalculator])
  expect(s0.size).toEqual(2)
  expect(s1.size).toEqual(2)
  expect(s1.get('echo')).toBeDefined()
  expect(s1.get('calculator')).toBeDefined()
  expect([...s1].length).toEqual(2)
})

test('AIFunctionSet constructor invalid function', () => {
  const mockAITool = new EchoAITool()

  expect(
    () => new AIFunctionSet([mockAITool, mockCalculator, { spec: {} } as any])
  ).toThrowError('Invalid AIFunctionLike: [object Object]')
})
