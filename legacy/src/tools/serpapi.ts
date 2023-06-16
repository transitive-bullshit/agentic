import { z } from 'zod'

import * as types from '@/types'
import { SerpAPIClient } from '@/services/serpapi'
import { BaseTask } from '@/task'

export const SerpAPIInputSchema = z.object({
  query: z.string().describe('search query'),
  numResults: z.number().int().positive().default(10).optional()
})
export type SerpAPIInput = z.infer<typeof SerpAPIInputSchema>

export const SerpAPIOrganicSearchResult = z.object({
  position: z.number().optional(),
  title: z.string().optional(),
  link: z.string().optional(),
  displayed_link: z.string().optional(),
  snippet: z.string().optional(),
  source: z.string().optional(),
  date: z.string().optional()
})

export const SerpAPIAnswerBox = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  link: z.string().optional(),
  displayed_link: z.string().optional(),
  snippet: z.string().optional()
})

export const SerpAPIKnowledgeGraph = z.object({
  type: z.string().optional(),
  description: z.string().optional()
})

export const SerpAPIOutputSchema = z.object({
  knowledgeGraph: SerpAPIKnowledgeGraph.optional(),
  answerBox: SerpAPIAnswerBox.optional(),
  organicResults: z.array(SerpAPIOrganicSearchResult).optional()
})
export type SerpAPIOutput = z.infer<typeof SerpAPIOutputSchema>

export class SerpAPITool extends BaseTask<SerpAPIInput, SerpAPIOutput> {
  protected _serpapiClient: SerpAPIClient

  constructor(
    opts: {
      serpapi?: SerpAPIClient
    } & types.BaseTaskOptions = {}
  ) {
    super(opts)

    this._serpapiClient =
      opts.serpapi ?? new SerpAPIClient({ ky: opts.agentic?.ky })
  }

  public override get inputSchema() {
    return SerpAPIInputSchema
  }

  public override get outputSchema() {
    return SerpAPIOutputSchema
  }

  public override get nameForModel(): string {
    return 'googleWebSearch'
  }

  public override get nameForHuman(): string {
    return 'SerpAPI'
  }

  public override get descForModel(): string {
    return 'Uses Google to search the web and return the most relevant results.'
  }

  protected override async _call(
    ctx: types.TaskCallContext<SerpAPIInput>
  ): Promise<SerpAPIOutput> {
    const res = await this._serpapiClient.search({
      q: ctx.input!.query,
      num: ctx.input!.numResults
    })

    this._logger.debug(
      res,
      `SerpAPI response for query ${JSON.stringify(ctx.input, null, 2)}"`
    )

    return this.outputSchema.parse({
      knowledgeGraph: res.knowledge_graph,
      answerBox: res.answer_box,
      organicResults: res.organic_results
    })
  }
}
