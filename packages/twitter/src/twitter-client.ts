import { aiFunction, AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import pThrottle from 'p-throttle'
import { z } from 'zod'

import type * as types from './types'
import { handleKnownTwitterErrors } from './utils'

/**
 * This file contains rate-limited wrappers around all of the core Twitter API
 * methods that this project uses.
 *
 * NOTE: Twitter has different API rate limits and quotas per plan, so in order
 * to rate-limit effectively, our throttles need to either use the lowest common
 * denominator OR vary based on the twitter developer plan you're using. We
 * chose to go with the latter.
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/rate-limits
 */

type TwitterApiMethod =
  | 'createTweet'
  | 'usersIdMentions'
  | 'findTweetById'
  | 'findTweetsById'
  | 'searchRecentTweets'
  | 'findUserById'
  | 'findUserByUsername'

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

    // TODO: according to the twitter docs, this shouldn't be allowed on the
    // free plan, but it seems to work...
    usersIdMentions: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    findTweetById: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    findTweetsById: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    searchRecentTweets: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    findUserById: { limit: 1, interval: FIFTEEN_MINUTES_MS },
    findUserByUsername: { limit: 1, interval: FIFTEEN_MINUTES_MS }
  },

  basic: {
    // 100 per 24h per user
    // 1667 per 24h per app
    createTweet: { limit: 100, interval: TWENTY_FOUR_HOURS_MS },

    // https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-mentions
    // TODO: undocumented
    // 180 per 15m per user
    // 450 per 15m per app
    usersIdMentions: { limit: 180, interval: FIFTEEN_MINUTES_MS },

    // 15 per 15m per user
    // 15 per 15m per app
    findTweetById: { limit: 15, interval: FIFTEEN_MINUTES_MS },
    findTweetsById: { limit: 15, interval: FIFTEEN_MINUTES_MS },

    // 60 per 15m per user
    // 60 per 15m per app
    searchRecentTweets: { limit: 60, interval: FIFTEEN_MINUTES_MS },

    findUserById: { limit: 100, interval: TWENTY_FOUR_HOURS_MS },
    findUserByUsername: { limit: 100, interval: TWENTY_FOUR_HOURS_MS }
  },

  pro: {
    // 100 per 15m per user
    // 10k per 24h per app
    createTweet: { limit: 100, interval: FIFTEEN_MINUTES_MS },

    // 180 per 15m per user
    // 450 per 15m per app
    usersIdMentions: { limit: 180, interval: FIFTEEN_MINUTES_MS },

    // TODO: why would the per-user rate-limit be less than the per-app one?!
    // 900 per 15m per user
    // 450 per 15m per app
    findTweetById: { limit: 450, interval: FIFTEEN_MINUTES_MS },
    findTweetsById: { limit: 450, interval: FIFTEEN_MINUTES_MS },

    // TODO: why would the per-user rate-limit be less than the per-app one?!
    // 456 per 15m per user
    // 300 per 15m per app
    searchRecentTweets: { limit: 300, interval: FIFTEEN_MINUTES_MS },

    findUserById: { limit: 300, interval: FIFTEEN_MINUTES_MS },
    findUserByUsername: { limit: 300, interval: FIFTEEN_MINUTES_MS }
  },

  enterprise: {
    // NOTE: these are just placeholders; the enterprise plan seems to be
    // completely customizable, but it's still useful to define rate limits
    // for robustness. These values just 10x those of the pro plan.
    createTweet: { limit: 1000, interval: FIFTEEN_MINUTES_MS },
    usersIdMentions: { limit: 1800, interval: FIFTEEN_MINUTES_MS },
    findTweetById: { limit: 4500, interval: FIFTEEN_MINUTES_MS },
    findTweetsById: { limit: 4500, interval: FIFTEEN_MINUTES_MS },
    searchRecentTweets: { limit: 3000, interval: FIFTEEN_MINUTES_MS },
    findUserById: { limit: 3000, interval: FIFTEEN_MINUTES_MS },
    findUserByUsername: { limit: 3000, interval: FIFTEEN_MINUTES_MS }
  }
}

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
    const findTweetByIdThrottle = pThrottle(twitterApiRateLimits.findTweetById)
    const findTweetsByIdThrottle = pThrottle(
      twitterApiRateLimits.findTweetsById
    )
    const searchRecentTweetsThrottle = pThrottle(
      twitterApiRateLimits.searchRecentTweets
    )
    const findUserByIdThrottle = pThrottle(twitterApiRateLimits.findUserById)
    const findUserByUsernameThrottle = pThrottle(
      twitterApiRateLimits.findUserByUsername
    )

    this._createTweet = createTweetThrottle(createTweetImpl(this.client))
    this._findTweetById = findTweetByIdThrottle(findTweetByIdImpl(this.client))
    this._findTweetsById = findTweetsByIdThrottle(
      findTweetsByIdImpl(this.client)
    )
    this._searchRecentTweets = searchRecentTweetsThrottle(
      searchRecentTweetsImpl(this.client)
    )
    this._findUserById = findUserByIdThrottle(findUserByIdImpl(this.client))
    this._findUserByUsername = findUserByUsernameThrottle(
      findUserByUsernameImpl(this.client)
    )
  }

  protected _createTweet: ReturnType<typeof createTweetImpl>
  protected _findTweetById: ReturnType<typeof findTweetByIdImpl>
  protected _findTweetsById: ReturnType<typeof findTweetsByIdImpl>
  protected _searchRecentTweets: ReturnType<typeof searchRecentTweetsImpl>
  protected _findUserById: ReturnType<typeof findUserByIdImpl>
  protected _findUserByUsername: ReturnType<typeof findUserByUsernameImpl>

  @aiFunction({
    name: 'create_tweet',
    description: 'Creates a new tweet',
    inputSchema: z.object({
      text: z.string().min(1)
    })
  })
  async createTweet(
    params: types.CreateTweetParams
  ): Promise<types.CreatedTweet> {
    return this._createTweet(params)
  }

  @aiFunction({
    name: 'get_tweet_by_id',
    description: 'Fetch a tweet by its ID',
    inputSchema: z.object({
      id: z.string().min(1)
    })
  })
  async findTweetById({
    id,
    ...params
  }: { id: string } & types.FindTweetByIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.findTweetById not supported on free plan'
    )

    return this._findTweetById(id, params)
  }

  @aiFunction({
    name: 'get_tweets_by_id',
    description: 'Fetch an array of tweets by their IDs',
    inputSchema: z.object({
      ids: z.array(z.string().min(1))
    })
  })
  async findTweetsById({ ids, ...params }: types.FindTweetsByIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.findTweetsById not supported on free plan'
    )

    return this._findTweetsById(ids, params)
  }

  @aiFunction({
    name: 'search_recent_tweets',
    description: 'Searches for recent tweets',
    inputSchema: z.object({
      query: z.string().min(1),
      sort_order: z
        .enum(['recency', 'relevancy'])
        .default('relevancy')
        .optional()
    })
  })
  async searchRecentTweets(params: types.SearchRecentTweetsParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.searchRecentTweets not supported on free plan'
    )

    return this._searchRecentTweets(params)
  }

  @aiFunction({
    name: 'get_twitter_user_by_id',
    description: 'Fetch a twitter user by ID',
    inputSchema: z.object({
      id: z.string().min(1)
    })
  })
  async findUserById({
    id,
    ...params
  }: { id: string } & types.FindUserByIdParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.findUserById not supported on free plan'
    )

    return this._findUserById(id, params)
  }

  @aiFunction({
    name: 'get_twitter_user_by_username',
    description: 'Fetch a twitter user by username',
    inputSchema: z.object({
      username: z.string().min(1)
    })
  })
  async findUserByUsername({
    username,
    ...params
  }: { username: string } & types.FindUserByUsernameParams) {
    assert(
      this.twitterApiPlan !== 'free',
      'TwitterClient.findUserByUsername not supported on free plan'
    )

    return this._findUserByUsername(username, params)
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

      handleKnownTwitterErrors(err, { label: 'creating tweet' })
      throw err
    }
  }
}

function findTweetByIdImpl(client: types.TwitterV2Client) {
  return async (tweetId: string, params?: types.FindTweetByIdParams) => {
    try {
      return await client.tweets.findTweetById(tweetId, {
        ...defaultTweetQueryParams,
        ...params
      })
    } catch (err: any) {
      handleKnownTwitterErrors(err, { label: `fetching tweet ${tweetId}` })
      throw err
    }
  }
}

function findTweetsByIdImpl(client: types.TwitterV2Client) {
  return async (
    ids: string[],
    params?: Omit<types.FindTweetsByIdParams, 'ids'>
  ) => {
    try {
      return await client.tweets.findTweetsById({
        ...defaultTweetQueryParams,
        ...params,
        ids
      })
    } catch (err: any) {
      handleKnownTwitterErrors(err, { label: `fetching ${ids.length} tweets` })
      throw err
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
      handleKnownTwitterErrors(err, {
        label: `searching tweets query "${params.query}"`
      })
      throw err
    }
  }
}

function findUserByIdImpl(client: types.TwitterV2Client) {
  return async (userId: string, params?: types.FindUserByIdParams) => {
    try {
      return await client.users.findUserById(userId, {
        ...defaultUserQueryParams,
        ...params
      })
    } catch (err: any) {
      handleKnownTwitterErrors(err, {
        label: `fetching user with id ${userId}`
      })
      throw err
    }
  }
}

function findUserByUsernameImpl(client: types.TwitterV2Client) {
  return async (username: string, params?: types.FindUserByUsernameParams) => {
    try {
      return await client.users.findUserByUsername(username, {
        ...defaultUserQueryParams,
        ...params
      })
    } catch (err: any) {
      handleKnownTwitterErrors(err, {
        label: `fetching user with username ${username}`
      })
      throw err
    }
  }
}
