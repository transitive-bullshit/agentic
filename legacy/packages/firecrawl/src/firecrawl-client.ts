import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
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
   * Configuration interface for FirecrawlClient.
   */
  export interface ClientConfig {
    apiKey?: string
    apiBaseUrl?: string
  }

  /**
   * Metadata for a Firecrawl document.
   */
  export interface DocumentMetadata {
    title?: string
    description?: string
    language?: string
    keywords?: string
    robots?: string
    ogTitle?: string
    ogDescription?: string
    ogUrl?: string
    ogImage?: string
    ogAudio?: string
    ogDeterminer?: string
    ogLocale?: string
    ogLocaleAlternate?: string[]
    ogSiteName?: string
    ogVideo?: string
    dctermsCreated?: string
    dcDateCreated?: string
    dcDate?: string
    dctermsType?: string
    dcType?: string
    dctermsAudience?: string
    dctermsSubject?: string
    dcSubject?: string
    dcDescription?: string
    dctermsKeywords?: string
    modifiedTime?: string
    publishedTime?: string
    articleTag?: string
    articleSection?: string
    sourceURL?: string
    statusCode?: number
    error?: string
    [key: string]: any
  }

  /**
   * Document interface for Firecrawl.
   */
  export interface Document<
    T = any,
    ActionsSchema extends ActionsResult | never = never
  > {
    url?: string
    markdown?: string
    html?: string
    rawHtml?: string
    links?: string[]
    extract?: T
    json?: T
    screenshot?: string
    metadata?: DocumentMetadata
    actions: ActionsSchema
    title?: string
    description?: string
  }

  /**
   * Parameters for scraping operations.
   * Defines the options and configurations available for scraping web content.
   */
  export interface ScrapeOptions {
    formats?: (
      | 'markdown'
      | 'html'
      | 'rawHtml'
      | 'content'
      | 'links'
      | 'screenshot'
      | 'screenshot@fullPage'
      | 'extract'
      | 'json'
    )[]
    headers?: Record<string, string>
    includeTags?: string[]
    excludeTags?: string[]
    onlyMainContent?: boolean
    waitFor?: number
    timeout?: number
    location?: {
      country?: string
      languages?: string[]
    }
    mobile?: boolean
    skipTlsVerification?: boolean
    removeBase64Images?: boolean
    blockAds?: boolean
    proxy?: 'basic' | 'stealth'
  }

  /**
   * Parameters for scraping operations.
   */
  export interface ScrapeParams<
    LLMSchema extends z.ZodSchema = any,
    ActionsSchema extends Action[] | undefined = undefined
  > {
    formats?: (
      | 'markdown'
      | 'html'
      | 'rawHtml'
      | 'content'
      | 'links'
      | 'screenshot'
      | 'screenshot@fullPage'
      | 'extract'
      | 'json'
    )[]
    headers?: Record<string, string>
    includeTags?: string[]
    excludeTags?: string[]
    onlyMainContent?: boolean
    waitFor?: number
    timeout?: number
    location?: {
      country?: string
      languages?: string[]
    }
    mobile?: boolean
    skipTlsVerification?: boolean
    removeBase64Images?: boolean
    blockAds?: boolean
    proxy?: 'basic' | 'stealth'
    extract?: {
      prompt?: string
      schema?: LLMSchema
      systemPrompt?: string
    }
    jsonOptions?: {
      prompt?: string
      schema?: LLMSchema
      systemPrompt?: string
    }
    actions?: ActionsSchema
  }

  export type Action =
    | {
        type: 'wait'
        milliseconds?: number
        selector?: string
      }
    | {
        type: 'click'
        selector: string
      }
    | {
        type: 'screenshot'
        fullPage?: boolean
      }
    | {
        type: 'write'
        text: string
      }
    | {
        type: 'press'
        key: string
      }
    | {
        type: 'scroll'
        direction?: 'up' | 'down'
        selector?: string
      }
    | {
        type: 'scrape'
      }
    | {
        type: 'executeJavascript'
        script: string
      }

  export interface ActionsResult {
    screenshots: string[]
  }

  /**
   * Response interface for scraping operations.
   */
  export interface ScrapeResponse<
    LLMResult = any,
    ActionsSchema extends ActionsResult | never = never
  > extends Document<LLMResult, ActionsSchema> {
    success: true
    warning?: string
    error?: string
  }

  /**
   * Parameters for search operations.
   */
  export interface SearchParams {
    limit?: number
    tbs?: string
    filter?: string
    lang?: string
    country?: string
    location?: string
    origin?: string
    timeout?: number
    scrapeOptions?: ScrapeParams
  }

  /**
   * Response interface for search operations.
   */
  export interface SearchResponse {
    success: boolean
    data: Document[]
    warning?: string
    error?: string
  }

  /**
   * Parameters for crawling operations.
   */
  export interface CrawlParams {
    includePaths?: string[]
    excludePaths?: string[]
    maxDepth?: number
    maxDiscoveryDepth?: number
    limit?: number
    allowBackwardLinks?: boolean
    allowExternalLinks?: boolean
    ignoreSitemap?: boolean
    scrapeOptions?: ScrapeParams
    webhook?:
      | string
      | {
          url: string
          headers?: Record<string, string>
          metadata?: Record<string, string>
          events?: ['completed', 'failed', 'page', 'started'][number][]
        }
    deduplicateSimilarURLs?: boolean
    ignoreQueryParameters?: boolean
    regexOnFullURL?: boolean
  }

  /**
   * Response interface for crawling operations.
   */
  export interface CrawlResponse {
    id?: string
    url?: string
    success: true
    error?: string
  }

  /**
   * Response interface for job status checks.
   */
  export interface CrawlStatusResponse {
    success: true
    status: 'scraping' | 'completed' | 'failed' | 'cancelled'
    completed: number
    total: number
    creditsUsed: number
    expiresAt: Date
    next?: string
    data: Document[]
  }

  /**
   * Response interface for crawl errors.
   */
  export interface CrawlErrorsResponse {
    errors: {
      id: string
      timestamp?: string
      url: string
      error: string
    }[]
    robotsBlocked: string[]
  }

  /**
   * Error response interface.
   */
  export interface ErrorResponse {
    success: false
    error: string
  }

  /**
   * Custom error class for Firecrawl.
   */
  export class FirecrawlError extends Error {
    statusCode: number
    details?: any

    constructor(message: string, statusCode: number, details?: any) {
      super(message)
      this.statusCode = statusCode
      this.details = details
    }
  }

  /**
   * Parameters for extracting information from URLs.
   */
  export interface ExtractParams<T extends z.ZodSchema = any> {
    prompt: string
    schema?: T
    enableWebSearch?: boolean
    ignoreSitemap?: boolean
    includeSubdomains?: boolean
    showSources?: boolean
    scrapeOptions?: ScrapeOptions
  }

  /**
   * Response interface for extracting information from URLs.
   * Defines the structure of the response received after extracting information from URLs.
   */
  export interface ExtractResponse<T = any> {
    success: boolean
    id?: string
    data: T
    error?: string
    warning?: string
    sources?: string[]
  }

  /**
   * Response interface for extract status operations.
   */
  export interface ExtractStatusResponse<T = any> {
    success: boolean
    status: 'processing' | 'completed' | 'failed'
    data?: T
    error?: string
    expiresAt?: string
  }

  /**
   * Parameters for LLMs.txt generation operations.
   */
  export interface GenerateLLMsTextParams {
    /**
     * Maximum number of URLs to process (1-100)
     * @default 10
     */
    maxUrls?: number
    /**
     * Whether to show the full LLMs-full.txt in the response
     * @default false
     */
    showFullText?: boolean
  }

  /**
   * Response interface for LLMs.txt generation operations.
   */
  export interface GenerateLLMsTextResponse {
    success: boolean
    id: string
  }

  /**
   * Status response interface for LLMs.txt generation operations.
   */
  export interface GenerateLLMsTextStatusResponse {
    success: boolean
    data: {
      llmstxt: string
      llmsfulltxt?: string
    }
    status: 'processing' | 'completed' | 'failed'
    error?: string
    expiresAt: string
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
        Authorization: `Bearer ${this.apiKey}`,
        'X-Origin': 'agentic',
        'X-Origin-Type': 'integration'
      }
    })
  }

  /**
   * Scrape the contents of a URL.
   */
  @aiFunction({
    name: 'firecrawl_scrape_url',
    description: 'Scrape the contents of a URL.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL to scrape.')
    })
  })
  async scrapeUrl<
    T extends z.ZodSchema,
    ActionsSchema extends firecrawl.Action[] | undefined = undefined
  >(
    orlOrOpts:
      | string
      | ({ url: string } & firecrawl.ScrapeParams<T, ActionsSchema>)
  ): Promise<
    | firecrawl.ScrapeResponse<
        z.infer<T>,
        ActionsSchema extends firecrawl.Action[]
          ? firecrawl.ActionsResult
          : never
      >
    | firecrawl.ErrorResponse
  > {
    const { url, ...params } =
      typeof orlOrOpts === 'string' ? { url: orlOrOpts } : orlOrOpts
    let jsonData: any = { url, ...params }

    if (jsonData?.extract?.schema) {
      let schema = jsonData.extract.schema
      try {
        schema = zodToJsonSchema(schema)
      } catch {}
      jsonData = {
        ...jsonData,
        extract: {
          ...jsonData.extract,
          schema
        }
      }
    }

    if (jsonData?.jsonOptions?.schema) {
      let schema = jsonData.jsonOptions.schema
      try {
        schema = zodToJsonSchema(schema)
      } catch {}
      jsonData = {
        ...jsonData,
        jsonOptions: {
          ...jsonData.jsonOptions,
          schema
        }
      }
    }

    try {
      const response = await this.postRequest('v1/scrape', jsonData)
      return response
    } catch (err) {
      if (err instanceof firecrawl.FirecrawlError) {
        throw err
      }
      throw new firecrawl.FirecrawlError(
        err instanceof Error ? err.message : 'Unknown error',
        500
      )
    }
  }

  /**
   * Searches using the Firecrawl API.
   */
  @aiFunction({
    name: 'firecrawl_search',
    description: 'Searches the internet for the given query.',
    inputSchema: z.object({
      query: z.string().describe('Search query.')
    })
  })
  async search(
    queryOrOpts: string | ({ query: string } & firecrawl.SearchParams)
  ): Promise<firecrawl.SearchResponse> {
    const { query, ...params } =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    const jsonData = {
      query,
      limit: params?.limit ?? 5,
      tbs: params?.tbs,
      filter: params?.filter,
      lang: params?.lang ?? 'en',
      country: params?.country ?? 'us',
      location: params?.location,
      origin: params?.origin ?? 'api',
      timeout: params?.timeout ?? 60_000,
      scrapeOptions: params?.scrapeOptions ?? { formats: [] }
    }

    try {
      const response = await this.postRequest('v1/search', jsonData)
      if (response.success) {
        return {
          success: true,
          data: response.data as firecrawl.Document[],
          warning: response.warning
        }
      } else {
        throw new firecrawl.FirecrawlError(
          `Failed to search. Error: ${response.error}`,
          500
        )
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new firecrawl.FirecrawlError(
          `Request failed with status code ${err.response.status}. Error: ${err.response.data.error} ${err.response.data.details ? ` - ${JSON.stringify(err.response.data.details)}` : ''}`,
          err.response.status
        )
      } else {
        throw new firecrawl.FirecrawlError(err.message, 500)
      }
    }
  }

  /**
   * Initiates a crawl job for a URL.
   */
  @aiFunction({
    name: 'firecrawl_crawl_url',
    description: 'Initiates a crawl job for a URL.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL to crawl.')
    })
  })
  async crawlUrl(
    urlOrOpts: string | ({ url: string } & firecrawl.CrawlParams)
  ): Promise<firecrawl.CrawlResponse | firecrawl.ErrorResponse> {
    const { url, ...params } =
      typeof urlOrOpts === 'string' ? { url: urlOrOpts } : urlOrOpts
    const jsonData = { url, ...params }

    try {
      const response = await this.postRequest('v1/crawl', jsonData)
      if (response.success) {
        return response
      } else {
        throw new firecrawl.FirecrawlError(
          `Failed to start crawl job. Error: ${response.error}`,
          500
        )
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new firecrawl.FirecrawlError(
          `Request failed with status code ${err.response.status}. Error: ${err.response.data.error} ${err.response.data.details ? ` - ${JSON.stringify(err.response.data.details)}` : ''}`,
          err.response.status
        )
      } else {
        throw new firecrawl.FirecrawlError(err.message, 500)
      }
    }
  }

  /**
   * Checks the status of a crawl job.
   */
  async checkCrawlStatus(
    id: string
  ): Promise<firecrawl.CrawlStatusResponse | firecrawl.ErrorResponse> {
    if (!id) {
      throw new firecrawl.FirecrawlError('No crawl ID provided', 400)
    }

    try {
      const response = await this.getRequest(`v1/crawl/${id}`)
      if (response.success) {
        return response
      } else {
        throw new firecrawl.FirecrawlError(
          `Failed to check crawl status. Error: ${response.error}`,
          500
        )
      }
    } catch (err: any) {
      throw new firecrawl.FirecrawlError(err.message, 500)
    }
  }

  /**
   * Returns information about crawl errors.
   */
  async checkCrawlErrors(
    id: string
  ): Promise<firecrawl.CrawlErrorsResponse | firecrawl.ErrorResponse> {
    try {
      const response = await this.getRequest(`v1/crawl/${id}/errors`)
      if (response.errors) {
        return response
      } else {
        throw new firecrawl.FirecrawlError(
          `Failed to check crawl errors. Error: ${response.error}`,
          500
        )
      }
    } catch (err: any) {
      throw new firecrawl.FirecrawlError(err.message, 500)
    }
  }

  /**
   * Cancels a crawl job.
   */
  async cancelCrawl(id: string): Promise<firecrawl.ErrorResponse> {
    try {
      const response = await this.deleteRequest(`v1/crawl/${id}`)
      if (response.status) {
        return response
      } else {
        throw new firecrawl.FirecrawlError(
          `Failed to cancel crawl job. Error: ${response.error}`,
          500
        )
      }
    } catch (err: any) {
      throw new firecrawl.FirecrawlError(err.message, 500)
    }
  }

  /**
   * Extracts structured data from URLs using LLMs.
   *
   * @param urls - Array of URLs to extract data from
   * @param params - Additional parameters for the extract request
   * @returns The response from the extract operation
   */
  async extract<T extends z.ZodSchema>(
    urls: string[],
    params: firecrawl.ExtractParams<T>
  ): Promise<firecrawl.ExtractResponse<z.infer<T>>> {
    const jsonData = {
      urls,
      ...params,
      schema: params.schema ? zodToJsonSchema(params.schema) : undefined
    }

    try {
      const response = await this.postRequest('v1/extract', jsonData)
      if (!response.success) {
        throw new firecrawl.FirecrawlError(
          response.error || 'Extract operation failed',
          500
        )
      }
      return response
    } catch (err) {
      if (err instanceof firecrawl.FirecrawlError) {
        throw err
      }
      throw new firecrawl.FirecrawlError(
        err instanceof Error ? err.message : 'Unknown error',
        500
      )
    }
  }

  /**
   * Checks the status of an extract operation.
   */
  async checkExtractStatus<T = any>(
    id: string
  ): Promise<firecrawl.ExtractStatusResponse<T>> {
    if (!id) {
      throw new firecrawl.FirecrawlError('No extract ID provided', 400)
    }

    try {
      const response = await this.getRequest(`v1/extract/${id}`)
      return response
    } catch (err) {
      if (err instanceof firecrawl.FirecrawlError) {
        throw err
      }
      throw new firecrawl.FirecrawlError(
        err instanceof Error ? err.message : 'Unknown error',
        500
      )
    }
  }

  /**
   * Generates LLMs.txt for a given URL.
   */
  async generateLLMsText(
    url: string,
    params?: firecrawl.GenerateLLMsTextParams
  ): Promise<
    firecrawl.GenerateLLMsTextStatusResponse | firecrawl.ErrorResponse
  > {
    const jsonData = {
      url,
      ...params
    }

    try {
      const response = await this.postRequest('v1/llmstxt', jsonData)
      return response
    } catch (err) {
      if (err instanceof firecrawl.FirecrawlError) {
        throw err
      }
      throw new firecrawl.FirecrawlError(
        err instanceof Error ? err.message : 'Unknown error',
        500
      )
    }
  }

  /**
   * Sends a POST request.
   */
  protected async postRequest(path: string, data: any): Promise<any> {
    try {
      const response = await this.ky.post(path, { json: data })
      return await response.json()
    } catch (err) {
      if (err instanceof Error) {
        const response = await (err as any).response?.json()
        if (response?.error) {
          throw new firecrawl.FirecrawlError(
            `Request failed. Error: ${response.error}`,
            (err as any).response?.status ?? 500,
            response?.details
          )
        }
      }
      throw err
    }
  }

  /**
   * Sends a GET request.
   */
  protected async getRequest(path: string): Promise<any> {
    try {
      const response = await this.ky.get(path)
      return await response.json()
    } catch (err) {
      if (err instanceof Error) {
        const response = await (err as any).response?.json()
        if (response?.error) {
          throw new firecrawl.FirecrawlError(
            `Request failed. Error: ${response.error}`,
            (err as any).response?.status ?? 500,
            response?.details
          )
        }
      }
      throw err
    }
  }

  /**
   * Sends a DELETE request.
   */
  protected async deleteRequest(path: string): Promise<any> {
    try {
      const response = await this.ky.delete(path)
      return await response.json()
    } catch (err) {
      if (err instanceof Error) {
        const response = await (err as any).response?.json()
        if (response?.error) {
          throw new firecrawl.FirecrawlError(
            `Request failed. Error: ${response.error}`,
            (err as any).response?.status ?? 500,
            response?.details
          )
        }
      }
      throw err
    }
  }
}
