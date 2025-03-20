import type { AsyncReturnType, Simplify } from 'type-fest'
import { type Client as TwitterV2Client } from 'twitter-api-sdk'

export { type Client as TwitterV2Client } from 'twitter-api-sdk'

export type TwitterApiPlan = 'free' | 'basic' | 'pro' | 'enterprise'

export type TweetsQueryOptions = Simplify<
  Pick<
    Parameters<TwitterV2Client['tweets']['findTweetsById']>[0],
    'expansions' | 'tweet.fields' | 'user.fields'
  >
>

export type TwitterUserQueryOptions = Simplify<
  Pick<
    NonNullable<Parameters<TwitterV2Client['users']['findUserById']>[1]>,
    'expansions' | 'tweet.fields' | 'user.fields'
  >
>

export type TwitterQueryTweetFields = TweetsQueryOptions['tweet.fields']
export type TwitterQueryUserFields = TweetsQueryOptions['user.fields']

export type TwitterUserIdMentionsQueryOptions = Simplify<
  NonNullable<Parameters<TwitterV2Client['tweets']['usersIdMentions']>[1]>
>

export type CreateTweetParams = Simplify<
  Parameters<TwitterV2Client['tweets']['createTweet']>[0]
>

export type ListTweetMentionsByUserIdParams = Simplify<
  Parameters<TwitterV2Client['tweets']['usersIdMentions']>[1]
>

export type GetTweetByIdParams = Simplify<
  Parameters<TwitterV2Client['tweets']['findTweetById']>[1]
>

export type GetTweetsByIdParams = Simplify<
  Parameters<TwitterV2Client['tweets']['findTweetsById']>[0]
>

export type SearchRecentTweetsParams = Simplify<
  Parameters<TwitterV2Client['tweets']['tweetsRecentSearch']>[0]
>

export type GetUserByIdParams = Simplify<
  Parameters<TwitterV2Client['users']['findUserById']>[1]
>

export type GetUserByUsernameParams = Simplify<
  Parameters<TwitterV2Client['users']['findUserByUsername']>[1]
>

export type ListTweetsLikedByUserIdParams = Simplify<
  Parameters<TwitterV2Client['tweets']['usersIdLikedTweets']>[1]
>

export type ListTweetsByUserIdParams = Simplify<
  Parameters<TwitterV2Client['tweets']['usersIdTweets']>[1]
>

type Unpacked<T> = T extends (infer U)[] ? U : T

export type Tweet = Simplify<
  NonNullable<
    Unpacked<
      AsyncReturnType<TwitterV2Client['tweets']['findTweetsById']>['data']
    >
  >
>
export type TwitterUser = Simplify<
  NonNullable<AsyncReturnType<TwitterV2Client['users']['findMyUser']>['data']>
>
export type CreatedTweet = Simplify<
  NonNullable<AsyncReturnType<TwitterV2Client['tweets']['createTweet']>['data']>
>

export type TwitterUrl = Simplify<
  Unpacked<NonNullable<NonNullable<Tweet['entities']>['urls']>>
>
