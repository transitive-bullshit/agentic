import { z } from 'zod'

import { MetaphorClient } from '../services/metaphor'
import { BaseTaskCallBuilder } from '../task'

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

export class MetaphorSearchTool extends BaseTaskCallBuilder<
  typeof MetaphorSearchToolInputSchema,
  typeof MetaphorSearchToolOutputSchema
> {
  _metaphorClient: MetaphorClient

  constructor({
    metaphorClient = new MetaphorClient()
  }: {
    metaphorClient?: MetaphorClient
  } = {}) {
    super({
      // TODO
    })

    this._metaphorClient = metaphorClient
  }

  public override get inputSchema() {
    return MetaphorSearchToolInputSchema
  }

  public override get outputSchema() {
    return MetaphorSearchToolOutputSchema
  }

  override async call(
    input: MetaphorSearchToolInput
  ): Promise<MetaphorSearchToolOutput> {
    // TODO: handle errors gracefully
    input = this.inputSchema.parse(input)

    return this._metaphorClient.search({
      query: input.query,
      numResults: input.numResults
    })
  }
}
