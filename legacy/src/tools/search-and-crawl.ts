import pMap from 'p-map'
import { z } from 'zod'

import * as types from '@/types'
import { BaseTask } from '@/task'
import { isValidCrawlableUrl, normalizeUrl } from '@/url-utils'
import { omit } from '@/utils'

import { DiffbotOutput, DiffbotOutputSchema, DiffbotTool } from './diffbot'
import { SerpAPIOutputSchema, SerpAPITool } from './serpapi'

export const SearchAndCrawlInputSchema = z.object({
  query: z.string().describe('search query')
})
export type SearchAndCrawlInput = z.infer<typeof SearchAndCrawlInputSchema>

export const SearchAndCrawlOutputSchema = SerpAPIOutputSchema.omit({
  organic_results: true
}).extend({
  scrape_results: z.array(DiffbotOutputSchema)
})

export type SearchAndCrawlOutput = z.infer<typeof SearchAndCrawlOutputSchema>

export class SearchAndCrawlTool extends BaseTask<
  SearchAndCrawlInput,
  SearchAndCrawlOutput
> {
  protected _serpapiTool: SerpAPITool
  protected _diffbotTool: DiffbotTool

  constructor(
    opts: {
      serpapi?: SerpAPITool
      diffbot?: DiffbotTool
    } & types.BaseTaskOptions = {}
  ) {
    super(opts)

    this._serpapiTool =
      opts.serpapi ?? new SerpAPITool({ agentic: this._agentic })

    this._diffbotTool =
      opts.diffbot ?? new DiffbotTool({ agentic: this._agentic })
  }

  public override get inputSchema() {
    return SearchAndCrawlInputSchema
  }

  public override get outputSchema() {
    return SearchAndCrawlOutputSchema
  }

  public override get nameForModel(): string {
    return 'webSearchAndCrawl'
  }

  public override get nameForHuman(): string {
    return 'SearchAndCrawl'
  }

  public override get descForModel(): string {
    return 'Uses Google to search the web, crawls the results, and then summarizes the most relevant results.'
  }

  protected override async _call(
    ctx: types.TaskCallContext<SearchAndCrawlInput>
  ): Promise<SearchAndCrawlOutput> {
    const { query } = ctx.input!
    const crawledUrls = new Set<string>()

    async function crawlAndScrape(
      url: string | undefined,
      {
        diffbotTool,
        parentCtx = ctx,
        depth = 0,
        maxDepth = 1,
        maxListItems = 3
      }: {
        diffbotTool: DiffbotTool
        parentCtx?: types.TaskCallContext<any>
        depth?: number
        maxDepth?: number
        maxListItems?: number
      }
    ): Promise<Array<DiffbotOutput>> {
      try {
        if (!url) return []
        if (!isValidCrawlableUrl(url)) return []
        if (crawledUrls.has(url)) return []

        const normalizedUrl = normalizeUrl(url)
        if (!normalizedUrl) return []
        if (crawledUrls.has(normalizedUrl)) return []

        crawledUrls.add(url)
        crawledUrls.add(normalizedUrl)

        console.log('\n\n')
        const { result: scrapeResult } = await diffbotTool.callWithMetadata(
          { url },
          parentCtx
        )

        if (scrapeResult.type !== 'list') {
          return [scrapeResult]
        }

        if (depth >= maxDepth) {
          return [scrapeResult]
        }

        const object = scrapeResult.objects?.[0]
        if (!object) return [scrapeResult]

        const items = object.items
          ?.filter((item) => item.link)
          .slice(0, maxListItems)
        if (!items?.length) return [scrapeResult]

        const innerScrapeResults = (
          await pMap(
            items,
            async (item) => {
              const innerScrapeResult = await crawlAndScrape(item.link, {
                diffbotTool,
                depth: depth + 1,
                parentCtx
              })
              return innerScrapeResult
            },
            {
              concurrency: 4
            }
          )
        ).flat()

        return innerScrapeResults
      } catch (err) {
        console.warn('crawlAndScrape error', url, err)
        return []
      }
    }

    const search = await this._serpapiTool.callWithMetadata(
      { query, numResults: 3 },
      ctx
    )

    const scrapeResults = (
      await pMap(
        (search.result.organic_results || []).slice(0, 3),
        async (searchResult) => {
          return crawlAndScrape(searchResult.link, {
            diffbotTool: this._diffbotTool,
            parentCtx: ctx,
            depth: 0,
            maxDepth: 1
          })
        },
        {
          concurrency: 5
        }
      )
    ).flat()

    const output = this.outputSchema.parse({
      ...omit(search.result, 'organic_results'),
      scrape_results: scrapeResults
    })

    this._logger.info(output, `SearchAndCrawl response for query "${query}"`)
    return output
  }
}
