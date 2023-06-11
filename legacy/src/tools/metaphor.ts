import { z } from 'zod'

import * as types from '@/types'
import { Agentic } from '@/agentic'
import { MetaphorClient } from '@/services/metaphor'
import { BaseTask } from '@/task'

export const MetaphorSearchToolInputSchema = z.object({
  query: z.string(),
  numResults: z.number().optional()
})

export type MetaphorSearchToolInput = z.infer<
  typeof MetaphorSearchToolInputSchema
>

export const MetaphorSearchToolOutputSchema = z.object({
  results: z.array(
    z.object({
      author: z.string().nullable(),
      dateCreated: z.string().nullable(),
      title: z.string().nullable(),
      score: z.number(),
      url: z.string()
    })
  )
})

export type MetaphorSearchToolOutput = z.infer<
  typeof MetaphorSearchToolOutputSchema
>

export class MetaphorSearchTool extends BaseTask<
  MetaphorSearchToolInput,
  MetaphorSearchToolOutput
> {
  _metaphorClient: MetaphorClient

  constructor({
    agentic,
    metaphorClient = new MetaphorClient(),
    ...rest
  }: {
    agentic: Agentic
    metaphorClient?: MetaphorClient
  } & types.BaseTaskOptions) {
    super({
      agentic,
      ...rest
    })

    this._metaphorClient = metaphorClient
  }

  public override get inputSchema() {
    return MetaphorSearchToolInputSchema
  }

  public override get outputSchema() {
    return MetaphorSearchToolOutputSchema
  }

  public override get name(): string {
    return 'metaphor-search'
  }

  protected override async _call(
    ctx: types.TaskCallContext<MetaphorSearchToolInput>
  ): Promise<MetaphorSearchToolOutput> {
    // TODO: test required inputs
    return this._metaphorClient.search({
      query: ctx.input!.query,
      numResults: ctx.input!.numResults
    })
  }
}
