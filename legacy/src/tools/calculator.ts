import { Parser } from 'expr-eval'
import { z } from 'zod'

import * as types from '@/types'
import { BaseTask } from '@/task'

export const CalculatorInputSchema = z.string().describe('expression')
export const CalculatorOutputSchema = z
  .number()
  .describe('result of calculating the expression')

export type CalculatorInput = z.infer<typeof CalculatorInputSchema>

export type CalculatorOutput = z.infer<typeof CalculatorOutputSchema>

export class CalculatorTool extends BaseTask<
  CalculatorInput,
  CalculatorOutput
> {
  constructor(opts: types.BaseTaskOptions) {
    super(opts)
  }

  public override get inputSchema() {
    return CalculatorInputSchema
  }

  public override get outputSchema() {
    return CalculatorOutputSchema
  }

  public override get name(): string {
    return 'calculator'
  }

  public get descriptionForModel(): string {
    return 'Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.'
  }

  protected override async _call(
    ctx: types.TaskCallContext<CalculatorInput>
  ): Promise<CalculatorOutput> {
    const result = Parser.evaluate(ctx.input!)
    return result
  }
}
