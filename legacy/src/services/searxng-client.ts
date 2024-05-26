import defaultKy, { type KyInstance } from 'ky'

import { assert, getEnv, omit, pick, pruneUndefined } from '../utils.js'

export namespace searxng {
  export interface SearchOptions {
    query: string
    categories?: string[]
    engines?: string[]
    language?: string
    pageno?: number
  }

  export interface SearchResult {
    title: string
    url: string
    img_src?: string
    thumbnail_src?: string
    thumbnail?: string
    content?: string
    author?: string
    iframe_src?: string
  }

  export interface SearchResponse {
    results: SearchResult[]
    suggestions: string[]
  }
}

/**
 * @see https://docs.searxng.org
 */
export class SearxngClient {
  readonly ky: KyInstance
  readonly apiKey: string
  readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('SEARXNG_API_KEY'),
    apiBaseUrl = getEnv('SEARXNG_API_BASE_URL'),
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'SearxngClient missing required "apiKey" (defaults to "SEARXNG_API_KEY")'
    )
    assert(
      apiBaseUrl,
      'SearxngClient missing required "apiBaseUrl" (defaults to "SEARXNG_API_BASE_URL")'
    )

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({ prefixUrl: apiBaseUrl })
  }

  async search(opts: searxng.SearchOptions): Promise<searxng.SearchResponse> {
    const res = await this.ky
      .get('search', {
        searchParams: pruneUndefined({
          ...omit(opts, 'categories', 'engines'),
          categories: opts.categories?.join(','),
          engines: opts.categories?.join(','),
          format: 'json'
        })
      })
      .json<searxng.SearchResponse>()

    return pick(res, 'results', 'suggestions')
  }
}
