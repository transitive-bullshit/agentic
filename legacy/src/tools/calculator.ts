import { Parser } from 'expr-eval'
import { z } from 'zod'

import { createAIFunction } from '../create-ai-function.js'

// TODO: consider using https://github.com/josdejong/mathjs
// TODO: ensure `expr` is sanitized to not run arbitrary code

export const CalculatorInputSchema = z.object({
  expr: z.string().describe('mathematical expression to evaluate')
})
export type CalculatorInput = z.infer<typeof CalculatorInputSchema>

export const calculator = createAIFunction(
  {
    name: 'calculator',
    description:
      'Computes the result of simple mathematical expressions. Handles basic arithmetic operations like addition, subtraction, multiplication, division, exponentiation, and common functions like sin, cos, abs, exp, and random.',
    inputSchema: CalculatorInputSchema
  },
  async (input: CalculatorInput) => {
    const result: number = Parser.evaluate(input.expr)
    return result
  }
)
