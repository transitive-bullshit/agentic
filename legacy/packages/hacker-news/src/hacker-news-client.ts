import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace hackernews {
  export const HACKER_NEWS_API_BASE_URL = 'https://hacker-news.firebaseio.com'
  export const HACKER_NEWS_API_SEARCH_BASE_URL = 'https://hn.algolia.com'
  export const HACKER_NEWS_API_USER_AGENT =
    'Agentic (https://github.com/transitive-bullshit/agentic)'

  export type ItemType =
    | 'story'
    | 'comment'
    | 'ask'
    | 'job'
    | 'poll'
    | 'pollopt'

  export interface Item {
    id: number
    type: ItemType
    by: string
    time: number
    score: number
    title?: string
    url?: string
    text?: string
    descendants?: number
    parent?: number
    kids?: number[]
    parts?: number[]
  }

  export interface User {
    id: string
    created: number
    about: string
    karma: number
    submitted: number[]
  }

  export type SearchTag =
    | 'story'
    | 'comment'
    | 'poll'
    | 'pollopt'
    | 'show_hn'
    | 'ask_hn'
    | 'front_page'

  export type SearchNumericFilterField =
    | 'created_at_i'
    | 'points'
    | 'num_comments'
  export type SearchNumericFilterCondition = '<' | '<=' | '=' | '>=' | '>'

  export type SearchSortBy = 'relevance' | 'recency'

  export interface SearchOptions {
    /** Full-text search query */
    query?: string

    /** Filter by author's HN username */
    author?: string

    /** Filter by story id */
    story?: string

    /** Filter by type of item (story, comment, etc.) */
    tags?: Array<SearchTag>

    /** Filter by numeric range (created_at_i, points, or num_comments); (created_at_i is a timestamp in seconds) */
    numericFilters?: Array<`${SearchNumericFilterField}${SearchNumericFilterCondition}${number}`>

    /** Page number to return */
    page?: number

    /** Number of results to return per page */
    hitsPerPage?: number

    /** How to sort the results */
    sortBy?: SearchSortBy
  }

  export interface SearchItem {
    id: number
    created_at: string
    created_at_i: number
    title?: string
    url?: string
    author: string
    text: string | null
    points: number | null
    parent_id: number | null
    story_id: number | null
    type: ItemType
    children: SearchItem[]
    options?: any[]
  }

  export interface SearchUser {
    username: string
    about: string
    karma: number
  }

  export interface SearchResponse {
    hits: SearchHit[]
    page: number
    nbHits: number
    nbPages: number
    hitsPerPage: number
    query: string
    params: string
    processingTimeMS: number
    serverTimeMS: number
    processingTimingsMS?: any
  }

  export interface SearchHit {
    objectID: string
    url: string
    title: string
    author: string
    story_text?: string
    story_id?: number
    story_url?: string
    comment_text?: string
    points?: number
    num_comments?: number
    created_at: string
    created_at_i: number
    updated_at: string
    parts?: number[]
    children: number[]
    _tags: string[]
    _highlightResult: SearchHighlightResult
  }

  export interface SearchHighlightResult {
    author: Highlight
    title?: Highlight
    url?: Highlight
    comment_text?: Highlight
    story_title?: Highlight
    story_url?: Highlight
  }

  export interface Highlight {
    value: string
    matchLevel: string
    matchedWords: string[]
    fullyHighlighted?: boolean
  }

  export const searchTagSchema = z.union([
    z.literal('story'),
    z.literal('comment'),
    z.literal('poll'),
    z.literal('pollopt'),
    z.literal('show_hn'),
    z.literal('ask_hn'),
    z.literal('front_page')
  ])

  export const searchSortBySchema = z.union([
    z.literal('relevance'),
    z.literal('recency')
  ])

  export const searchOptionsSchema = z.object({
    query: z.string().optional().describe('Full-text search query'),
    author: z.string().optional().describe("Filter by author's HN username"),
    story: z.string().optional().describe('Filter by story id'),
    tags: z
      .array(hackernews.searchTagSchema)
      .optional()
      .describe(
        "Filter by type of item (story, comment, etc.). Multiple tags are AND'ed together."
      ),
    numericFilters: z
      .array(z.any())
      .optional()
      .describe(
        'Filter by numeric range (created_at_i, points, or num_comments); (created_at_i is a timestamp in seconds). Ex: numericFilters=points>100,num_comments>=1000'
      ),
    page: z.number().int().optional().describe('Page number to return'),
    hitsPerPage: z
      .number()
      .int()
      .optional()
      .describe('Number of results to return per page (defaults to 50)'),
    sortBy: hackernews.searchSortBySchema
      .optional()
      .describe('How to sort the results (defaults to relevancy)')
  })
}

/**
 * Basic client for the official Hacker News API.
 *
 * The normal API methods (`getItem`) use the official Firebase API, while the
 * search-prefixed methods use the more powerful Algolia API. The tradeoff is
 * that the official Firebase API is generally more reliable in my experience,
 * which is why we opted to support both.
 *
 * @see https://github.com/HackerNews/API
 * @see https://hn.algolia.com/api
 */
export class HackerNewsClient extends AIFunctionsProvider {
  protected readonly apiKy: KyInstance
  protected readonly apiSearchKy: KyInstance

  protected readonly apiBaseUrl: string
  protected readonly apiSearchBaseUrl: string
  protected readonly apiUserAgent: string

  constructor({
    apiBaseUrl = getEnv('HACKER_NEWS_API_BASE_URL') ??
      hackernews.HACKER_NEWS_API_BASE_URL,
    apiSearchBaseUrl = getEnv('HACKER_NEWS_API_SEARCH_BASE_URL') ??
      hackernews.HACKER_NEWS_API_SEARCH_BASE_URL,
    apiUserAgent = getEnv('HACKER_NEWS_API_USER_AGENT') ??
      hackernews.HACKER_NEWS_API_USER_AGENT,
    ky = defaultKy,
    timeoutMs = 60_000
  }: {
    apiBaseUrl?: string
    apiSearchBaseUrl?: string
    apiUserAgent?: string
    ky?: KyInstance
    timeoutMs?: number
  } = {}) {
    assert(apiBaseUrl, 'HackerNewsClient missing required "apiBaseUrl"')
    assert(
      apiSearchBaseUrl,
      'HackerNewsClient missing required "apiSearchBaseUrl"'
    )
    super()

    this.apiBaseUrl = apiBaseUrl
    this.apiSearchBaseUrl = apiSearchBaseUrl
    this.apiUserAgent = apiUserAgent

    this.apiKy = ky.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        'user-agent': apiUserAgent
      }
    })

    this.apiSearchKy = ky.extend({
      prefixUrl: apiSearchBaseUrl,
      timeout: timeoutMs,
      headers: {
        'user-agent': apiUserAgent
      }
    })
  }

  /** Fetches a HN story or comment by its ID. */
  @aiFunction({
    name: 'hacker_news_get_item',
    description: 'Fetches a HN story or comment by its ID.',
    inputSchema: z.object({ itemId: z.string() })
  })
  async getSearchItem(itemIdOrOpts: string | number | { itemId: string }) {
    const { itemId } =
      typeof itemIdOrOpts === 'string' || typeof itemIdOrOpts === 'number'
        ? { itemId: itemIdOrOpts }
        : itemIdOrOpts

    return this.apiSearchKy
      .get(`api/v1/items/${itemId}`)
      .json<hackernews.SearchItem>()
  }

  /**
   * Fetches a HN user by username.
   */
  @aiFunction({
    name: 'hacker_news_get_user',
    description: 'Fetches a HN user by username.',
    inputSchema: z.object({ username: z.string() })
  })
  async getSearchUser(usernameOrOpts: string | number | { username: string }) {
    const { username } =
      typeof usernameOrOpts === 'string' || typeof usernameOrOpts === 'number'
        ? { username: usernameOrOpts }
        : usernameOrOpts

    return this.apiSearchKy
      .get(`api/v1/users/${username}`)
      .json<hackernews.SearchUser>()
  }

  /** Searches HN for stories and comments matching the given query. */
  @aiFunction({
    name: 'hacker_news_search',
    description:
      'Searches HN for stories and comments matching the given query.',
    inputSchema: hackernews.searchOptionsSchema
  })
  async searchItems(queryOrOpts: string | hackernews.SearchOptions) {
    const {
      query,
      numericFilters,
      page,
      hitsPerPage,
      sortBy = 'relevance',
      ...opts
    } = typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    // Tags are AND'ed together; we do not support OR'ing tags via parentheses.
    const tags = [
      ...(opts.tags ?? []),
      opts.story ? `story_${opts.story}` : undefined,
      opts.author ? `author_${opts.author}` : undefined
    ].filter(Boolean)

    return this.apiSearchKy
      .get(sortBy === 'relevance' ? 'api/v1/search' : 'api/v1/search_by_date', {
        searchParams: sanitizeSearchParams(
          {
            query,
            tags,
            numericFilters,
            page,
            hitsPerPage
          },
          { csv: true }
        )
      })
      .json<hackernews.SearchResponse>()
  }

  /**
   * Fetches / searches the top stories currently on the front page of HN. This is the same as `hacker_news_search`, but with `tags: ["front_page"]` set to filter only by the current front page stories.
   */
  @aiFunction({
    name: 'hacker_news_get_top_stories',
    description:
      'Fetches / searches the top stories currently on the front page of HN. This is the same as `hacker_news_search`, but with `tags: ["front_page"]` set to filter only by the current front page stories.',
    inputSchema: hackernews.searchOptionsSchema
  })
  async getSearchTopStories(queryOrOpts: string | hackernews.SearchOptions) {
    const opts =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    return this.searchItems({
      ...opts,
      tags: ['front_page', ...(opts.tags ?? [])]
    })
  }

  async getItem(id: string | number) {
    return this.apiKy.get(`v0/item/${id}.json`).json<hackernews.Item>()
  }

  async getTopStories() {
    return this.apiKy.get('v0/topstories.json').json<number[]>()
  }

  async getNewStories() {
    return this.apiKy.get('v0/newstories.json').json<number[]>()
  }

  async getBestStories() {
    return this.apiKy.get('v0/beststories.json').json<number[]>()
  }
}
