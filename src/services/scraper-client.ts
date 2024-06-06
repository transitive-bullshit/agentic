import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

import { aiFunction, AIFunctionsProvider } from '../fns.js'
import { assert, getEnv, omit } from '../utils.js'

export namespace scraper {
  export type ScrapeResult = {
    author: string
    byline: string
    description: string
    imageUrl: string
    lang: string
    length: number
    logoUrl: string
    publishedTime: string
    siteName: string
    title: string

    /** The HTML for the main content of the page. */
    content: string

    /** The raw HTML response from the server. */
    rawHtml: string

    /** The text for the main content of the page in markdown format. */
    markdownContent: string

    /** The text for the main content of the page. */
    textContent: string
  }
}

/**
 * This is a single endpoint API for scraping websites. It returns the HTML,
 * markdown, and plaintext for main body content of the page, as well as
 * metadata like title and description.
 *
 * It tries the simplest and fastest methods first, and falls back to slower
 * proxies and JavaScript rendering if needed.
 *
 * @note This service is currently available only via a closed beta.
 */
export class ScraperClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl = getEnv('SCRAPER_API_BASE_URL'),
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiBaseUrl,
      'ScraperClient missing required "apiBaseUrl" (defaults to "SCRAPER_API_BASE_URL")'
    )
    super()

    this.apiBaseUrl = apiBaseUrl
    this.ky = ky.extend({ prefixUrl: this.apiBaseUrl })
  }

  @aiFunction({
    name: 'scrape_url',
    description: 'Scrapes the content of a single URL.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the web page to scrape'),
      format: z
        .enum(['html', 'markdown', 'plaintext'])
        .default('markdown')
        .optional()
        .describe(
          'Whether to return the content as HTML, markdown, or plaintext.'
        )
    })
  })
  async scrapeUrl(
    urlOrOpts:
      | string
      | {
          url: string
          format?: 'html' | 'markdown' | 'plaintext'
          timeoutMs?: number
        }
  ): Promise<Partial<scraper.ScrapeResult>> {
    const {
      timeoutMs = 60_000,
      format = 'markdown',
      ...opts
    } = typeof urlOrOpts === 'string' ? { url: urlOrOpts } : urlOrOpts

    const res = await this.ky
      .post('scrape', {
        json: opts,
        timeout: timeoutMs
      })
      .json<scraper.ScrapeResult>()

    switch (format) {
      case 'html':
        return omit(res, 'markdownContent', 'textContent', 'rawHtml')

      case 'markdown':
        return omit(res, 'textContent', 'rawHtml', 'content')

      case 'plaintext':
        return omit(res, 'markdownContent', 'rawHtml', 'content')

      default:
        return res
    }
  }
}
