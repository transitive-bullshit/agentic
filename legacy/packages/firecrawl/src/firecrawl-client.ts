import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  delay,
  getEnv,
  isZodSchema,
  throttleKy,
  zodToJsonSchema
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

export namespace firecrawl {
  export const BASE_URL = 'https://api.firecrawl.dev'

  // Allow up to 50 request per minute by default.
  export const throttle = pThrottle({
    limit: 1,
    interval: 1200,
    strict: true
  })

  /**
   * Generic parameter interface.
   */
  export interface Params {
    extractorOptions?: {
      extractionSchema: z.ZodSchema | any
      mode?: 'llm-extraction'
      extractionPrompt?: string
    }
  }

  /**
   * Response interface for scraping operations.
   */
  export interface ScrapeResponse {
    success: boolean
    data?: Data
    error?: string
  }

  export interface Data {
    content?: string
    markdown?: string
    html?: string
    metadata: Metadata
  }

  export interface Metadata {
    title: string
    description: string
    keywords?: string
    robots?: string
    ogTitle?: string
    ogDescription?: string
    ogUrl?: string
    ogImage?: string
    ogLocaleAlternate?: any[]
    ogSiteName?: string
    sourceURL?: string
    modifiedTime?: string
    publishedTime?: string
  }

  /**
   * Response interface for searching operations.
   */
  export interface SearchResponse {
    success: boolean
    data?: any
    error?: string
  }

  /**
   * Response interface for crawling operations.
   */
  export interface CrawlResponse {
    success: boolean
    jobId?: string
    data?: any
    error?: string
  }

  /**
   * Response interface for job status checks.
   */
  export interface JobStatusResponse {
    success: boolean
    status: string
    jobId?: string
    data?: any
    error?: string
  }
}

/**
 * Turn websites into LLM-ready data. Crawl and convert any website into clean
 * markdown or structured data.
 *
 * @see https://www.firecrawl.dev
 * @see https://github.com/mendableai/firecrawl
 */
export class FirecrawlClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('FIRECRAWL_API_KEY'),
    apiBaseUrl = getEnv('FIRECRAWL_API_BASE_URL') ?? firecrawl.BASE_URL,
    throttle = true,
    timeoutMs = 60_000,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    throttle?: boolean
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'FirecrawlClient missing required "apiKey" (defaults to "FIRECRAWL_API_KEY")'
    )
    assert(
      apiBaseUrl,
      'FirecrawlClient missing required "apiBaseUrl" (defaults to "FIRECRAWL_API_BASE_URL")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, firecrawl.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    })
  }

  @aiFunction({
    name: 'firecrawl_scrape_url',
    description: 'Scrape the contents of a URL.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL to scrape.')
    })
  })
  async scrapeUrl(
    opts: {
      url: string
    } & firecrawl.Params
  ) {
    const json = {
      ...opts
    }

    if (opts?.extractorOptions?.extractionSchema) {
      let schema = opts.extractorOptions.extractionSchema
      if (isZodSchema(schema)) {
        schema = zodToJsonSchema(schema)
      }

      json.extractorOptions = {
        mode: 'llm-extraction',
        ...opts.extractorOptions,
        extractionSchema: schema
      }
    }

    return this.ky.post('v0/scrape', { json }).json<firecrawl.ScrapeResponse>()
  }

  async search(
    opts: {
      query: string
    } & firecrawl.Params
  ) {
    return this.ky
      .post('v0/search', { json: opts })
      .json<firecrawl.SearchResponse>()
  }

  async crawlUrl({
    waitUntilDone = true,
    timeoutMs = 30_000,
    idempotencyKey,
    ...params
  }: {
    url: string
    waitUntilDone?: boolean
    timeoutMs?: number
    idempotencyKey?: string
  } & firecrawl.Params) {
    const res = await this.ky
      .post('v0/crawl', {
        json: params,
        timeout: timeoutMs,
        headers: idempotencyKey
          ? {
              'x-idempotency-key': idempotencyKey
            }
          : undefined
      })
      .json<firecrawl.CrawlResponse>()

    assert(res.jobId)
    if (waitUntilDone) {
      return this.waitForCrawlJob({ jobId: res.jobId, timeoutMs })
    }

    return res
  }

  async checkCrawlStatus(jobId: string) {
    assert(jobId)

    return this.ky
      .get(`v0/crawl/status/${jobId}`)
      .json<firecrawl.JobStatusResponse>()
  }

  async waitForCrawlJob({
    jobId,
    timeoutMs = 60_000
  }: {
    jobId: string
    timeoutMs?: number
  }) {
    assert(jobId)

    const start = Date.now()
    do {
      const res = await this.checkCrawlStatus(jobId)
      if (res.status === 'completed') {
        return res
      }

      if (!['active', 'paused', 'pending', 'queued'].includes(res.status)) {
        throw new Error(
          `Crawl job "${jobId}" failed or was stopped. Status: ${res.status}`
        )
      }

      if (Date.now() - start > timeoutMs) {
        throw new Error(
          `Timeout waiting for crawl job "${jobId}" to complete: ${res.status}`
        )
      }

      await delay(1000)
    } while (true)
  }
}
