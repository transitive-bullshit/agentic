import defaultKy, { type KyInstance } from 'ky'
import { AbortError } from 'p-retry'
import pThrottle from 'p-throttle'

import { assert, getEnv, throttleKy } from '../utils.js'

const diffbotAPIThrottle = pThrottle({
  limit: 5,
  interval: 1000,
  strict: true
})

export namespace diffbot {
  export const API_BASE_URL = 'https://api.diffbot.com'
  export const KNOWLEDGE_GRAPH_API_BASE_URL = 'https://kg.diffbot.com'

  export interface DiffbotExtractOptions {
    /** Specify optional fields to be returned from any fully-extracted pages, e.g.: &fields=querystring,links. See available fields within each API's individual documentation pages.
     * @see https://docs.diffbot.com/reference/extract-optional-fields
     */
    fields?: string[]

    /** (*Undocumented*) Pass paging=false to disable automatic concatenation of multiple-page articles. (By default, Diffbot will concatenate up to 20 pages of a single article.) */
    paging?: boolean

    /** Pass discussion=false to disable automatic extraction of comments or reviews from pages identified as articles or products. This will not affect pages identified as discussions. */
    discussion?: boolean

    /** Sets a value in milliseconds to wait for the retrieval/fetch of content from the requested URL. The default timeout for the third-party response is 30 seconds (30000). */
    timeout?: number

    /** Used to specify the IP address of a custom proxy that will be used to fetch the target page, instead of Diffbot's default IPs/proxies. (Ex: &proxy=168.212.226.204) */
    proxy?: string

    /** Used to specify the authentication parameters that will be used with the proxy specified in the &proxy parameter. (Ex: &proxyAuth=username:password) */
    proxyAuth?: string

    /** `none` will instruct Extract to not use proxies, even if proxies have been enabled for this particular URL globally. */
    useProxy?: string

    /** @see https://docs.diffbot.com/reference/extract-custom-javascript */
    customJs?: string

    /** @see https://docs.diffbot.com/reference/extract-custom-headers */
    customHeaders?: Record<string, string>
  }

  export interface DiffbotExtractAnalyzeOptions extends DiffbotExtractOptions {
    /** Web page URL of the analyze to process */
    url: string

    /** By default the Analyze API will fully extract all pages that match an existing Automatic API -- articles, products or image pages. Set mode to a specific page-type (e.g., mode=article) to extract content only from that specific page-type. All other pages will simply return the default Analyze fields. */
    mode?: string

    /** Force any non-extracted pages (those with a type of "other") through a specific API. For example, to route all "other" pages through the Article API, pass &fallback=article. Pages that utilize this functionality will return a fallbackType field at the top-level of the response and a originalType field within each extracted object, both of which will indicate the fallback API used. */
    fallback?: string
  }

  export interface DiffbotExtractArticleOptions extends DiffbotExtractOptions {
    /** Web page URL of the analyze to process */
    url: string

    /** Set the maximum number of automatically-generated tags to return. By default a maximum of ten tags will be returned. */
    maxTags?: number

    /** Set the minimum relevance score of tags to return, between 0.0 and 1.0. By default only tags with a score equal to or above 0.5 will be returned. */
    tagConfidence?: number

    /** Used to request the output of the Diffbot Natural Language API in the field naturalLanguage. Example: &naturalLanguage=entities,facts,categories,sentiment. */
    naturalLanguage?: string[]
  }

  export interface DiffbotExtractResponse {
    request: DiffbotRequest
    objects: DiffbotObject[]
  }

  export type DiffbotExtractArticleResponse = DiffbotExtractResponse

  export interface DiffbotExtractAnalyzeResponse
    extends DiffbotExtractResponse {
    type: string
    title: string
    humanLanguage: string
  }

  export interface DiffbotObject {
    date: string
    sentiment: number
    images: DiffbotImage[]
    author: string
    estimatedDate: string
    publisherRegion: string
    icon: string
    diffbotUri: string
    siteName: string
    type: string
    title: string
    tags: DiffbotTag[]
    publisherCountry: string
    humanLanguage: string
    authorUrl: string
    pageUrl: string
    html: string
    text: string
    categories?: DiffbotCategory[]
    authors: DiffbotAuthor[]
    breadcrumb?: DiffbotBreadcrumb[]
    items?: DiffbotListItem[]
    meta?: any
  }

  interface DiffbotListItem {
    title: string
    link: string
    summary: string
    image?: string
  }

  interface DiffbotAuthor {
    name: string
    link: string
  }

  interface DiffbotCategory {
    score: number
    name: string
    id: string
  }

  export interface DiffbotBreadcrumb {
    link: string
    name: string
  }

  interface DiffbotImage {
    url: string
    diffbotUri: string

    naturalWidth: number
    naturalHeight: number
    width: number
    height: number

    isCached?: boolean
    primary?: boolean
  }

  interface DiffbotTag {
    score: number
    sentiment: number
    count: number
    label: string
    uri: string
    rdfTypes: string[]
  }

  interface DiffbotRequest {
    pageUrl: string
    api: string
    version: number
  }

  export interface Image {
    naturalHeight: number
    diffbotUri: string
    url: string
    naturalWidth: number
    primary: boolean
  }

  export interface Tag {
    score: number
    sentiment: number
    count: number
    label: string
    uri: string
    rdfTypes: string[]
  }

  export interface Request {
    pageUrl: string
    api: string
    version: number
  }

  export interface DiffbotKnowledgeGraphSearchOptions {
    type?: 'query' | 'text' | 'queryTextFallback' | 'crawl'
    query: string
    col?: string
    from?: number
    size?: number

    // NOTE: we only support `json`, so these options are not needed
    // We can always convert from json to another format if needed.
    // format?: 'json' | 'jsonl' | 'csv' | 'xls' | 'xlsx'
    // exportspec?: string
    // exportseparator?: string
    // exportfile?: string

    filter?: string
    jsonmode?: 'extended' | 'id'
    nonCanonicalFacts?: boolean
    noDedupArticles?: boolean
    cluster?: 'all' | 'best' | 'dedupe'
    report?: boolean
  }

  export interface DiffbotKnowledgeGraphEnhanceOptions {
    type: 'Person' | 'Organization'

    id?: string
    name?: string
    url?: string
    phone?: string
    email?: string
    employer?: string
    title?: string
    school?: string
    location?: string
    ip?: string
    customId?: string

    size?: number
    threshold?: number

    refresh?: boolean
    search?: boolean
    useCache?: boolean

    filter?: string
    jsonmode?: 'extended' | 'id'
    nonCanonicalFacts?: boolean
  }

  export interface DiffbotKnowledgeGraphResponse {
    data: DiffbotKnowledgeGraphNode[]
    version: number
    hits: number
    results: number
    kgversion: string
    diffbot_type: string
    facet?: boolean
    errors?: any[]
  }

  export interface DiffbotKnowledgeGraphNode {
    score: number
    esscore?: number
    entity: DiffbotKnowledgeGraphEntity
    entity_ctx: any
    errors: string[]
    callbackQuery: string
    upperBound: number
    lowerBound: number
    count: number
    value: string
    uri: string
  }

  export interface DiffbotKnowledgeGraphEntity {
    id: string
    diffbotUri: string
    type?: string
    name: string
    images: DiffbotImage[]
    origins: string[]
    nbOrigins?: number

    gender?: DiffbotGender
    githubUri?: string
    importance?: number
    description?: string
    homepageUri?: string
    allNames?: string[]
    skills?: DiffbotSkill[]
    crawlTimestamp?: number
    summary?: string
    image?: string
    types?: string[]
    nbIncomingEdges?: number
    allUris?: string[]
    employments?: DiffbotEmployment[]
    locations?: DiffbotLocation[]
    location?: DiffbotLocation
    allOriginHashes?: string[]
    nameDetail?: DiffbotNameDetail
  }

  interface DiffbotEmployment {
    employer: Entity
  }

  interface Entity {
    image?: string
    types?: string[]
    name: string
    diffbotUri?: string
    type: EntityType
    summary?: string
  }

  type EntityType = 'Organization' | 'Place'

  interface DiffbotGender {
    normalizedValue: string
  }

  interface DiffbotLocation {
    country: Entity
    isCurrent: boolean
    address: string
    latitude: number
    precision: number
    surfaceForm: string
    region: Entity
    longitude: number
  }

  interface DiffbotNameDetail {
    firstName: string
    lastName: string
  }

  interface DiffbotSkill {
    name: string
    diffbotUri: string
  }
}

export class DiffbotClient {
  readonly ky: KyInstance
  readonly kyKnowledgeGraph: KyInstance

  readonly apiKey: string
  readonly apiBaseUrl: string
  readonly apiKnowledgeGraphBaseUrl: string

  constructor({
    apiKey = getEnv('DIFFBOT_API_KEY'),
    apiBaseUrl = diffbot.API_BASE_URL,
    apiKnowledgeGraphBaseUrl = diffbot.KNOWLEDGE_GRAPH_API_BASE_URL,
    timeoutMs = 30_000,
    throttle = true,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    apiKnowledgeGraphBaseUrl?: string
    timeoutMs?: number
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(apiKey, `DiffbotClient missing required "apiKey"`)

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl
    this.apiKnowledgeGraphBaseUrl = apiKnowledgeGraphBaseUrl

    const throttledKy = throttle ? throttleKy(ky, diffbotAPIThrottle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs
    })

    this.kyKnowledgeGraph = throttledKy.extend({
      prefixUrl: apiKnowledgeGraphBaseUrl,
      timeout: timeoutMs
    })
  }

  protected async _extract<
    T extends diffbot.DiffbotExtractResponse = diffbot.DiffbotExtractResponse
  >(endpoint: string, options: diffbot.DiffbotExtractOptions): Promise<T> {
    const { customJs, customHeaders, ...rest } = options
    const searchParams: Record<string, any> = {
      ...rest,
      token: this.apiKey
    }
    const headers = {
      ...Object.fromEntries(
        [['X-Forward-X-Evaluate', customJs]].filter(([, value]) => value)
      ),
      ...customHeaders
    }

    for (const [key, value] of Object.entries(rest)) {
      if (Array.isArray(value)) {
        searchParams[key] = value.join(',')
      }
    }

    // TODO
    const { url } = searchParams
    if (url) {
      const parsedUrl = new URL(url)
      if (parsedUrl.hostname.includes('theguardian.com')) {
        throw new AbortError(
          `Diffbot does not support URLs from domain "${parsedUrl.hostname}"`
        )
      }
    }

    // console.log(`DiffbotClient._extract: ${endpoint}`, searchParams)

    return this.ky
      .get(endpoint, {
        searchParams,
        headers,
        retry: 1
      })
      .json<T>()
  }

  async extractAnalyze(options: diffbot.DiffbotExtractAnalyzeOptions) {
    return this._extract<diffbot.DiffbotExtractAnalyzeResponse>(
      'v3/analyze',
      options
    )
  }

  async extractArticle(options: diffbot.DiffbotExtractArticleOptions) {
    return this._extract<diffbot.DiffbotExtractArticleResponse>(
      'v3/article',
      options
    )
  }

  async knowledgeGraphSearch(
    options: diffbot.DiffbotKnowledgeGraphSearchOptions
  ) {
    return this.kyKnowledgeGraph
      .get('kg/v3/dql', {
        searchParams: {
          ...options,
          token: this.apiKey
        }
      })
      .json<diffbot.DiffbotKnowledgeGraphResponse>()
  }

  async knowledgeGraphEnhance(
    options: diffbot.DiffbotKnowledgeGraphEnhanceOptions
  ) {
    return this.kyKnowledgeGraph
      .get('kg/v3/enhance', {
        searchParams: {
          ...options,
          token: this.apiKey
        }
      })
      .json<diffbot.DiffbotKnowledgeGraphResponse>()
  }
}
