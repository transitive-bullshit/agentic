import { z } from 'zod'

import * as types from '@/types'
import { SerpAPIClient } from '@/services/serpapi'
import { BaseTask } from '@/task'
import { normalizeUrl } from '@/url-utils'

export const SerpAPIInputSchema = z.object({
  query: z.string().describe('search query'),
  numResults: z.number().int().positive().default(5).optional()
})
export type SerpAPIInput = z.infer<typeof SerpAPIInputSchema>

export const SerpAPIOrganicSearchResult = z.object({
  position: z.number(),
  title: z.string(),
  link: z.string(),
  // displayed_link: z.string(),
  snippet: z.string(),
  source: z.string(),
  date: z.string()
})

export const SerpAPIAnswerBox = z.object({
  type: z.string(),
  title: z.string(),
  link: z.string(),
  // displayed_link: z.string(),
  snippet: z.string()
})

export const SerpAPIKnowledgeGraph = z.object({
  type: z.string(),
  description: z.string()
})

export const SerpAPITweet = z.object({
  link: z.string(),
  snippet: z.string(),
  published_date: z.string()
})

export const SerpAPITwitterResults = z.object({
  title: z.string(),
  // displayed_link: z.string(),
  tweets: z.array(SerpAPITweet)
})

export const SerpAPIOutputSchema = z
  .object({
    knowledge_graph: SerpAPIKnowledgeGraph,
    answer_box: SerpAPIAnswerBox,
    organic_results: z.array(SerpAPIOrganicSearchResult),
    twitter_results: SerpAPITwitterResults
  })
  .deepPartial()
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
    const { query, numResults = 5 } = ctx.input!

    const res = await this._serpapiClient.search({
      q: query

      // TODO: the `num` parameter doesn't seem to work consistently to SerpAPI and
      // instead only returns a subset of results, so we instead just `slice` the
      // results manuall
    })

    this._logger.info(
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
