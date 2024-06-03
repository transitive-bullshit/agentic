import defaultKy, { type KyInstance } from 'ky'

import { assert, getEnv } from '../utils.js'

export namespace exa {
  /**
   * Search options for performing a search query.
   */
  export type BaseSearchOptions = {
    /** Number of search results to return. Default 10. Max 10 for basic plans. */
    numResults?: number
    /** List of domains to include in the search. */
    includeDomains?: string[]
    /** List of domains to exclude in the search. */
    excludeDomains?: string[]
    /** Start date for results based on crawl date. */
    startCrawlDate?: string
    /** End date for results based on crawl date. */
    endCrawlDate?: string
    /** Start date for results based on published date. */
    startPublishedDate?: string
    /** End date for results based on published date. */
    endPublishedDate?: string
    /** A data category to focus on, with higher comprehensivity and data cleanliness. Currently, the only category is company. */
    category?: string
  }

  /**
   * Search options for performing a search query.
   */
  export type RegularSearchOptions = BaseSearchOptions & {
    /** If true, converts query to a Metaphor query. */
    useAutoprompt?: boolean
    /** Type of search, 'keyword' or 'neural'. */
    type?: string
  }

  /**
   * Options for finding similar links.
   */
  export type FindSimilarOptions = BaseSearchOptions & {
    /** If true, excludes links from the base domain of the input. */
    excludeSourceDomain?: boolean
  }

  /**
   * Search options for performing a search query.
   */
  export type ContentsOptions = {
    /** Options for retrieving text contents. */
    text?: TextContentsOptions | true
    /** Options for retrieving highlights. */
    highlights?: HighlightsContentsOptions | true
  }

  /**
   * Options for retrieving text from page.
   */
  export type TextContentsOptions = {
    /** The maximum number of characters to return. */
    maxCharacters?: number
    /** If true, includes HTML tags in the returned text. Default: false */
    includeHtmlTags?: boolean
  }

  /**
   * Options for retrieving highlights from page.
   * @typedef {Object} HighlightsContentsOptions
   */
  export type HighlightsContentsOptions = {
    /** The query string to use for highlights search. */
    query?: string
    /** The number of sentences to return for each highlight. */
    numSentences?: number
    /** The number of highlights to return for each URL. */
    highlightsPerUrl?: number
  }

  export type TextResponse = {
    /** Text from page */
    text: string
  }

  export type HighlightsResponse = {
    /** The highlights as an array of strings. */
    highlights: string[]
    /** The corresponding scores as an array of floats, 0 to 1 */
    highlightScores: number[]
  }

  export type Default<T extends {}, U> = [keyof T] extends [never] ? U : T

  /**
   * Depending on 'ContentsOptions', this yields either a 'TextResponse',
   * a 'HighlightsResponse', both, or an empty object.
   */
  export type ContentsResultComponent<T extends ContentsOptions> = Default<
    (T['text'] extends object | true ? TextResponse : {}) &
      (T['highlights'] extends object | true ? HighlightsResponse : {}),
    TextResponse
  >

  /**
   * Represents a search result object.
   */
  export type SearchResult<T extends ContentsOptions = ContentsOptions> = {
    /** The title of the search result. */
    title: string | null
    /** The URL of the search result. */
    url: string
    /** The estimated creation date of the content. */
    publishedDate?: string
    /** The author of the content, if available. */
    author?: string
    /** Similarity score between the query/url and the result. */
    score?: number
    /** The temporary ID for the document. */
    id: string
  } & ContentsResultComponent<T>

  /**
   * Represents a search response object.
   */
  export type SearchResponse<T extends ContentsOptions = ContentsOptions> = {
    /** The list of search results. */
    results: SearchResult<T>[]
    /** The autoprompt string, if applicable. */
    autopromptString?: string
  }
}

export class ExaClient {
  readonly apiKey: string
  readonly apiBaseUrl: string
  readonly ky: KyInstance

  constructor({
    apiKey = getEnv('EXA_API_KEY'),
    apiBaseUrl = getEnv('EXA_API_BASE_URL') ?? 'https://api.exa.ai',
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'ExaClient missing required "apiKey" (defaults to "EXA_API_KEY")'
    )

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl,
      headers: {
        'x-api-key': apiKey
      }
    })
  }

  /**
   * Performs an Exa search for the given query.
   */
  async search(opts: { query: string } & exa.RegularSearchOptions) {
    return this.ky.get('search', { json: opts }).json<exa.SearchResponse>()
  }

  /**
   * Performs a search with a Exa prompt-engineered query and returns the
   * contents of the documents.
   */
  async searchAndContents<T extends exa.ContentsOptions = exa.ContentsOptions>({
    query,
    text,
    highlights,
    ...rest
  }: { query: string } & exa.RegularSearchOptions & T) {
    return this.ky
      .post('search', {
        json: {
          query,
          contents:
            !text && !highlights
              ? { text: true }
              : {
                  ...(text ? { text } : {}),
                  ...(highlights ? { highlights } : {})
                },
          ...rest
        }
      })
      .json<exa.SearchResponse<T>>()
  }

  /**
   * Finds similar links to the provided URL.
   */
  async findSimilar(opts: { url: string } & exa.FindSimilarOptions) {
    return this.ky
      .post('findSimilar', { json: opts })
      .json<exa.SearchResponse>()
  }

  /**
   * Finds similar links to the provided URL and returns the contents of the
   * documents.
   */
  async findSimilarAndContents<
    T extends exa.ContentsOptions = exa.ContentsOptions
  >({
    url,
    text,
    highlights,
    ...rest
  }: { url: string } & exa.FindSimilarOptions & T) {
    return this.ky
      .post('findSimilar', {
        json: {
          url,
          contents:
            !text && !highlights
              ? { text: true }
              : {
                  ...(text ? { text } : {}),
                  ...(highlights ? { highlights } : {})
                },
          ...rest
        }
      })
      .json<exa.SearchResponse<T>>()
  }

  /**
   * Retrieves contents of documents based on a list of document IDs.
   */
  async getContents<T extends exa.ContentsOptions = exa.ContentsOptions>({
    ids,
    ...opts
  }: { ids: string | string[] | exa.SearchResult[] } & T) {
    let requestIds: string[]

    if (typeof ids === 'string') {
      requestIds = [ids]
    } else if (typeof ids[0] === 'string') {
      requestIds = ids as string[]
    } else {
      requestIds = (ids as exa.SearchResult[]).map((result) => result.id)
    }

    if (ids.length === 0) {
      throw new Error('Must provide at least one ID')
    }

    return this.ky
      .post('contents', {
        json: {
          ...opts,
          ids: requestIds
        }
      })
      .json<exa.SearchResponse<T>>()
  }
}
