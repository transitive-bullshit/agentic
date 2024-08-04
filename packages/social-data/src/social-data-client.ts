import {
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'

// TODO: need to add `aiFunction` wrappers for each method

export namespace socialdata {
  export const API_BASE_URL = 'https:///api.socialdata.tools'

  // Allow up to 120 requests per minute by default.
  export const throttle = pThrottle({
    limit: 120,
    interval: 60 * 1000
  })

  export type GetTweetByIdOptions = {
    id: string
  }

  export type GetUsersByTweetByIdOptions = {
    tweetId: string
    cursor?: string
  }

  export type SearchTweetOptions = {
    query: string
    cursor?: string
    type?: 'Latest' | 'Top'
  }

  export type SearchUsersOptions = {
    query: string
  }

  export type GetUserByIdOptions = {
    userId: string
  }

  export type GetUserByUsernameOptions = {
    username: string
  }

  export type GetUsersByIdOptions = {
    userId: string
    cursor?: string
  }

  export type UserFollowingOptions = {
    // The numeric ID of the desired follower.
    sourceUserId: string
    // The numeric ID of the desired user being followed.
    targetUserId: string
    // Maximum number of followers for target_user to look through.
    maxCount?: number
  }

  export type GetTweetsByUserIdOptions = {
    userId: string
    cursor?: string
    replies?: boolean
  }

  export type TweetResponse = Tweet | ErrorResponse
  export type UserResponse = User | ErrorResponse

  export type UsersResponse =
    | {
        next_cursor: string
        users: User[]
      }
    | ErrorResponse

  export type TweetsResponse =
    | {
        next_cursor: string
        tweets: Tweet[]
      }
    | ErrorResponse

  export type UserFollowingResponse = UserFollowingStatus | ErrorResponse

  export interface ErrorResponse {
    status: 'error'
    message: string
  }

  export interface Tweet {
    tweet_created_at: string
    id: number
    id_str: string
    text: any
    full_text: string
    source: string
    truncated: boolean
    in_reply_to_status_id: any
    in_reply_to_status_id_str: any
    in_reply_to_user_id: any
    in_reply_to_user_id_str: any
    in_reply_to_screen_name: any
    user: User
    quoted_status_id: any
    quoted_status_id_str: any
    is_quote_status: boolean
    quoted_status: any
    retweeted_status: any
    quote_count: number
    reply_count: number
    retweet_count: number
    favorite_count: number
    lang: string
    entities: Entities
    views_count: number
    bookmark_count: number
  }

  export interface User {
    id: number
    id_str: string
    name: string
    screen_name: string
    location: string
    url: any
    description: string
    protected: boolean
    verified: boolean
    followers_count: number
    friends_count: number
    listed_count: number
    favourites_count: number
    statuses_count: number
    created_at: string
    profile_banner_url: string
    profile_image_url_https: string
    can_dm: boolean
  }

  export interface Entities {
    user_mentions?: any[]
    urls?: any[]
    hashtags?: any[]
    symbols?: any[]
  }

  export interface UserFollowingStatus {
    status: string
    source_user_id: string
    target_user_id: string
    is_following: boolean
    followers_checked_count: number
  }
}

/**
 * SocialData API is a scalable and reliable API that simplifies the process of
 * fetching data from social media websites. At the moment, we only support X
 * (formerly Twitter), but working on adding more integrations.
 *
 * With SocialData API, you can easily retrieve tweets, user profiles, user
 * followers/following and other information without the need for proxies or
 * parsing Twitter responses. This ensures a seamless and hassle-free
 * integration with your application, saving you valuable time and effort.
 *
 * @see https://socialdata.tools
 */
export class SocialDataClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('SOCIAL_DATA_API_KEY'),
    apiBaseUrl = socialdata.API_BASE_URL,
    throttle = true,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'SocialDataClient missing required "apiKey" (defaults to "SOCIAL_DATA_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, socialdata.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: this.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    })
  }

  /**
   * Retrieve tweet details.
   */
  async getTweetById(idOrOpts: string | socialdata.GetTweetByIdOptions) {
    const options = typeof idOrOpts === 'string' ? { id: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky
        .get('twitter/statuses/show', {
          searchParams: sanitizeSearchParams(options)
        })
        .json<socialdata.TweetResponse>()
    )
  }

  /**
   * Retrieve all users who liked a tweet.
   */
  async getUsersWhoLikedTweetById(
    idOrOpts: string | socialdata.GetUsersByTweetByIdOptions
  ) {
    const { tweetId, ...params } =
      typeof idOrOpts === 'string' ? { tweetId: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky
        .get(`twitter/tweets/${tweetId}/liking_users`, {
          searchParams: sanitizeSearchParams(params)
        })
        .json<socialdata.UsersResponse>()
    )
  }

  /**
   * Retrieve all users who retweeted a tweet.
   */
  async getUsersWhoRetweetedTweetById(
    idOrOpts: string | socialdata.GetUsersByTweetByIdOptions
  ) {
    const { tweetId, ...params } =
      typeof idOrOpts === 'string' ? { tweetId: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky
        .get(`twitter/tweets/${tweetId}/retweeted_by`, {
          searchParams: sanitizeSearchParams(params)
        })
        .json<socialdata.UsersResponse>()
    )
  }

  /**
   * Returns array of tweets provided by Twitter search page. Typically Twitter
   * returns ~20 results per page. You can request additional search results by
   * sending another request to the same endpoint using cursor parameter.
   *
   * Search `type` defaults to `Top`.
   */
  async searchTweets(queryOrOpts: string | socialdata.SearchTweetOptions) {
    const options =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    return this._handleResponse(
      this.ky
        .get('twitter/search', {
          searchParams: sanitizeSearchParams({
            type: 'top',
            ...options
          })
        })
        .json<socialdata.TweetsResponse>()
    )
  }

  /**
   * Retrieve user profile details by user ID.
   */
  async getUserById(idOrOpts: string | socialdata.GetUserByIdOptions) {
    const { userId } =
      typeof idOrOpts === 'string' ? { userId: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky.get(`twitter/user/${userId}`).json<socialdata.UserResponse>()
    )
  }

  /**
   * Retrieve user profile details by username.
   */
  async getUserByUsername(
    usernameOrOptions: string | socialdata.GetUserByUsernameOptions
  ) {
    const { username } =
      typeof usernameOrOptions === 'string'
        ? { username: usernameOrOptions }
        : usernameOrOptions

    return this._handleResponse(
      this.ky.get(`twitter/user/${username}`).json<socialdata.UserResponse>()
    )
  }

  /**
   * Returns array of tweets from the user's tweets and replies timeline.
   * Typically Twitter returns ~20 results per page. You can request additional
   * search results by sending another request to the same endpoint using
   * cursor parameter.
   */
  async getTweetsByUserId(
    idOrOpts: string | socialdata.GetTweetsByUserIdOptions
  ) {
    const {
      userId,
      replies = false,
      ...params
    } = typeof idOrOpts === 'string' ? { userId: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky
        .get(
          `twitter/user/${userId}/${replies ? 'tweets-and-replies' : 'tweets'}`,
          {
            searchParams: sanitizeSearchParams(params)
          }
        )
        .json<socialdata.TweetsResponse>()
    )
  }

  /**
   * Returns array of tweets from the user's likes timeline. Typically Twitter
   * returns ~20 results per page. You can request additional search results
   * by sending another request to the same endpoint using cursor parameter.
   */
  async getTweetsLikedByUserId(
    idOrOpts: string | socialdata.GetTweetsByUserIdOptions
  ) {
    const { userId, ...params } =
      typeof idOrOpts === 'string' ? { userId: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky
        .get(`twitter/user/${userId}/likes`, {
          searchParams: sanitizeSearchParams(params)
        })
        .json<socialdata.TweetsResponse>()
    )
  }

  /**
   * Retrieve user followers.
   */
  async getFollowersForUserId(
    idOrOpts: string | socialdata.GetUsersByIdOptions
  ) {
    const { userId: user_id, ...params } =
      typeof idOrOpts === 'string' ? { userId: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky
        .get('twitter/followers/list', {
          searchParams: sanitizeSearchParams({
            user_id,
            ...params
          })
        })
        .json<socialdata.UsersResponse>()
    )
  }

  /**
   * Retrieve user followers.
   */
  async getFollowingForUserId(
    idOrOpts: string | socialdata.GetUsersByIdOptions
  ) {
    const { userId: user_id, ...params } =
      typeof idOrOpts === 'string' ? { userId: idOrOpts } : idOrOpts

    return this._handleResponse(
      this.ky
        .get('twitter/friends/list', {
          searchParams: sanitizeSearchParams({
            user_id,
            ...params
          })
        })
        .json<socialdata.UsersResponse>()
    )
  }

  /**
   * This endpoint provides a convenient way to check if a user is following
   * another user. This will recursively retrieve all recent followers of
   * target user (up to [max_count] total results) and check if the
   * source_user_id is present among the retrieved followers.
   */
  async isUserFollowingUser(opts: socialdata.UserFollowingOptions) {
    const { sourceUserId, targetUserId, ...params } = opts

    return this._handleResponse(
      this.ky
        .get(`twitter/user/${sourceUserId}/following/${targetUserId}`, {
          searchParams: sanitizeSearchParams(params)
        })
        .json<socialdata.UserFollowingResponse>()
    )
  }

  /**
   * Returns a list of users with screenname or full name matching the search query.
   */
  async searchUsersByUsername(
    queryOrOpts: string | socialdata.SearchUsersOptions
  ) {
    const params =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts

    return this._handleResponse(
      this.ky
        .get('twitter/search-users', {
          searchParams: sanitizeSearchParams(params)
        })
        .json<socialdata.UsersResponse>()
    )
  }

  protected async _handleResponse<T extends object | socialdata.ErrorResponse>(
    resP: Promise<T>
  ): Promise<Exclude<T, socialdata.ErrorResponse>> {
    const res = await resP

    if ((res as socialdata.ErrorResponse).status === 'error') {
      throw new Error((res as socialdata.ErrorResponse).message)
    }

    return res as unknown as Exclude<T, socialdata.ErrorResponse>
  }
}
