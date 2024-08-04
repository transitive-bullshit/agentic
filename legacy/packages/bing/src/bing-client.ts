import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  omit
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace bing {
  export const API_BASE_URL = 'https://api.bing.microsoft.com'

  export interface SearchQuery {
    q: string
    mkt?: string
    offset?: number
    count?: number
    safeSearch?: 'Off' | 'Moderate' | 'Strict'
    textDecorations?: boolean
    textFormat?: 'Raw' | 'HTML'
  }

  export interface SearchResponse {
    _type: string
    entities: Entities
    images: Images
    places: Places
    queryContext: QueryContext
    rankingResponse: RankingResponse
    relatedSearches: RelatedSearches
    videos: Videos
    webPages: WebPages
  }

  interface Entities {
    value: EntitiesValue[]
  }

  interface EntitiesValue {
    bingId: string
    contractualRules: PurpleContractualRule[]
    description: string
    entityPresentationInfo: EntityPresentationInfo
    id: string
    image: Image
    name: string
    webSearchUrl: string
  }

  interface PurpleContractualRule {
    _type: string
    license?: DeepLink
    licenseNotice?: string
    mustBeCloseToContent: boolean
    targetPropertyName: string
    text?: string
    url?: string
  }

  interface DeepLink {
    name: string
    url: string
  }

  interface EntityPresentationInfo {
    entityScenario: string
    entityTypeHints: string[]
  }

  interface Image {
    height: number
    hostPageUrl: string
    name: string
    provider: Provider[]
    sourceHeight: number
    sourceWidth: number
    thumbnailUrl: string
    width: number
  }

  interface Provider {
    _type: string
    url: string
  }

  interface Images {
    id: string
    isFamilyFriendly: boolean
    readLink: string
    value: ImagesValue[]
    webSearchUrl: string
  }

  interface ImagesValue {
    contentSize: string
    contentUrl: string
    encodingFormat: string
    height: number
    hostPageDisplayUrl: string
    hostPageUrl: string
    name: string
    thumbnail: Thumbnail
    thumbnailUrl: string
    webSearchUrl: string
    width: number
  }

  interface Thumbnail {
    height: number
    width: number
  }

  interface Places {
    value: PlacesValue[]
  }

  interface PlacesValue {
    _type: string
    address: Address
    entityPresentationInfo: EntityPresentationInfo
    id: string
    name: string
    telephone: string
    url: string
    webSearchUrl: string
  }

  interface Address {
    addressCountry: string
    addressLocality: string
    addressRegion: string
    neighborhood: string
    postalCode: string
  }

  interface QueryContext {
    askUserForLocation: boolean
    originalQuery: string
  }

  interface RankingResponse {
    mainline: Mainline
    sidebar: Mainline
  }

  interface Mainline {
    items: Item[]
  }

  interface Item {
    answerType: string
    resultIndex?: number
    value?: ItemValue
  }

  interface ItemValue {
    id: string
  }

  interface RelatedSearches {
    id: string
    value: RelatedSearchesValue[]
  }

  interface RelatedSearchesValue {
    displayText: string
    text: string
    webSearchUrl: string
  }

  interface Videos {
    id: string
    isFamilyFriendly: boolean
    readLink: string
    scenario: string
    value: VideosValue[]
    webSearchUrl: string
  }

  interface VideosValue {
    allowHttpsEmbed: boolean
    allowMobileEmbed: boolean
    contentUrl: string
    creator: Creator
    datePublished: Date
    description: string
    duration: string
    embedHtml: string
    encodingFormat: EncodingFormat
    height: number
    hostPageDisplayUrl: string
    hostPageUrl: string
    isAccessibleForFree: boolean
    isSuperfresh: boolean
    motionThumbnailUrl: string
    name: string
    publisher: Creator[]
    thumbnail: Thumbnail
    thumbnailUrl: string
    viewCount: number
    webSearchUrl: string
    width: number
  }

  interface Creator {
    name: string
  }

  enum EncodingFormat {
    Mp4 = 'mp4'
  }

  interface WebPages {
    totalEstimatedMatches: number
    value: WebPagesValue[]
    webSearchUrl: string
  }

  interface WebPagesValue {
    dateLastCrawled: Date
    deepLinks?: DeepLink[]
    displayUrl: string
    id: string
    isFamilyFriendly: boolean
    isNavigational: boolean
    language: string
    name: string
    snippet: string
    thumbnailUrl?: string
    url: string
    contractualRules?: FluffyContractualRule[]
  }

  interface FluffyContractualRule {
    _type: string
    license: DeepLink
    licenseNotice: string
    mustBeCloseToContent: boolean
    targetPropertyIndex: number
    targetPropertyName: string
  }
}

/**
 * Bing web search client.
 *
 * @see https://www.microsoft.com/en-us/bing/apis/bing-web-search-api
 */
export class BingClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('BING_API_KEY'),
    apiBaseUrl = bing.API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'BingClient missing required "apiKey" (defaults to "BING_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  @aiFunction({
    name: 'bing_web_search',
    description:
      'Searches the web using the Bing search engine to return the most relevant web pages for a given query. Can also be used to find up-to-date news and information about many topics.',
    inputSchema: z.object({
      q: z.string().describe('search query')
    })
  })
  async search(queryOrOpts: string | bing.SearchQuery) {
    const defaultQuery: Partial<bing.SearchQuery> = {
      mkt: 'en-US'
    }

    const searchParams =
      typeof queryOrOpts === 'string'
        ? {
            ...defaultQuery,
            q: queryOrOpts
          }
        : {
            ...defaultQuery,
            ...queryOrOpts
          }

    // console.log(searchParams)
    const res = await this.ky
      .get('v7.0/search', {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey
        },
        searchParams
      })
      .json<bing.SearchResponse>()

    return omit(res, 'rankingResponse')
  }
}
