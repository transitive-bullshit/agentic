import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

export namespace wikipedia {
  // Allow up to 200 requests per second by default.
  export const throttle = pThrottle({
    limit: 200,
    interval: 1000
  })

  export interface SearchOptions {
    query: string
    limit?: number
  }

  export interface PageSearchResponse {
    pages: Page[]
  }

  export interface Page {
    id: number
    key: string
    title: string
    matched_title: null
    excerpt: string
    description: null | string
    thumbnail: Thumbnail | null
  }

  export interface Thumbnail {
    url: string
    width: number
    height: number
    mimetype: string
    duration: null
  }

  export interface PageSummaryOptions {
    title: string
    redirect?: boolean
    acceptLanguage?: string
  }

  export interface PageSummaryResponse {
    ns?: number
    index?: number
    type: string
    title: string
    displaytitle: string
    namespace: { id: number; text: string }
    wikibase_item: string
    titles: { canonical: string; normalized: string; display: string }
    pageid: number
    thumbnail: {
      source: string
      width: number
      height: number
    }
    originalimage: {
      source: string
      width: number
      height: number
    }
    lang: string
    dir: string
    revision: string
    tid: string
    timestamp: string
    description: string
    description_source: string
    content_urls: {
      desktop: {
        page: string
        revisions: string
        edit: string
        talk: string
      }
      mobile: {
        page: string
        revisions: string
        edit: string
        talk: string
      }
    }
    extract: string
    extract_html: string
    normalizedtitle?: string
    coordinates?: {
      lat: number
      lon: number
    }
  }
}

/**
 * Basic Wikipedia API client for searching wiki pages and resolving page data.
 *
 * @see https://www.mediawiki.org/wiki/API
 */
export class WikipediaClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiBaseUrl: string
  protected readonly apiUserAgent: string

  constructor({
    apiBaseUrl = getEnv('WIKIPEDIA_API_BASE_URL') ??
      'https://en.wikipedia.org/api/rest_v1',
    apiUserAgent = getEnv('WIKIPEDIA_API_USER_AGENT') ??
      'Agentic (https://github.com/transitive-bullshit/agentic)',
    throttle = true,
    ky = defaultKy
  }: {
    apiBaseUrl?: string
    apiUserAgent?: string
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(apiBaseUrl, 'WikipediaClient missing required "apiBaseUrl"')
    assert(apiUserAgent, 'WikipediaClient missing required "apiUserAgent"')
    super()

    this.apiBaseUrl = apiBaseUrl
    this.apiUserAgent = apiUserAgent

    const throttledKy = throttle ? throttleKy(ky, wikipedia.throttle) : ky

    this.ky = throttledKy.extend({
      headers: {
        'api-user-agent': apiUserAgent
      }
    })
  }

  @aiFunction({
    name: 'wikipedia_search',
    description: 'Searches Wikipedia for pages matching the given query.',
    inputSchema: z.object({
      query: z.string().describe('Search query')
    })
  })
  async search({ query, ...opts }: wikipedia.SearchOptions) {
    return (
      // https://www.mediawiki.org/wiki/API:REST_API
      this.ky
        .get('https://en.wikipedia.org/w/rest.php/v1/search/page', {
          searchParams: { q: query, ...opts }
        })
        .json<wikipedia.PageSearchResponse>()
    )
  }

  @aiFunction({
    name: 'wikipedia_get_page_summary',
    description: 'Gets a summary of the given Wikipedia page.',
    inputSchema: z.object({
      title: z.string().describe('Wikipedia page title'),
      acceptLanguage: z
        .string()
        .optional()
        .default('en-us')
        .describe('Locale code for the language to use.')
    })
  })
  async getPageSummary({
    title,
    acceptLanguage = 'en-us',
    redirect = true,
    ...opts
  }: wikipedia.PageSummaryOptions) {
    title = title.trim().replaceAll(' ', '_')

    // https://en.wikipedia.org/api/rest_v1/
    return this.ky
      .get(`page/summary/${title}`, {
        prefixUrl: this.apiBaseUrl,
        searchParams: { redirect, ...opts },
        headers: {
          'accept-language': acceptLanguage
        }
      })
      .json<wikipedia.PageSummaryResponse>()
  }
}
