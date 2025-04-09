import { aiFunction, AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import pThrottle from 'p-throttle'
import { z } from 'zod'

import type * as types from './types'
import { handleTwitterError } from './utils'

/**
 * This file contains rate-limited wrappers around all of the core Twitter API
 * methods that this project uses.
 *
 * NOTE: Twitter has different API rate limits and quotas per plan, so in order
 * to rate-limit effectively, our throttles need to either use the lowest common
 * denominator OR vary based on the twitter developer plan you're using. We
 * chose to go with the latter.
 *
 * @see https://docs.x.com/x-api/fundamentals/rate-limits
 */

type TwitterApiMethod =
  | 'createTweet'
  | 'getTweetById'
  | 'getTweetsById'
  | 'searchRecentTweets'
  | 'listTweetMentionsByUserId'
  | 'listTweetsLikedByUserId'
  | 'listTweetsByUserId'
  | 'getUserById'
  | 'getUserByUsername'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

const twitterApiRateLimitsByPlan: Record<
  types.TwitterApiPlan,
  Record<
    TwitterApiMethod,
    {
      readonly limit: number
      readonly interval: number
    }
  >
> = {
  free: {
    // 50 per 24h per user
    // 50 per 24h per app
    createTweet: { limit: 50, interval: TWENTY_FOUR_HOURS_MS },

    getTweetById: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    getTweetsById: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    searchRecentTweets: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    listTweetMentionsByUserId: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    listTweetsLikedByUserId: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    listTweetsByUserId: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    getUserById: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    getUserByUsername: { limit: 1, interval: FIFTEEN_MINUTES_MS }
  },

  basic: {
    // 100 per 24h per user
    // 1667 per 24h per app
    createTweet: { limit: 100, interval: TWENTY_FOUR_HOURS_MS },

    // 15 per 15m per user
    // 15 per 15m per app
    getTweetById: { limit: 15, interval: FIFTEEN_MINUTES_MS },
    getTweetsById: { limit: 15, interval: FIFTEEN_MINUTES_MS },

    // 60 per 15m per user
    // 60 per 15m per app
    searchRecentTweets: { limit: 60, interval: FIFTEEN_MINUTES_MS },

    // 10 per 15m per user
    // 10 per 15m per app
    listTweetMentionsByUserId: { limit: 180, interval: FIFTEEN_MINUTES_MS },

    // 5 per 15min per user
    // 5 per 15min per app
    listTweetsLikedByUserId: { limit: 5, interval: FIFTEEN_MINUTES_MS },

    // 5 per 15min per user
    // 10 per 15min per app
    listTweetsByUserId: { limit: 5, interval: FIFTEEN_MINUTES_MS },

    // 100 per 24h per user
    // 500 per 24h per app
    getUserById: { limit: 100, interval: TWENTY_FOUR_HOURS_MS },
    getUserByUsername: { limit: 100, interval: TWENTY_FOUR_HOURS_MS }
  },

  pro: {
    // 100 per 15m per user
    // 10k per 24h per app
    createTweet: { limit: 100, interval: FIFTEEN_MINUTES_MS },

    // TODO: why would the per-user rate-limit be more than the per-app one?!
    // 900 per 15m per user
    // 450 per 15m per app
    getTweetById: { limit: 450, interval: FIFTEEN_MINUTES_MS },
    getTweetsById: { limit: 450, interval: FIFTEEN_MINUTES_MS },

    // 300 per 15m per user
    // 450 per 15m per app
    searchRecentTweets: { limit: 300, interval: FIFTEEN_MINUTES_MS },

    // 300 per 15m per user
    // 450 per 15m per app
    listTweetMentionsByUserId: { limit: 300, interval: FIFTEEN_MINUTES_MS },

    // 75 per 15min per user
    // 75 per 15min per app
    listTweetsLikedByUserId: { limit: 75, interval: FIFTEEN_MINUTES_MS },

    // 900 per 15min per user
    // 1500 per 15min per app
    listTweetsByUserId: { limit: 900, interval: FIFTEEN_MINUTES_MS },

    // 900 per 15m per user
    // 300 per 15m per app
    getUserById: { limit: 300, interval: FIFTEEN_MINUTES_MS },
    getUserByUsername: { limit: 300, interval: FIFTEEN_MINUTES_MS }
  },

  enterprise: {
    // NOTE: these are just placeholders; the enterprise plan seems to be
    // completely customizable, but it's still useful to define rate limits
    // for robustness. These values just 10x those of the pro plan.
    createTweet: { limit: 1000, interval: FIFTEEN_MINUTES_MS },

    getTweetById: { limit: 4500, interval: FIFTEEN_MINUTES_MS },
    getTweetsById: { limit: 4500, interval: FIFTEEN_MINUTES_MS },

    searchRecentTweets: { limit: 3000, interval: FIFTEEN_MINUTES_MS },
    listTweetMentionsByUserId: { limit: 3000, interval: FIFTEEN_MINUTES_MS },
    listTweetsLikedByUserId: { limit: 750, interval: FIFTEEN_MINUTES_MS },
    listTweetsByUserId: { limit: 9000, interval: FIFTEEN_MINUTES_MS },

    getUserById: { limit: 3000, interval: FIFTEEN_MINUTES_MS },
    getUserByUsername: { limit: 3000, interval: FIFTEEN_MINUTES_MS }
  }
}

/**
 * Twitter/X API v2 client wrapper with rate-limited methods and `@aiFunction`
 * compatibility.
 *
 * Rate limits differ by plan, so make sure the `twitterApiPlan` parameter is
 * properly set to maximize your rate-limit usage.
 *
 * @note This class does not handle distributed rate-limits. It assumes a
 * single, local client is accessing the API at a time, which is a better fit
 * for serverful environments.
 *
 * @see https://docs.x.com/x-api/fundamentals/rate-limits
 * @see https://docs.x.com/x-api
 */
export class TwitterClient extends AIFunctionsProvider {
  readonly client: types.TwitterV2Client
  readonly twitterApiPlan: types.TwitterApiPlan

  constructor({
    client,
    twitterApiPlan = (getEnv('TWITTER_API_PLAN') as types.TwitterApiPlan) ??
      'free'
  }: {
    client: types.TwitterV2Client
    twitterApiPlan?: types.TwitterApiPlan
  }) {
    assert(
      client,
      'TwitterClient missing required "client" which should be an instance of "twitter-api-sdk" (use `getTwitterV2Client` to initialize the underlying V2 Twitter SDK using Nango OAuth)'
    )
    assert(twitterApiPlan, 'TwitterClient missing required "twitterApiPlan"')

    super()

    this.client = client
    this.twitterApiPlan = twitterApiPlan

    const twitterApiRateLimits = twitterApiRateLimitsByPlan[twitterApiPlan]!
    assert(twitterApiRateLimits, `Invalid twitter api plan: ${twitterApiPlan}`)

    const createTweetThrottle = pThrottle(twitterApiRateLimits.createTweet)
    const getTweetByIdThrottle = pThrottle(twitterApiRateLimits.getTweetById)
    const getTweetsByIdThrottle = pThrottle(twitterApiRateLimits.getTweetsById)
    const searchRecentTweetsThrottle = pThrottle(
      twitterApiRateLimits.searchRecentTweets
    )
    const listTweetMentionsByUserIdThrottle = pThrottle(
      twitterApiRateLimits.listTweetMentionsByUserId
    )
    const listTweetsLikedByUserIdThrottle = pThrottle(
      twitterApiRateLimits.listTweetsLikedByUserId
    )
    const listTweetsByUserIdThrottle = pThrottle(
      twitterApiRateLimits.listTweetsByUserId
    )
    const getUserByIdThrottle = pThrottle(twitterApiRateLimits.getUserById)
    const getUserByUsernameThrottle = pThrottle(
      twitterApiRateLimits.getUserByUsername
    )

    this._createTweet = createTweetThrottle(createTweetImpl(this.client))
    this._getTweetById = getTweetByIdThrottle(getTweetByIdImpl(this.client))
    this._getTweetsById = getTweetsByIdThrottle(getTweetsByIdImpl(this.client))
    this._searchRecentTweets = searchRecentTweetsThrottle(
      searchRecentTweetsImpl(this.client)
    )
    this._listTweetMentionsByUserId = listTweetMentionsByUserIdThrottle(
      listTweetMentionsByUserIdImpl(this.client)
    )
    this._listTweetsLikedByUserId = listTweetsLikedByUserIdThrottle(
      listTweetsLikedByUserIdImpl(this.client)
    )
    this._listTweetsByUserId = listTweetsByUserIdThrottle(
      listTweetsByUserIdImpl(this.client)
    )
    this._getUserById = getUserByIdThrottle(getUserByIdImpl(this.client))
    this._getUserByUsername = getUserByUsernameThrottle(
      getUserByUsernameImpl(this.client)
    )
  }

  protected _createTweet: ReturnType<typeof createTweetImpl>
  protected _getTweetById: ReturnType<typeof getTweetByIdImpl>
  protected _getTweetsById: ReturnType<typeof getTweetsByIdImpl>
  protected _searchRecentTweets: ReturnType<typeof searchRecentTweetsImpl>
  protected _listTweetMentionsByUserId: ReturnType<
    typeof listTweetMentionsByUserIdImpl
  >
  protected _listTweetsLikedByUserId: ReturnType<
    typeof listTweetsLikedByUserIdImpl
  >
  protected _listTweetsByUserId: ReturnType<typeof listTweetsByUserIdImpl>
  protected _getUserById: ReturnType<typeof getUserByIdImpl>
  protected _getUserByUsername: ReturnType<typeof getUserByUsernameImpl>

  /**
   * Creates a new tweet
   */
  @aiFunction({
    name: 'create_tweet',
    description: 'Creates a new tweet',
    inputSchema: z.object({
      text: z.string().nonempty()
    })
  })
  async createTweet(
    params: types.CreateTweetParams
  ): Promise<types.CreatedTweet> {
    return this._createTweet(params)
  }

  /**
   * Fetch a tweet by its ID
   */
  @aiFunction({
    name: 'get_tweet_by_id',
    description: 'Fetch a tweet by its ID',
    inputSchema: z.object({
      id: z.string().nonempty()
    })
  })
  async getTweetById(params: { id: string } & types.GetTweetByIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.getTweetById is not supported on free plan'
    )

    return this._getTweetById(params.id, params)
  }

  /**
   * Fetch an array of tweets by their IDs
   */
  @aiFunction({
    name: 'get_tweets_by_id',
    description: 'Fetch an array of tweets by their IDs',
    inputSchema: z.object({
      ids: z.array(z.string().nonempty())
    })
  })
  async getTweetsById({ ids, ...params }: types.GetTweetsByIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.getTweetsById is not supported on free plan'
    )

    return this._getTweetsById(ids, params)
  }

  /**
   * Searches for recent tweets
   */
  @aiFunction({
    name: 'search_recent_tweets',
    description: 'Searches for recent tweets',
    inputSchema: z.object({
      query: z.string().nonempty(),
      sort_order: z
        .enum(['recency', 'relevancy'])
        .default('relevancy')
        .optional(),
      max_results: z.number().min(10).max(100).optional(),
      pagination_token: z.string().optional()
    })
  })
  async searchRecentTweets(params: types.SearchRecentTweetsParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.searchRecentTweets is not supported on free plan'
    )

    return this._searchRecentTweets(params)
  }

  /**
   * Lists tweets which mention the given user.
   */
  @aiFunction({
    name: 'list_tweet_mentions_by_user_id',
    description: 'Lists tweets which mention the given user.',
    inputSchema: z.object({
      userId: z.string().nonempty(),
      max_results: z.number().min(5).max(100).optional(),
      pagination_token: z.string().optional()
    })
  })
  async listTweetMentionsByUserId({
    userId,
    ...params
  }: { userId: string } & types.ListTweetMentionsByUserIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.listTweetMentionsByUserId is not supported on free plan'
    )

    return this._listTweetMentionsByUserId(userId, params)
  }

  /**
   * Lists tweets liked by a user.
   */
  @aiFunction({
    name: 'list_tweets_liked_by_user_id',
    description: 'Lists tweets liked by a user.',
    inputSchema: z.object({
      userId: z.string().nonempty(),
      max_results: z.number().min(5).max(100).optional(),
      pagination_token: z.string().optional()
    })
  })
  async listTweetsLikedByUserId({
    userId,
    ...params
  }: { userId: string } & types.ListTweetsLikedByUserIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.listTweetsLikedByUserId is not supported on free plan'
    )

    return this._listTweetsLikedByUserId(userId, params)
  }

  /**
   * Lists tweets authored by a user.
   */
  @aiFunction({
    name: 'list_tweets_by_user_id',
    description: 'Lists tweets authored by a user.',
    inputSchema: z.object({
      userId: z.string().nonempty(),
      max_results: z.number().min(5).max(100).optional(),
      pagination_token: z.string().optional(),
      exclude: z
        .array(z.union([z.literal('replies'), z.literal('retweets')]))
        .optional()
        .describe(
          'By default, replies and retweets are included. Use this parameter if you want to exclude either or both of them.'
        )
    })
  })
  async listTweetsByUserId({
    userId,
    ...params
  }: { userId: string } & types.ListTweetsByUserIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.listTweetsByUserId is not supported on free plan'
    )

    return this._listTweetsByUserId(userId, params)
  }

  /**
   * Fetch a twitter user by ID
   */
  @aiFunction({
    name: 'get_twitter_user_by_id',
    description: 'Fetch a twitter user by ID',
    inputSchema: z.object({
      id: z.string().min(1)
    })
  })
  async getUserById({
    id,
    ...params
  }: { id: string } & types.GetUserByIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.getUserById not supported on free plan'
    )

    return this._getUserById(id, params)
  }

  /**
   * Fetch a twitter user by username
   */
  @aiFunction({
    name: 'get_twitter_user_by_username',
    description: 'Fetch a twitter user by username',
    inputSchema: z.object({
      username: z.string().min(1)
    })
  })
  async getUserByUsername({
    username,
    ...params
  }: { username: string } & types.GetUserByUsernameParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.getUserByUsername not supported on free plan'
    )

    return this._getUserByUsername(username, params)
  }
}

const defaultTwitterQueryTweetFields: types.TwitterQueryTweetFields = [
  'attachments',
  'author_id',
  'conversation_id',
  'created_at',
  'entities',
  'geo',
  'id',
  'in_reply_to_user_id',
  'lang',
  'public_metrics',
  'possibly_sensitive',
  'referenced_tweets',
  'text'
  // 'context_annotations', // not needed (way too verbose and noisy)
  // 'edit_controls', / not needed
  // 'non_public_metrics', // don't have access to
  // 'organic_metrics', // don't have access to
  // 'promoted_metrics, // don't have access to
  // 'reply_settings', / not needed
  // 'source', // not needed
  // 'withheld' // not needed
]

const defaultTwitterQueryUserFields: types.TwitterQueryUserFields = [
  'created_at',
  'description',
  'entities',
  'id',
  'location',
  'name',
  'pinned_tweet_id',
  'profile_image_url',
  'protected',
  'public_metrics',
  'url',
  'username',
  'verified'
  // 'most_recent_tweet_id',
  // 'verified_type',
  // 'withheld'
]

const defaultTweetQueryParams: types.TweetsQueryOptions = {
  // https://developer.twitter.com/en/docs/twitter-api/expansions
  expansions: [
    'author_id',
    'in_reply_to_user_id',
    'referenced_tweets.id',
    'referenced_tweets.id.author_id',
    'entities.mentions.username',
    // TODO
    'attachments.media_keys',
    'geo.place_id',
    'attachments.poll_ids'
  ],
  'tweet.fields': defaultTwitterQueryTweetFields,
  'user.fields': defaultTwitterQueryUserFields
}

const defaultUserQueryParams: types.TwitterUserQueryOptions = {
  // https://developer.twitter.com/en/docs/twitter-api/expansions
  expansions: ['pinned_tweet_id'],
  'tweet.fields': defaultTwitterQueryTweetFields,
  'user.fields': defaultTwitterQueryUserFields
}

function createTweetImpl(client: types.TwitterV2Client) {
  return async (
    params: types.CreateTweetParams
  ): Promise<types.CreatedTweet> => {
    try {
      const { data: tweet } = await client.tweets.createTweet(params)

      if (!tweet?.id) {
        throw new Error('invalid createTweet response')
      }

      return tweet
    } catch (err: any) {
      console.error('error creating tweet', JSON.stringify(err, null, 2))

      handleTwitterError(err, { label: 'error creating tweet' })
    }
  }
}

function getTweetByIdImpl(client: types.TwitterV2Client) {
  return async (tweetId: string, params?: types.GetTweetByIdParams) => {
    try {
      return await client.tweets.findTweetById(tweetId, {
        ...defaultTweetQueryParams,
        ...params
      })
    } catch (err: any) {
      handleTwitterError(err, { label: `error fetching tweet ${tweetId}` })
    }
  }
}

function getTweetsByIdImpl(client: types.TwitterV2Client) {
  return async (
    ids: string[],
    params?: Omit<types.GetTweetsByIdParams, 'ids'>
  ) => {
    try {
      return await client.tweets.findTweetsById({
        ...defaultTweetQueryParams,
        ...params,
        ids
      })
    } catch (err: any) {
      handleTwitterError(err, { label: `error fetching ${ids.length} tweets` })
    }
  }
}

function searchRecentTweetsImpl(client: types.TwitterV2Client) {
  return async (params: types.SearchRecentTweetsParams) => {
    try {
      return await client.tweets.tweetsRecentSearch({
        ...defaultTweetQueryParams,
        ...params
      })
    } catch (err: any) {
      handleTwitterError(err, {
        label: `error searching tweets query "${params.query}"`
      })
    }
  }
}

function getUserByIdImpl(client: types.TwitterV2Client) {
  return async (userId: string, params?: types.GetUserByIdParams) => {
    try {
      return await client.users.findUserById(userId, {
        ...defaultUserQueryParams,
        ...params
      })
    } catch (err: any) {
      handleTwitterError(err, {
        label: `error fetching user ${userId}`
      })
    }
  }
}

function getUserByUsernameImpl(client: types.TwitterV2Client) {
  return async (username: string, params?: types.GetUserByUsernameParams) => {
    try {
      return await client.users.findUserByUsername(username, {
        ...defaultUserQueryParams,
        ...params
      })
    } catch (err: any) {
      handleTwitterError(err, {
        label: `error fetching user with username ${username}`
      })
    }
  }
}

function listTweetMentionsByUserIdImpl(client: types.TwitterV2Client) {
  return async (
    userId: string,
    params?: types.ListTweetMentionsByUserIdParams
  ) => {
    try {
      return await client.tweets.usersIdMentions(userId, {
        ...defaultTweetQueryParams,
        ...params
      })
    } catch (err: any) {
      handleTwitterError(err, {
        label: `error fetching tweets mentions for user ${userId}`
      })
    }
  }
}

function listTweetsLikedByUserIdImpl(client: types.TwitterV2Client) {
  return async (
    userId: string,
    params?: types.ListTweetsLikedByUserIdParams
  ) => {
    try {
      return await client.tweets.usersIdLikedTweets(userId, {
        ...defaultTweetQueryParams,
        ...params
      })
    } catch (err: any) {
      handleTwitterError(err, {
        label: `error fetching tweets liked by user ${userId}`
      })
    }
  }
}

function listTweetsByUserIdImpl(client: types.TwitterV2Client) {
  return async (userId: string, params?: types.ListTweetsByUserIdParams) => {
    try {
      return await client.tweets.usersIdTweets(userId, {
        ...defaultTweetQueryParams,
        ...params
      })
    } catch (err: any) {
      handleTwitterError(err, {
        label: `error fetching tweets by user ${userId}`
      })
    }
  }
}
