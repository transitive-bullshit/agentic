import defaultKy, { type KyInstance } from 'ky'
import z from 'zod'

import { assert, delay, getEnv } from '../utils.js'
import { zodToJsonSchema } from '../zod-to-json-schema.js'

export namespace firecrawl {
  /**
   * Generic parameter interface.
   */
  export interface Params {
    [key: string]: any
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
    data?: any
    error?: string
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
 * @see https://www.firecrawl.dev
 */
export class FirecrawlClient {
  readonly ky: KyInstance
  readonly apiKey: string
  readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('FIRECRAWL_API_KEY'),
    apiBaseUrl = getEnv('FIRECRAWL_API_BASE_URL') ??
      'https://api.firecrawl.dev',
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
    assert(
      apiBaseUrl,
      'FirecrawlClient missing required "apiBaseUrl" (defaults to "FIRECRAWL_API_BASE_URL")'
    )

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    })
  }

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
      if (schema instanceof z.ZodSchema) {
        schema = zodToJsonSchema(schema)
      }

      json.extractorOptions = {
        mode: 'llm-extraction',
        ...opts.extractorOptions,
        extractionSchema: schema
      }
    }

    return this.ky
      .post('v0/scrapeUrl', { json })
      .json<firecrawl.ScrapeResponse>()
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
    timeoutMs = 30_000
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
