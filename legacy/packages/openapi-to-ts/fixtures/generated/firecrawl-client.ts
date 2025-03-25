/**
 * This file was auto-generated from an OpenAPI spec.
 */

import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  pick
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'

import { firecrawl } from './firecrawl'

/**
 * Agentic Firecrawl client.
 *
 * API for interacting with Firecrawl services to perform web scraping and crawling tasks.
 */
export class FirecrawlClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('FIRECRAWL_API_KEY'),
    apiBaseUrl = firecrawl.apiBaseUrl,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'FirecrawlClient missing required "apiKey" (defaults to "FIRECRAWL_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization: apiKey
      }
    })
  }

  /**
   * Scrape a single URL.
   */
  @aiFunction({
    name: 'firecrawl_scrape',
    description: `Scrape a single URL.`,
    inputSchema: firecrawl.ScrapeParamsSchema,
    tags: ['Scraping']
  })
  async scrape(
    params: firecrawl.ScrapeParams
  ): Promise<firecrawl.ScrapeResponse> {
    return this.ky
      .post('/scrape', {
        json: pick(
          params,
          'url',
          'formats',
          'headers',
          'includeTags',
          'excludeTags',
          'onlyMainContent',
          'timeout',
          'waitFor'
        )
      })
      .json<firecrawl.ScrapeResponse>()
  }

  /**
   * Crawl multiple URLs based on options.
   */
  @aiFunction({
    name: 'firecrawl_crawl_urls',
    description: `Crawl multiple URLs based on options.`,
    inputSchema: firecrawl.CrawlUrlsParamsSchema,
    tags: ['Crawling']
  })
  async crawlUrls(
    params: firecrawl.CrawlUrlsParams
  ): Promise<firecrawl.CrawlUrlsResponse> {
    return this.ky
      .post('/crawl', {
        json: pick(params, 'url', 'crawlerOptions', 'pageOptions')
      })
      .json<firecrawl.CrawlUrlsResponse>()
  }

  /**
   * Search for a keyword in Google, returns top page results with markdown content for each page.
   */
  @aiFunction({
    name: 'firecrawl_search_google',
    description: `Search for a keyword in Google, returns top page results with markdown content for each page.`,
    inputSchema: firecrawl.SearchGoogleParamsSchema,
    tags: ['Search']
  })
  async searchGoogle(
    params: firecrawl.SearchGoogleParams
  ): Promise<firecrawl.SearchGoogleResponse> {
    return this.ky
      .post('/search', {
        json: pick(params, 'query', 'pageOptions', 'searchOptions')
      })
      .json<firecrawl.SearchGoogleResponse>()
  }

  /**
   * Get the status of a crawl job.
   */
  @aiFunction({
    name: 'firecrawl_get_crawl_status',
    description: `Get the status of a crawl job.`,
    inputSchema: firecrawl.GetCrawlStatusParamsSchema,
    tags: ['Crawl']
  })
  async getCrawlStatus(
    params: firecrawl.GetCrawlStatusParams
  ): Promise<firecrawl.GetCrawlStatusResponse> {
    return this.ky
      .get(`/crawl/status/${params.jobId}`)
      .json<firecrawl.GetCrawlStatusResponse>()
  }

  /**
   * Cancel a crawl job.
   */
  @aiFunction({
    name: 'firecrawl_cancel_crawl_job',
    description: `Cancel a crawl job.`,
    inputSchema: firecrawl.CancelCrawlJobParamsSchema,
    tags: ['Crawl']
  })
  async cancelCrawlJob(
    params: firecrawl.CancelCrawlJobParams
  ): Promise<firecrawl.CancelCrawlJobResponse> {
    return this.ky
      .delete(`/crawl/cancel/${params.jobId}`)
      .json<firecrawl.CancelCrawlJobResponse>()
  }
}
