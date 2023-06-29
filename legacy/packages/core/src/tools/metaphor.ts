import { z } from 'zod'

import * as metaphor from '@/services/metaphor'
import * as types from '@/types'
import { BaseTask } from '@/task'

export const MetaphorInputSchema = z.object({
  query: z.string(),
  numResults: z.number().optional()
})

export const MetaphorOutputSchema = z.object({
  results: z.array(
    z.object({
      author: z.string().nullable(),
      publishedDate: z.string().nullable(),
      title: z.string().nullable(),
      score: z.number(),
      url: z.string()
    })
  )
})

export class MetaphorSearchTool extends BaseTask<
  metaphor.MetaphorSearchInput,
  metaphor.MetaphorSearchOutput
> {
  protected _metaphorClient: metaphor.MetaphorClient

  constructor(
    opts: {
      metaphorClient?: metaphor.MetaphorClient
    } & types.BaseTaskOptions = {}
  ) {
    super(opts)

    this._metaphorClient =
      opts.metaphorClient ??
      new metaphor.MetaphorClient({ ky: opts.agentic?.ky })
  }

  public override get inputSchema() {
    return MetaphorInputSchema
  }

  public override get outputSchema() {
    return MetaphorOutputSchema
  }

  public override get nameForModel(): string {
    return 'metaphorWebSearch'
  }

  protected override async _call(
    ctx: types.TaskCallContext<metaphor.MetaphorSearchInput>
  ): Promise<metaphor.MetaphorSearchOutput> {
    // TODO: test required inputs
    return this._metaphorClient.search(ctx.input!)
  }
}
