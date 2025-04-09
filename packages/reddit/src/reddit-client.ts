import {
  aiFunction,
  AIFunctionsProvider,
  pick,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace reddit {
  export const BASE_URL = 'https://www.reddit.com'

  export interface Post {
    id: string
    name: string // name is `t3_<id>`
    title: string
    subreddit: string
    selftext?: string
    author: string
    author_fullname: string
    url: string
    permalink: string
    thumbnail?: string
    thumbnail_width?: number
    thumbnail_height?: number
    score: number
    ups: number
    downs: number
    num_comments: number
    created_utc: number
    is_self: boolean
    is_video: boolean
  }

  export interface FullPost {
    id: string
    name: string
    author: string
    title: string
    subreddit: string
    subreddit_name_prefixed: string
    score: number
    approved_at_utc: string | null
    selftext?: string
    author_fullname: string
    is_self: boolean
    saved: boolean
    url: string
    permalink: string
    mod_reason_title: string | null
    gilded: number
    clicked: boolean
    link_flair_richtext: any[]
    hidden: boolean
    pwls: number
    link_flair_css_class: string
    downs: number
    thumbnail_height: any
    top_awarded_type: any
    hide_score: boolean
    quarantine: boolean
    link_flair_text_color: string
    upvote_ratio: number
    author_flair_background_color: any
    subreddit_type: string
    ups: number
    total_awards_received: number
    media_embed?: any
    secure_media_embed?: any
    thumbnail_width: any
    author_flair_template_id: any
    is_original_content: boolean
    user_reports: any[]
    secure_media: any
    is_reddit_media_domain: boolean
    is_meta: boolean
    category: any
    link_flair_text: string
    can_mod_post: boolean
    approved_by: any
    is_created_from_ads_ui: boolean
    author_premium: boolean
    thumbnail?: string
    edited: boolean
    author_flair_css_class: any
    author_flair_richtext: any[]
    gildings?: any
    content_categories: any
    mod_note: any
    created: number
    link_flair_type: string
    wls: number
    removed_by_category: any
    banned_by: any
    author_flair_type: string
    domain: string
    allow_live_comments: boolean
    selftext_html: string
    likes: any
    suggested_sort: any
    banned_at_utc: any
    view_count: any
    archived: boolean
    no_follow: boolean
    is_crosspostable: boolean
    pinned: boolean
    over_18: boolean
    all_awardings: any[]
    awarders: any[]
    media_only: boolean
    link_flair_template_id: string
    can_gild: boolean
    spoiler: boolean
    locked: boolean
    author_flair_text: any
    treatment_tags: any[]
    visited: boolean
    removed_by: any
    num_reports: any
    distinguished: any
    subreddit_id: string
    author_is_blocked: boolean
    mod_reason_by: any
    removal_reason: any
    link_flair_background_color: string
    is_robot_indexable: boolean
    report_reasons: any
    discussion_type: any
    num_comments: number
    send_replies: boolean
    contest_mode: boolean
    mod_reports: any[]
    author_patreon_flair: boolean
    author_flair_text_color: any
    stickied: boolean
    subreddit_subscribers: number
    created_utc: number
    num_crossposts: number
    media?: any
    is_video: boolean

    // preview images
    preview?: {
      enabled: boolean
      images: Array<{
        id: string
        source: Image
        resolutions: Image[]
        variants?: Record<
          string,
          {
            id: string
            source: Image
            resolutions: Image[]
          }
        >
      }>
    }
  }

  export interface Image {
    url: string
    width: number
    height: number
  }

  export interface PostT3 {
    kind: 't3'
    data: FullPost
  }

  export interface PostListingResponse {
    kind: 'Listing'
    data: {
      after: string
      dist: number
      modhash: string
      geo_filter?: null
      children: PostT3[]
    }
    before?: null
  }

  export type PostFilter = 'hot' | 'top' | 'new' | 'rising'

  export type GeoFilter =
    | 'GLOBAL'
    | 'US'
    | 'AR'
    | 'AU'
    | 'BG'
    | 'CA'
    | 'CL'
    | 'CO'
    | 'HR'
    | 'CZ'
    | 'FI'
    | 'FR'
    | 'DE'
    | 'GR'
    | 'HU'
    | 'IS'
    | 'IN'
    | 'IE'
    | 'IT'
    | 'JP'
    | 'MY'
    | 'MX'
    | 'NZ'
    | 'PH'
    | 'PL'
    | 'PT'
    | 'PR'
    | 'RO'
    | 'RS'
    | 'SG'
    | 'ES'
    | 'SE'
    | 'TW'
    | 'TH'
    | 'TR'
    | 'GB'
    | 'US_WA'
    | 'US_DE'
    | 'US_DC'
    | 'US_WI'
    | 'US_WV'
    | 'US_HI'
    | 'US_FL'
    | 'US_WY'
    | 'US_NH'
    | 'US_NJ'
    | 'US_NM'
    | 'US_TX'
    | 'US_LA'
    | 'US_NC'
    | 'US_ND'
    | 'US_NE'
    | 'US_TN'
    | 'US_NY'
    | 'US_PA'
    | 'US_CA'
    | 'US_NV'
    | 'US_VA'
    | 'US_CO'
    | 'US_AK'
    | 'US_AL'
    | 'US_AR'
    | 'US_VT'
    | 'US_IL'
    | 'US_GA'
    | 'US_IN'
    | 'US_IA'
    | 'US_OK'
    | 'US_AZ'
    | 'US_ID'
    | 'US_CT'
    | 'US_ME'
    | 'US_MD'
    | 'US_MA'
    | 'US_OH'
    | 'US_UT'
    | 'US_MO'
    | 'US_MN'
    | 'US_MI'
    | 'US_RI'
    | 'US_KS'
    | 'US_MT'
    | 'US_MS'
    | 'US_SC'
    | 'US_KY'
    | 'US_OR'
    | 'US_SD'

  export type TimePeriod = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'

  export type GetSubredditPostsOptions = {
    subreddit: string
    type?: PostFilter

    // Pagination size and offset (count)
    limit?: number
    count?: number

    // Pagination by fullnames of posts
    before?: string
    after?: string

    /**
     * Geographical filter. Only applicable to 'hot' posts.
     */
    geo?: GeoFilter

    /**
     * Filter by time period. Only applicable to 'top' posts.
     */
    time?: TimePeriod
  }

  export interface PostListingResult {
    subreddit: string
    type: PostFilter
    geo?: GeoFilter
    time?: TimePeriod
    posts: Post[]
  }
}

/**
 * Basic readonly Reddit API for fetching top/hot/new/rising posts from subreddits.
 *
 * Uses Reddit's legacy JSON API aimed at RSS feeds.
 *
 * @see https://old.reddit.com/dev/api
 */
export class RedditClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly baseUrl: string

  constructor({
    baseUrl = reddit.BASE_URL,
    userAgent = 'agentic-reddit-client/1.0.0',
    timeoutMs = 60_000,
    ky = defaultKy
  }: {
    baseUrl?: string
    userAgent?: string
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    super()

    this.baseUrl = baseUrl

    this.ky = ky.extend({
      prefixUrl: this.baseUrl,
      timeout: timeoutMs,
      headers: {
        'User-Agent': userAgent
      }
    })
  }

  /**
   * Fetches posts from a subreddit.
   *
   * @see https://old.reddit.com/dev/api/#GET_hot
   */
  @aiFunction({
    name: 'reddit_get_subreddit_posts',
    description: 'Fetches posts from a subreddit.',
    inputSchema: z.object({
      subreddit: z.string().describe('The subreddit to fetch posts from.'),
      type: z
        .union([
          z.literal('hot'),
          z.literal('top'),
          z.literal('new'),
          z.literal('rising')
        ])
        .optional()
        .describe('Type of posts to fetch (defaults to "hot").'),
      limit: z
        .number()
        .int()
        .max(100)
        .optional()
        .describe('Max number of posts to return (defaults to 5).'),
      count: z
        .number()
        .int()
        .optional()
        .describe('Number of posts to offset by (defaults to 0).'),
      time: z
        .union([
          z.literal('hour'),
          z.literal('day'),
          z.literal('week'),
          z.literal('month'),
          z.literal('year'),
          z.literal('all')
        ])
        .optional()
        .describe(
          'Time period to filter posts by (defaults to "all"). Only applicable to "top" posts type.'
        )
    })
  })
  async getSubredditPosts(
    subredditOrOpts: string | reddit.GetSubredditPostsOptions
  ): Promise<reddit.PostListingResult> {
    const params =
      typeof subredditOrOpts === 'string'
        ? { subreddit: subredditOrOpts }
        : subredditOrOpts
    const { subreddit, type = 'hot', limit = 5, geo, time, ...opts } = params

    const res = await this.ky
      .get(`r/${subreddit}/${type}.json`, {
        searchParams: sanitizeSearchParams({
          ...opts,
          limit,
          g: type === 'hot' ? geo : undefined,
          t: type === 'top' ? time : undefined
        })
      })
      .json<reddit.PostListingResponse>()

    return {
      subreddit,
      type,
      geo: type === 'hot' ? geo : undefined,
      time: type === 'top' ? time : undefined,
      posts: res.data.children.map((child) => {
        const post = child.data

        // Trim the post data to only include the bare minimum
        // TODO: add preview images
        // TODO: add video media info
        return {
          ...pick(
            post,
            'id',
            'name',
            'title',
            'subreddit',
            'selftext',
            'author',
            'author_fullname',
            'url',
            'permalink',
            'thumbnail',
            'thumbnail_width',
            'thumbnail_height',
            'score',
            'ups',
            'downs',
            'num_comments',
            'created_utc',
            'is_self',
            'is_video'
          ),
          permalink: `${this.baseUrl}${post.permalink}`,
          thumbnail:
            post.thumbnail !== 'self' &&
            post.thumbnail !== 'default' &&
            post.thumbnail !== 'spoiler' &&
            post.thumbnail !== 'nsfw'
              ? post.thumbnail
              : undefined
        }
      })
    }
  }
}
