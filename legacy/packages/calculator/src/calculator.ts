import { createAIFunction } from '@agentic/core'
import { evaluate } from 'mathjs'
import { z } from 'zod'

// TODO: ensure `expr` is sanitized to not run arbitrary code

export const CalculatorInputSchema = z.object({
  expr: z.string().describe('mathematical expression to evaluate')
})
export type CalculatorInput = z.infer<typeof CalculatorInputSchema>

export const calculator = createAIFunction(
  {
    name: 'calculator',
    description:
      'Computes the result of simple mathematical expressions. Handles basic arithmetic operations like addition, subtraction, multiplication, division, exponentiation, and common functions like sin, cos, abs, exp, and random. Example expressions: "1.2 * (2 + 4.5)", "12.7 cm to inch", "sin(45 deg) ^ 2"',
    inputSchema: CalculatorInputSchema
  },
  async (input: CalculatorInput) => {
    const result: number = evaluate(input.expr)
    return result
  }
)
