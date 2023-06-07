import { z } from 'zod'

import * as types from '../types'
import { Agentic } from '../agentic'
import { MetaphorClient } from '../services/metaphor'
import { BaseTask } from '../task'

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
  typeof MetaphorSearchToolInputSchema,
  typeof MetaphorSearchToolOutputSchema
> {
  _metaphorClient: MetaphorClient

  constructor({
    agentic,
    metaphorClient = new MetaphorClient()
  }: {
    agentic: Agentic
    metaphorClient?: MetaphorClient
  }) {
    super({
      agentic
    })

    this._metaphorClient = metaphorClient
  }

  public override get inputSchema() {
    return MetaphorSearchToolInputSchema
  }

  public override get outputSchema() {
    return MetaphorSearchToolOutputSchema
  }

  protected override async _call(
    input: MetaphorSearchToolInput
  ): Promise<types.TaskResponse<typeof MetaphorSearchToolOutputSchema>> {
    // TODO: handle errors gracefully
    input = this.inputSchema.parse(input)

    const result = await this._metaphorClient.search({
      query: input.query,
      numResults: input.numResults
    })

    return {
      result,
      metadata: {}
    }
  }
}
