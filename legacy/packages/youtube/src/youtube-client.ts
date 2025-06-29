import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace youtube {
  export const API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

  export interface SearchOptions {
    query: string
    maxResults?: number
    pageToken?: string
    channelId?: string
    channelType?: 'any' | 'show'
    eventType?: 'live' | 'completed' | 'upcoming'
    location?: string
    locationRadius?: string
    order?:
      | 'relevance'
      | 'date'
      | 'rating'
      | 'title'
      | 'videoCount'
      | 'viewCount'
    // The value is an RFC 3339 formatted date-time value (1970-01-01T00:00:00Z).
    publishedAfter?: string
    publishedBefore?: string
    // The regionCode parameter instructs the API to return search results for videos that can be viewed in the specified country. The parameter value is an ISO 3166-1 alpha-2 country code.
    regionCode?: string
    relevanceLanguage?: string
    safeSearch?: 'moderate' | 'none' | 'strict'
    topicId?: string
    videoCaption?: 'any' | 'closedCaption' | 'none'
    videoCategoryId?: string
    videoDefinition?: 'any' | 'high' | 'standard'
    videoDimension?: '2d' | '3d' | 'any'
    videoDuration?: 'any' | 'long' | 'medium' | 'short'
    videoEmbeddable?: 'any' | 'true'
    videoLicense?: 'any' | 'creativeCommon' | 'youtube'
    videoPaidProductPlacement?: 'any' | 'true'
    videoSyndicated?: 'any' | 'true'
    videoType?: 'any' | 'episode' | 'movie'
  }

  export type SearchType = 'video' | 'channel' | 'playlist'

  export interface SearchVideosResult {
    videoId: string
    title: string
    description: string
    thumbnail: string
    channelId: string
    channelTitle: string
    publishedAt: string
    url: string
  }

  export interface SearchChannelsResult {
    channelId: string
    title: string
    description: string
    thumbnail: string
    publishedAt: string
    url: string
  }

  export type SearchResponse<T extends SearchType> = {
    results: T extends 'video'
      ? SearchVideosResult[]
      : T extends 'channel'
        ? SearchChannelsResult[]
        : never
    totalResults: number
    prevPageToken?: string
    nextPageToken?: string
  }

  export type SearchVideosResponse = SearchResponse<'video'>
  export type SearchChannelsResponse = SearchResponse<'channel'>
}

/**
 * YouTube data API v3 client.
 *
 * @see https://developers.google.com/youtube/v3
 */
export class YouTubeClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('YOUTUBE_API_KEY'),
    apiBaseUrl = youtube.API_BASE_URL,
    timeoutMs = 30_000,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'YouTubeClient missing required "apiKey" (defaults to "YOUTUBE_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl,
      timeout: timeoutMs
    })
  }

  /**
   * Searches for videos on YouTube.
   *
   * @see https://developers.google.com/youtube/v3/docs/search/list
   */
  @aiFunction({
    name: 'youtube_search_videos',
    description: 'Searches for videos on YouTube.',
    inputSchema: z.object({
      query: z.string().describe(`The query to search for.

Your request can optionally use the Boolean NOT (-) and OR (|) operators to exclude videos or to find videos that are associated with one of several search terms. For example, to search for videos matching either "boating" or "sailing", set the query parameter value to boating|sailing. Similarly, to search for videos matching either "boating" or "sailing" but not "fishing", set the query parameter value to boating|sailing -fishing.`),
      maxResults: z
        .number()
        .int()
        .optional()
        .describe('The maximum number of results to return (defaults to 5).')
    })
  })
  async searchVideos(
    queryOrOpts: string | youtube.SearchOptions
  ): Promise<youtube.SearchVideosResponse> {
    const opts =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    const data = await this._search({
      ...opts,
      type: 'video'
    })

    const results = (data.items || [])
      .map((item: any) => {
        const snippet = item.snippet
        if (!snippet) return null

        const videoId = item.id?.videoId
        if (!videoId) return null

        const thumbnails = snippet.thumbnails
        if (!thumbnails) return null

        return {
          videoId,
          title: snippet.title,
          description: snippet.description,
          // https://i.ytimg.com/vi/MRtg6A1f2Ko/maxresdefault.jpg
          thumbnail:
            thumbnails.high?.url ||
            thumbnails.medium?.url ||
            thumbnails.default?.url ||
            `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          channelId: snippet.channelId,
          channelTitle: snippet.channelTitle,
          publishedAt: snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${videoId}`
        }
      })
      .filter(Boolean)

    return {
      results,
      totalResults: data.pageInfo?.totalResults || 0,
      prevPageToken: data.prevPageToken,
      nextPageToken: data.nextPageToken
    }
  }

  /**
   * Searches for channels on YouTube.
   *
   * @see https://developers.google.com/youtube/v3/docs/search/list
   */
  @aiFunction({
    name: 'youtube_search_channels',
    description: 'Searches for channels on YouTube.',
    inputSchema: z.object({
      query: z.string().describe('The query to search for.'),
      maxResults: z
        .number()
        .int()
        .optional()
        .describe('The maximum number of results to return (defaults to 5).')
    })
  })
  async searchChannels(
    queryOrOpts: string | youtube.SearchOptions
  ): Promise<youtube.SearchChannelsResponse> {
    const opts =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    const data = await this._search({
      ...opts,
      type: 'channel'
    })

    const results = (data.items || [])
      .map((item: any) => {
        const snippet = item.snippet
        if (!snippet) return null

        const channelId = item.id?.channelId
        if (!channelId) return null

        const thumbnails = snippet.thumbnails
        if (!thumbnails) return null

        return {
          channelId,
          title: snippet.title,
          description: snippet.description,
          thumbnail:
            thumbnails.high?.url ||
            thumbnails.medium?.url ||
            thumbnails.default?.url,
          publishedAt: snippet.publishedAt,
          url: `https://www.youtube.com/channel/${channelId}`
        }
      })
      .filter(Boolean)

    return {
      results,
      totalResults: data.pageInfo?.totalResults || 0,
      prevPageToken: data.prevPageToken,
      nextPageToken: data.nextPageToken
    }
  }

  protected async _search(
    opts: youtube.SearchOptions & {
      type: youtube.SearchType
    }
  ) {
    const { query, ...params } = opts

    return this.ky
      .get('search', {
        searchParams: sanitizeSearchParams({
          q: query,
          part: 'snippet',
          maxResults: 5,
          ...params,
          key: this.apiKey
        })
      })
      .json<any>()
  }
}
