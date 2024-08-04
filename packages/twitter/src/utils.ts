import { omit } from '@agentic/core'

import type * as types from './types'
import { TwitterError } from './error'

/**
 * Error handler which takes in an unknown Error object and converts it to a
 * structured TwitterError object for a set of common Twitter API errors.
 *
 * Re-throws the error and will never return.
 */
export function handleKnownTwitterErrors(
  err: any,
  { label = '' }: { label?: string } = {}
) {
  if (err.status === 403) {
    // user may have deleted the tweet we're trying to respond to
    throw new TwitterError(
      err.error?.detail || `error ${label}: 403 forbidden`,
      {
        type: 'twitter:forbidden',
        isFinal: true,
        cause: err
      }
    )
  } else if (err.status === 401) {
    throw new TwitterError(`error ${label}: unauthorized`, {
      type: 'twitter:auth',
      cause: err
    })
  } else if (err.status === 400) {
    if (
      /value passed for the token was invalid/i.test(
        err.error?.error_description
      )
    ) {
      throw new TwitterError(`error ${label}: invalid auth token`, {
        type: 'twitter:auth',
        cause: err
      })
    }
  } else if (err.status === 429) {
    throw new TwitterError(`error ${label}: too many requests`, {
      type: 'twitter:rate-limit',
      cause: err
    })
  } else if (err.status === 404) {
    throw new TwitterError(err.toString(), {
      type: 'twitter:forbidden',
      isFinal: true,
      cause: err
    })
  }

  if (err.status >= 400 && err.status < 500) {
    throw new TwitterError(
      `error ${label}: ${err.status} ${
        err.error?.description || err.toString()
      }`,
      {
        type: 'twitter:unknown',
        isFinal: true,
        cause: err
      }
    )
  } else if (err.status >= 500) {
    throw new TwitterError(
      `error ${label}: ${err.status} ${
        err.error?.description || err.toString()
      }`,
      {
        type: 'twitter:unknown',
        isFinal: false,
        cause: err
      }
    )
  }

  const reason = err.toString().toLowerCase()

  if (reason.includes('fetcherror') || reason.includes('enotfound')) {
    throw new TwitterError(err.toString(), {
      type: 'network',
      cause: err
    })
  }

  // Otherwise, propagate the original error
  throw err
}

export function getPrunedTweet(
  tweet: Partial<types.Tweet>
): Partial<types.Tweet> {
  const urls = tweet.entities?.urls
  let text = tweet.text
  if (text && urls) {
    for (const url of urls) {
      if (!url.expanded_url || !url.url) continue
      text = text!.replaceAll(url.url, url.expanded_url!)
    }
  }

  return {
    ...omit(
      tweet,
      'conversation_id',
      'public_metrics',
      'created_at',
      'entities',
      'possibly_sensitive'
    ),
    text
  }
}

export function getPrunedTwitterUser(
  twitterUser: Partial<types.TwitterUser>
): Partial<types.TwitterUser> {
  const urls = twitterUser.entities?.description?.urls
  let description = twitterUser.description
  if (description && urls) {
    for (const url of urls) {
      if (!url.expanded_url || !url.url) continue
      description = description!.replaceAll(url.url, url.expanded_url!)
    }
  }

  return {
    ...omit(
      twitterUser,
      'public_metrics',
      'created_at',
      'verified',
      'protected',
      'url',
      'entities'
    ),
    description
  }
}
