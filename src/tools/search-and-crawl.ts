import pMap from 'p-map'
import { z } from 'zod'

import { aiFunction, AIFunctionsProvider } from '../fns'
import { type diffbot, DiffbotClient } from '../services/diffbot-client'
import { SerpAPIClient } from '../services/serpapi-client'
import { isValidCrawlableUrl, normalizeUrl } from '../url-utils'
import { omit, pick } from '../utils'

// TODO: allow `search` tool to support other search clients
// (e.g. Bing, Exa, Searxng, Serper, Tavily)

export class SearchAndCrawl extends AIFunctionsProvider {
  readonly serpapi: SerpAPIClient
  readonly diffbot: DiffbotClient

  constructor(opts: { serpapi?: SerpAPIClient; diffbot?: DiffbotClient } = {}) {
    super()

    this.serpapi = opts.serpapi ?? new SerpAPIClient()
    this.diffbot = opts.diffbot ?? new DiffbotClient()
  }

  @aiFunction({
    name: 'search_and_crawl',
    description:
      'Uses Google to search the web, crawls the results, and then summarizes the most relevant results. Useful for creating in-depth summaries of topics along with sources.',
    inputSchema: z.object({
      query: z.string().describe('search query')
    })
  })
  async searchAndCrawl({
    query,
    numSearchResults = 3,
    maxCrawlDepth = 1,
    maxListItems = 3
  }: {
    query: string
    numSearchResults?: number
    maxCrawlDepth?: number
    maxListItems?: number
  }) {
    const crawledUrls = new Set<string>()

    const crawlAndScrape = async (
      url: string | undefined,
      {
        depth = 0
      }: {
        depth?: number
      }
    ): Promise<diffbot.ExtractAnalyzeResponse[]> => {
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
        const scrapeResult = await this.diffbot.analyzeUrl({ url })
        console.log(
          `SearchAndCrawl depth ${depth} - "${url}"`,
          pick(scrapeResult, 'type', 'title')
        )

        if (scrapeResult.type !== 'list') {
          return [scrapeResult]
        }

        if (depth >= maxCrawlDepth) {
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
                depth: depth + 1
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

    const searchResponse = await this.serpapi.search({
      q: query,
      num: numSearchResults
    })

    console.log(`SearchAndCrawl search results "${query}"`, searchResponse)
    const scrapeResults = (
      await pMap(
        (searchResponse.organic_results || []).slice(0, numSearchResults),
        async (searchResult) => {
          return crawlAndScrape(searchResult.link, {
            depth: 0
          })
        },
        {
          concurrency: 5
        }
      )
    ).flat()

    const output = {
      ...omit(searchResponse, 'organic_results'),
      scrape_results: scrapeResults
    }

    console.log(`SearchAndCrawl response for query "${query}"`, output)
    return output
  }
}
