import { AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'

export namespace hackernews {
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
}

/**
 * Basic client for the official Hacker News API.
 *
 * Note that the [HN Algolia API](https://hn.algolia.com/api) seems to no
 * longer be available, so we can't add search without quite a bit of overhead.
 *
 * @see https://github.com/HackerNews/API
 */
export class HackerNewsClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiBaseUrl: string
  protected readonly apiUserAgent: string

  constructor({
    apiBaseUrl = getEnv('HACKER_NEWS_API_BASE_URL') ??
      'https://hacker-news.firebaseio.com',
    apiUserAgent = getEnv('HACKER_NEWS_API_USER_AGENT') ??
      'Agentic (https://github.com/transitive-bullshit/agentic)',
    ky = defaultKy
  }: {
    apiBaseUrl?: string
    apiUserAgent?: string
    ky?: KyInstance
  } = {}) {
    assert(apiBaseUrl, 'HackerNewsClient missing required "apiBaseUrl"')
    super()

    this.apiBaseUrl = apiBaseUrl
    this.apiUserAgent = apiUserAgent

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        'user-agent': apiUserAgent
      }
    })
  }

  async getItem(id: string | number) {
    return this.ky.get(`v0/item/${id}.json`).json<hackernews.Item>()
  }

  async getTopStories() {
    return this.ky.get('v0/topstories.json').json<number[]>()
  }

  async getNewStories() {
    return this.ky.get('v0/newstories.json').json<number[]>()
  }

  async getBestStories() {
    return this.ky.get('v0/beststories.json').json<number[]>()
  }
}
