import { z } from 'zod'

import * as types from '@/types'
import { SerpAPIClient } from '@/services/serpapi'
import { BaseTask } from '@/task'
import { normalizeUrl } from '@/url-utils'

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

export const SerpAPITweet = z.object({
  link: z.string().optional(),
  snippet: z.string().optional(),
  published_date: z.string().optional()
})

export const SerpAPITwitterResults = z.object({
  title: z.string().optional(),
  displayed_link: z.string().optional(),
  tweets: z.array(SerpAPITweet).optional()
})

export const SerpAPIOutputSchema = z.object({
  knowledge_graph: SerpAPIKnowledgeGraph.optional(),
  answer_box: SerpAPIAnswerBox.optional(),
  organic_results: z.array(SerpAPIOrganicSearchResult).optional(),
  twitter_results: SerpAPITwitterResults.optional()
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
    const { query, numResults = 10 } = ctx.input!

    const res = await this._serpapiClient.search({
      q: query
    })

    this._logger.debug(
      res,
      `SerpAPI response for query ${JSON.stringify(ctx.input, null, 2)}"`
    )

    const twitterResults = res.twitter_results
      ? {
          ...res.twitter_results,
          tweets: res.twitter_results.tweets?.map((tweet) => ({
            ...tweet,
            link: normalizeUrl(tweet.link, {
              removeQueryParameters: true
            })
          }))
        }
      : undefined

    return this.outputSchema.parse({
      knowledge_graph: res.knowledge_graph,
      answer_box: res.answer_box,
      organic_results: res.organic_results?.slice(0, numResults),
      twitter_results: twitterResults
    })
  }
}
