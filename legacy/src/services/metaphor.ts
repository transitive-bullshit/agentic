import defaultKy from 'ky'

import { getEnv } from '@/env'

export const METAPHOR_API_BASE_URL = 'https://api.metaphor.systems'

/**
 * Metaphor search API input parameters.
 *
 * @see {@link https://metaphorapi.readme.io/reference/search}
 */
export type MetaphorSearchInput = {
  /** A Metaphor-optimized query string. */
  query: string

  /**
   * Number of search results to return.
   * Maximum is 500. Default is 100 if not specified.
   */
  numResults?: number

  /**
   * Optional beta flag.
   * If true, returns good results without Metaphor syntax.
   * For example, Query "thought pieces about synthetic biology" should return good results, even though query is not Metaphor-optimized.
   */
  useQueryExpansion?: boolean

  /**
   * List of domains to include in the search.
   * If specified, results will only come from these domains.
   * Only one of includeDomains and excludeDomains should be specified.
   */
  includeDomains?: string[]

  /**
   * List of domains to exclude in the search.
   * If specified, results will exclude these domains.
   * Only one of includeDomains and excludeDomains should be specified.
   */
  excludeDomains?: string[]

  /**
   * "Crawl date" refers to the date that Metaphor discovered a link, which is more granular and can be more useful than published date.
   * If startCrawlDate is specified, results will only include links that were crawled after startCrawlDate.
   * Must be specified in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
   */
  startCrawlDate?: string

  /**
   * "Crawl date" refers to the date that Metaphor discovered a link, which is more granular and can be more useful than published date.
   * If endCrawlDate is specified, results will only include links that were crawled before endCrawlDate.
   * Must be specified in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
   */
  endCrawlDate?: string

  /**
   * If specified, only links with a published date after startPublishedDate will be returned.
   * Must be specified in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
   * Note that for some links, we have no published date, and these links will be excluded from the results if startPublishedDate is specified.
   */
  startPublishedDate?: string

  /**
   * If specified, only links with a published date before endPublishedDate will be returned.
   * Must be specified in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
   * Note that for some links, we have no published date, and these links will be excluded from the results if endPublishedDate is specified.
   */
  endPublishedDate?: string
}

/**
 * Result returned by the Metaphor Search API.
 */
export type MetaphorSearchOutput = {
  results: {
    /**
     * The URL of the page.
     */
    url: string

    /**
     * The title of the page.
     * This value can be null if the title is not available or cannot be determined.
     */
    title: string | null

    /**
     * The author of the content, if applicable.
     * This value can be null if the author is not available or cannot be determined.
     */
    author: string | null

    /**
     * The estimated date the page was published, in YYYY-MM-DD format.
     * This value can be null if the published date is not available or cannot be determined.
     */
    publishedDate: string | null

    /**
     * A number from 0 to 1 representing the similarity between the query and the result.
     */
    score: number
  }[]
}

export class MetaphorClient {
  /**
   * HTTP client for the Metaphor API.
   */
  readonly api: typeof defaultKy

  /**
   * Metaphor API key.
   */
  readonly apiKey: string

  /**
   * Metaphor API base URL.
   */
  readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('METAPHOR_API_KEY'),
    apiBaseUrl = METAPHOR_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error MetaphorClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.api = ky.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  /**
   * Returns a list of links relevant to your query.
   */
  async search(params: MetaphorSearchInput) {
    return this.api
      .post('search', {
        headers: {
          'x-api-key': this.apiKey
        },
        json: params
      })
      .json<MetaphorSearchOutput>()
  }
}
