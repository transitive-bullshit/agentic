import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'

import { assert, getEnv, throttleKy } from '../utils.js'

export namespace perigon {
  // Allow up to 20 requests per minute by default.
  export const throttle = pThrottle({
    limit: 20,
    interval: 60 * 1000,
    strict: true
  })

  export type ArticleLabel =
    | 'Opinion'
    | 'Non-news'
    | 'Paid News'
    | 'Fact Check'
    | 'Pop Culture'
    | 'Roundup'
    | 'Press Release'

  export type Categories =
    | 'Politics'
    | 'Tech'
    | 'Sports'
    | 'Business'
    | 'Finance'
    | 'Entertainment'
    | 'Health'
    | 'Weather'
    | 'Lifestyle'
    | 'Auto'
    | 'Science'
    | 'Travel'
    | 'Environment'
    | 'World'
    | 'General'
    | 'none'

  export type ArticlesOptions = {
    q: string
    title?: string
    desc?: string
    content?: string
    url?: string
    from?: string | Date
    to?: string | Date
    addDateFrom?: string | Date
    addDateTo?: string | Date
    refreshDateFrom?: string | Date
    refreshDateTo?: string | Date
    articleId?: string
    clusterId?: string
    medium?: 'article' | 'video'
    source?: string
    sourceGroup?:
      | 'top10'
      | 'top100'
      | 'top500English'
      | 'top25crypto'
      | 'top25finance'
      | 'top50tech'
      | 'top100sports'
      | 'top100leftUS'
      | 'top100rightUS'
      | 'top100centerUS'
    excludeSource?: string
    paywall?: boolean
    country?: string
    language?: string
    label?: ArticleLabel
    excludeLabel?: ArticleLabel | 'Low Content'
    byline?: string
    topic?: string
    category?: Categories
    journalistId?: string
    state?: string
    city?: string
    area?: string
    location?: string
    sortBy?: 'date' | 'relevance' | 'addDate' | 'pubDate' | 'refreshDate'
    relevance?: number
    size?: number
    showReprints?: boolean
    showNumResults?: boolean
    type?: 'all' | 'local' | 'world'
    linkTo?: string
    reprintGroupId?: string
    personWikidataId?: string[]
    personName?: string[]
    companyId?: string[]
    companyName?: string
    companyDomain?: string[]
    companySymbol?: string[]
    maxDistance?: number
    lat?: number
    lon?: number
    searchTranslation?: boolean
  }

  export type ArticlesResponse = {
    status: number
    numResults: number
    articles: Article[]
  }

  export type Article = {
    url: string
    authorsByline: string
    articleId: string
    clusterId: string
    source: {
      domain: string
    }
    imageUrl: string
    country: string
    language: string
    pubDate: string
    addDate: string
    refreshDate: string
    score: number
    title: string
    description: string
    content: string
    medium: string
    links: string[]
    labels: string[]
    matchedAuthors: string[]
    claim: string
    verdict: string
    keywords: {
      name: string
      weight: number
    }[]
    topics: {
      name: string
    }[]
    categories: {
      name: string
    }[]
    entities: {
      data: string
      type: string
      mentions: number
    }[]
    sentiment: {
      positive: number
      negative: number
      neutral: number
    }
    summary: string
    translation: string
    locations: string[]
    reprint: boolean
    reprintGroupId: string
    places: null
  }

  export type StoriesOptions = {
    clusterId?: string
    topic?: string
    category?: Categories
    q?: string
    name?: string
    nameExists?: boolean
    from?: string
    to?: string
    initializedFrom?: string
    initializedTo?: string
    updatedFrom?: string
    updatedTo?: string
    minClusterSize?: number
    maxClusterSize?: number
    state?: string
    city?: string
    area?: string
    page?: number
    size?: number
    sortBy?: 'count' | 'createdAt' | 'updatedAt'
    showNumResults?: boolean
  }

  export type StoriesResponse = {
    status: number
    numResults: number
    results: Story[]
  }

  export type Story = {
    createdAt: string
    updatedAt: string
    initializedAt: string
    id: string
    name: string
    summary: string
    summaryReferences: Array<any>
    keyPoints: Array<{
      point: string
      references: Array<string>
    }>
    sentiment: {
      positive: number
      negative: number
      neutral: number
    }
    uniqueCount: number
    reprintCount: number
    totalCount: number
    countries: Array<{
      name: string
      count: number
    }>
    topCountries: Array<string>
    topics: Array<{
      name: string
      count: number
    }>
    topTopics: Array<{ name: string }>
    categories: Array<{
      name: string
      count: number
    }>
    topCategories: Array<{ name: string }>
    people: Array<{ wikidataId: string; name: string; count: number }>
    topPeople: Array<{ wikidataId: string; name: string }>
    companies: Array<{
      id: string
      name: string
      domains: Array<string>
      symbols: Array<string>
      count: number
    }>
    topCompanies: Array<{
      id: string
      name: string
      domains: Array<string>
      symbols: Array<string>
    }>
    locations: Array<{
      state: string
      city?: string
      area?: string
      county?: string
      count: number
    }>
    topLocations: Array<{
      state: string
      city?: string
      area?: string
      county?: string
    }>
  }
}

/**
 * @see https://www.goperigon.com
 */
export class PerigonClient {
  readonly ky: KyInstance
  readonly apiKey: string
  readonly _maxPageSize = 10

  constructor({
    apiKey = getEnv('PERIGON_API_KEY'),
    timeoutMs = 30_000,
    throttle = true,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    throttle?: boolean
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    assert(apiKey, 'Error PerigonClient missing required "apiKey"')

    this.apiKey = apiKey

    const throttledKy = throttle ? throttleKy(ky, perigon.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: 'https://api.goperigon.com/v1/',
      timeout: timeoutMs
    })
  }

  async articles(options: perigon.ArticlesOptions) {
    return this.ky
      .get('all', {
        // @ts-expect-error there are multiple query params that array of strings
        // and KY SearchParamsOption shows a TS error for those types
        searchParams: {
          apiKey: this.apiKey,
          ...options,
          size: Math.min(this._maxPageSize, options.size || this._maxPageSize)
        }
      })
      .json<perigon.ArticlesResponse>()
  }

  async stories(options: perigon.StoriesOptions) {
    return this.ky
      .get('stories/all', {
        searchParams: {
          apiKey: this.apiKey,
          ...options,
          size: Math.min(this._maxPageSize, options.size || this._maxPageSize)
        }
      })
      .json<perigon.StoriesResponse>()
  }
}
