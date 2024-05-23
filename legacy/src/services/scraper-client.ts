import defaultKy, { type KyInstance } from 'ky'

import { assert, getEnv } from '../utils.js'

export namespace scraper {
  export type ScrapeResult = {
    author: string
    byline: string
    /** The HTML for the main content of the page. */
    content: string
    description: string
    imageUrl: string
    lang: string
    length: number
    logoUrl: string
    /** The text for the main content of the page in markdown format. */
    markdownContent: string
    publishedTime: string
    /** The raw HTML response from the server. */
    rawHtml: string
    siteName: string
    /** The text for the main content of the page. */
    textContent: string
    title: string
  }
}

/**
 * This is a single endpoint API for scraping websites. It returns the HTML,
 * markdown, and plaintext for main body content of the page, as well as
 * metadata like title and description.
 *
 * It tries the simplest and fastest methods first, and falls back to slower
 * proxies and JavaScript rendering if needed.
 */
export class ScraperClient {
  readonly apiBaseUrl: string
  readonly ky: KyInstance

  constructor({
    apiBaseUrl = getEnv('SCRAPER_API_BASE_URL'),
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(apiBaseUrl, 'ScraperClient apiBaseUrl is required')

    this.apiBaseUrl = apiBaseUrl
    this.ky = ky.extend({ prefixUrl: this.apiBaseUrl })
  }

  async scrapeUrl(
    url: string,
    {
      timeout = 60_000
    }: {
      timeout?: number
    } = {}
  ): Promise<scraper.ScrapeResult> {
    return this.ky
      .post('scrape', {
        json: { url },
        timeout
      })
      .json()
  }
}
