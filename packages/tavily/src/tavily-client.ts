import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  pruneNullOrUndefined,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

export namespace tavily {
  export const API_BASE_URL = 'https://api.tavily.com'

  // Allow up to 20 requests per minute by default.
  export const throttle = pThrottle({
    limit: 20,
    interval: 60 * 1000
  })

  export interface SearchOptions {
    /** Search query. (required) */
    query: string

    /**
     * The depth of the search. It can be basic or advanced. Default is basic
     * for quick results and advanced for indepth high quality results but
     * longer response time. Advanced calls equals 2 requests.
     */
    search_depth?: 'basic' | 'advanced'

    /** Include a synthesized answer in the search results. Default is `false`. */
    include_answer?: boolean

    /** Include a list of query related images in the response. Default is `false`. */
    include_images?: boolean

    /** Include raw content in the search results. Default is `false`. */
    include_raw_content?: boolean

    /** The number of maximum search results to return. Default is `5`. */
    max_results?: number

    /**
     * A list of domains to specifically include in the search results.
     * Default is `undefined`, which includes all domains.
     */
    include_domains?: string[]

    /**
     * A list of domains to specifically exclude from the search results.
     * Default is `undefined`, which doesn't exclude any domains.
     */
    exclude_domains?: string[]
  }

  export interface SearchResponse {
    /** The search query. */
    query: string

    /** A list of sorted search results ranked by relevancy. */
    results: SearchResult[]

    /** The answer to your search query. */
    answer?: string

    /** A list of query related image urls. */
    images?: string[]

    /** A list of suggested research follow up questions related to original query. */
    follow_up_questions?: string[]

    /** How long it took to generate a response. */
    response_time: string
  }

  export interface SearchResult {
    /** The url of the search result. */
    url: string

    /** The title of the search result page. */
    title: string

    /**
     * The most query related content from the scraped url. We use proprietary
     * AI and algorithms to extract only the most relevant content from each
     * url, to optimize for context quality and size.
     */
    content: string

    /** The parsed and cleaned HTML of the site. For now includes parsed text only. */
    raw_content?: string

    /** The relevance score of the search result. */
    score: string
  }
}

/**
 * Tavily provides a web search API tailored for LLMs.
 *
 * @see https://tavily.com
 */
export class TavilyClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('TAVILY_API_KEY'),
    apiBaseUrl = tavily.API_BASE_URL,
    throttle = true,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'TavilyClient missing required "apiKey" (defaults to "TAVILY_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, tavily.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  /**
   * Searches the web for pages relevant to the given query and summarizes the results.
   */
  @aiFunction({
    name: 'tavily_web_search',
    description:
      'Searches the web to find the most relevant pages for a given query and summarizes the results. Very useful for finding up-to-date news and information about any topic.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The query to search for. Accepts any Google search query.'),
      search_depth: z
        .enum(['basic', 'advanced'])
        .optional()
        .describe(
          'How deep of a search to perform. Use "basic" for quick results and "advanced" for slower, in-depth results.'
        ),
      include_answer: z
        .boolean()
        .optional()
        .describe(
          'Whether or not to include an answer summary in the results.'
        ),
      include_images: z
        .boolean()
        .optional()
        .describe('Whether or not to include images in the results.'),
      max_results: z
        .number()
        .int()
        .positive()
        .default(5)
        .optional()
        .describe('Max number of search results to return.')
      // include_domains: z
      //   .array(z.string())
      //   .optional()
      //   .describe(
      //     'List of domains to specifically include in the search results.'
      //   ),
      // exclude_domains: z
      //   .array(z.string())
      //   .optional()
      //   .describe(
      //     'List of domains to specifically exclude from the search results.'
      //   )
    })
  })
  async search(queryOrOpts: string | tavily.SearchOptions) {
    const options =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    const res = await this.ky
      .post('search', {
        json: {
          ...options,
          api_key: this.apiKey
        }
      })
      .json<tavily.SearchResponse>()

    return pruneNullOrUndefined({
      ...res,
      results: res.results?.map(pruneNullOrUndefined)
    })
  }
}
