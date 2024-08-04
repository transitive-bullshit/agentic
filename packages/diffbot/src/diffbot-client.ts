import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

export namespace diffbot {
  export const API_BASE_URL = 'https://api.diffbot.com'
  export const KNOWLEDGE_GRAPH_API_BASE_URL = 'https://kg.diffbot.com'

  // Allow up to 5 requests per second by default.
  // https://docs.diffbot.com/reference/rate-limits
  export const throttle = pThrottle({
    limit: 5,
    interval: 1000,
    strict: true
  })

  export interface ExtractOptions {
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

  export interface ExtractAnalyzeOptions extends ExtractOptions {
    /** URL of the web page to process */
    url: string

    /** By default the Analyze API will fully extract all pages that match an existing Automatic API -- articles, products or image pages. Set mode to a specific page-type (e.g., mode=article) to extract content only from that specific page-type. All other pages will simply return the default Analyze fields. */
    mode?: string

    /** Force any non-extracted pages (those with a type of "other") through a specific API. For example, to route all "other" pages through the Article API, pass &fallback=article. Pages that utilize this functionality will return a fallbackType field at the top-level of the response and a originalType field within each extracted object, both of which will indicate the fallback API used. */
    fallback?: string
  }

  export interface ExtractArticleOptions extends ExtractOptions {
    /** URL of the web page to process */
    url: string

    /** Set the maximum number of automatically-generated tags to return. By default a maximum of ten tags will be returned. */
    maxTags?: number

    /** Set the minimum relevance score of tags to return, between 0.0 and 1.0. By default only tags with a score equal to or above 0.5 will be returned. */
    tagConfidence?: number

    /** Used to request the output of the Diffbot Natural Language API in the field naturalLanguage. Example: &naturalLanguage=entities,facts,categories,sentiment. */
    naturalLanguage?: string[]
  }

  export interface ExtractResponse {
    request: DiffbotRequest
    objects: DiffbotObject[]
  }

  export type ExtractArticleResponse = ExtractResponse

  export interface ExtractAnalyzeResponse extends ExtractResponse {
    type: string
    title: string
    humanLanguage: string
  }

  export interface DiffbotObject {
    type: string
    title: string
    pageUrl: string
    diffbotUri: string
    description?: string
    date?: string
    sentiment?: number
    author?: string
    estimatedDate?: string
    publisherRegion?: string
    icon?: string
    siteName?: string
    publisherCountry?: string
    humanLanguage?: string
    authorUrl?: string
    html?: string
    text?: string
    images?: Image[]
    tags?: Tag[]
    categories?: ObjectCategory[]
    authors?: Author[]
    breadcrumb?: Breadcrumb[]
    items?: ListItem[]
    meta?: any
  }

  export interface ListItem {
    title: string
    link: string
    summary: string
    image?: string
  }

  export interface Author {
    name: string
    link: string
  }

  export interface ObjectCategory {
    score: number
    name: string
    id: string
  }

  export interface Breadcrumb {
    link: string
    name: string
  }

  export interface Image {
    url: string
    diffbotUri: string

    naturalWidth: number
    naturalHeight: number
    width: number
    height: number

    isCached?: boolean
    primary?: boolean
  }

  export interface Tag {
    score: number
    sentiment: number
    count: number
    label: string
    uri: string
    rdfTypes: string[]
  }

  export interface DiffbotRequest {
    pageUrl: string
    api: string
    version: number
  }

  export interface KnowledgeGraphSearchOptions {
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

  export interface KnowledgeGraphEnhanceOptions {
    type: EntityType

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

  export interface KnowledgeGraphResponse {
    data: KnowledgeGraphNode[]
    version: number
    hits: number
    results: number
    kgversion: string
    diffbot_type: string
    facet?: boolean
    errors?: any[]
  }

  export interface KnowledgeGraphNode {
    score: number
    esscore?: number
    entity: KnowledgeGraphEntity
    entity_ctx: any
    errors: string[]
    callbackQuery: string
    upperBound: number
    lowerBound: number
    count: number
    value: string
    uri: string
  }

  export interface KnowledgeGraphEntity {
    id: string
    diffbotUri: string
    type?: string
    name: string
    images: Image[]
    origins: string[]
    nbOrigins?: number

    gender?: Gender
    githubUri?: string
    importance?: number
    description?: string
    homepageUri?: string
    allNames?: string[]
    skills?: Partial<BasicEntity>[]
    crawlTimestamp?: number
    summary?: string
    image?: string
    types?: string[]
    nbIncomingEdges?: number
    allUris?: string[]
    employments?: Employment[]
    locations?: Location[]
    location?: Location
    allOriginHashes?: string[]
    nameDetail?: NameDetail
  }

  export type EntityType = 'Organization' | 'Place'

  export const EnhanceEntityOptionsSchema = z.object({
    type: z.enum(['Person', 'Organization']),
    id: z
      .string()
      .optional()
      .describe('Diffbot ID of the entity to enhance if known'),
    name: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Name of the entity'),
    url: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Origin or homepage URL of the entity'),
    phone: z.string().optional().describe('Phone number of the entity'),
    email: z.string().optional().describe('Email of the entity'),
    employer: z
      .string()
      .optional()
      .describe("Name of the entity's employer (for Person entities)"),
    title: z
      .string()
      .optional()
      .describe('Title of the entity (for Person entities)'),
    school: z
      .string()
      .optional()
      .describe('School of the entity (for Person entities)'),
    location: z.string().optional().describe('Location of the entity'),
    ip: z.string().optional().describe('IP address of the entity'),
    customId: z.string().optional().describe('User-defined ID for correlation'),
    threshold: z.number().optional().describe('Similarity threshold'),
    refresh: z
      .boolean()
      .optional()
      .describe(
        'If set, will attempt to refresh the entity data by recrawling the source URLs.'
      ),
    search: z
      .boolean()
      .optional()
      .describe(
        'If set, will attempt to search the web for the entity and merge the results into its knowledge base.'
      ),
    size: z
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .describe('Number of results to return')
  })
  export type EnhanceEntityOptions = z.infer<typeof EnhanceEntityOptionsSchema>

  export interface EnhanceEntityResponse {
    version: number
    hits: number
    kgversion: string
    request_ctx: RequestCtx
    data: EnhanceEntityResult[]
    errors: any[]
  }

  export interface RequestCtx {
    query: Query
    query_ctx: QueryCtx
  }

  export interface Query {
    type: string
    name: string[]
  }

  export interface QueryCtx {
    search: string
  }

  export interface EnhanceEntityResult {
    score: number
    esscore: number
    entity: Entity
    errors: any[]
  }

  export interface Entity {
    name: string
    type: EntityType
    id: string
    summary?: string
    description?: string
    homepageUri?: string
    twitterUri?: string
    linkedInUri?: string
    githubUri?: string
    crunchbaseUri?: string
    googlePlusUri?: string
    facebookUri?: string
    angellistUri?: string
    wikipediaUri?: string
    diffbotUri?: string
    origin?: string
    origins?: string[]
    allUris?: string[]

    // extra metadata
    nbOrigins?: number
    nbIncomingEdges?: number
    nbFollowers?: number
    nbLocations?: number
    nbEmployees?: number
    nbEmployeesMin?: number
    nbEmployeesMax?: number
    nbActiveEmployeeEdges?: number
    nbUniqueInvestors?: number
    educations?: Education[]
    nationalities?: Nationality[]
    fullName?: string
    allNames?: string[]
    skills?: Partial<BasicEntity>[]
    children?: BasicEntity[]
    height?: number
    image?: string
    images?: Image[]
    allOriginHashes?: string[]
    nameDetail?: NameDetail
    parents?: BasicEntity[]
    gender?: Gender
    importance?: number
    monthlyTraffic?: number
    monthlyTrafficGrowth?: number
    wikipediaPageviews?: number
    wikipediaPageviewsLastQuarterGrowth?: number
    wikipediaPageviewsLastYear?: number
    wikipediaPageviewsLastYearGrowth?: number
    wikipediaPageviewsLastQuarter?: number
    wikipediaPageviewsGrowth?: number
    birthPlace?: Location
    types?: string[]
    unions?: Union[]
    languages?: Language[]
    employments?: Employment[]
    birthDate?: DateTime
    religion?: Partial<BasicEntity>
    awards?: Award[]
    netWorth?: Amount
    allDescriptions?: string[]
    locations?: Location[]
    location?: Location
    interests?: Interest[]
    suppliers?: BasicEntity[]
    subsidiaries?: BasicEntity[]
    ipo?: {
      date: DateTime
      stockExchange: string
    }
    motto?: string
    logo?: string
    foundingDate?: DateTime
    totalInvestment?: Amount
    naicsClassification2017?: any[]
    naicsClassification?: any[]
    sicClassification?: any[]
    naceClassification?: any[]
    iSicClassification?: any[]
    employeeCategories?: any[]
    emailAddresses?: EmailAddress[]
    age?: number
    isPublic?: boolean
    isAcquired?: boolean
    isDissolved?: boolean
    isNonProfit?: boolean
    crawlTimestamp?: number
    founders?: BasicEntity[]
    boardMembers?: BasicEntity[]
    ceo?: BasicEntity
    investments?: Investment[]
    acquiredBy?: BasicEntity[]
    diffbotClassification?: any[]
    blogUri?: string
    descriptors?: string[]
    industries?: string[]
    partnerships?: BasicEntity[]
    categories?: Category[]
    customers?: BasicEntity[]
    technographics?: Technographic[]
    stock?: Stock
    companiesHouseIds?: string[]
    yearlyRevenues?: AnnualRevenue[]
    revenue?: Amount
    parentCompany?: BasicEntity
    legalEntities?: BasicEntity[]
  }

  export interface AnnualRevenue {
    revenue: Amount
    isCurrent: boolean
    year: number
    filingDate: DateTime
    revenueDate: DateTime
  }

  export interface Technographic {
    technology: Partial<BasicEntity>
    categories: string[]
  }

  export interface Category {
    level?: number
    isPrimary?: boolean
    name: string
    diffbotUri?: string
    targetDiffbotId?: string
    type?: string
  }

  export interface Investment {
    date: DateTime
    amount?: Amount
    isCurrent: boolean
    series: string
    investors: BasicEntity[]
  }

  export interface Amount {
    currency: string
    value: number
  }

  export interface EmailAddress {
    contactString: string
    type: string
  }

  export interface Education {
    institution: BasicEntity
    isCurrent?: boolean
    major?: BasicEntity
    degree?: BasicEntity
    from?: DateTime
    to?: DateTime
  }

  export interface DateTime {
    str: string
    precision: number
    timestamp: number
  }

  export interface Nationality {
    name: string
    type: string
  }

  export interface Image {
    url: string
    primary?: boolean
  }

  export interface NameDetail {
    firstName: string
    lastName: string
    middleName?: string[]
  }

  export interface Gender {
    normalizedValue: string
  }

  export interface Stock {
    symbol: string
    isCurrent: boolean
    exchange: string
  }

  export interface Union {
    person: BasicEntity
    from?: DateTime
    to?: DateTime
    type?: string
  }

  export interface BasicEntity {
    name: string
    summary: string
    type: string
    image?: string
    types?: string[]
    diffbotUri: string
    targetDiffbotId: string
  }

  export interface Language {
    str: string
    normalizedValue: string
  }

  export interface Employment {
    isCurrent?: boolean
    title?: string
    description?: string
    employer?: BasicEntity
    location?: Location
    categories?: Partial<BasicEntity>[]
    from?: DateTime
    to?: DateTime
  }

  export interface Location {
    isCurrent: boolean
    country?: BasicEntity
    address?: string
    city?: BasicEntity
    street?: string
    metroArea?: BasicEntity
    subregion?: BasicEntity
    surfaceForm?: string
    latitude?: number
    longitude?: number
    postalCode?: string
    region?: BasicEntity
    precision?: number
  }

  export interface Award {
    title: string
    date?: DateTime
  }

  export interface Interest {
    name: string
    type: string
  }
}

/**
 * Diffbot provides web page classification and scraping. It also provides
 * access to a knowledge graph with the ability to perform person and company
 * data enrichment.
 *
 * @see https://docs.diffbot.com
 */
export class DiffbotClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly kyKnowledgeGraph: KyInstance

  protected readonly apiKey: string
  protected readonly apiBaseUrl: string
  protected readonly apiKnowledgeGraphBaseUrl: string

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
    assert(
      apiKey,
      `DiffbotClient missing required "apiKey" (defaults to "DIFFBOT_API_KEY")`
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl
    this.apiKnowledgeGraphBaseUrl = apiKnowledgeGraphBaseUrl

    const throttledKy = throttle ? throttleKy(ky, diffbot.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs
    })

    this.kyKnowledgeGraph = throttledKy.extend({
      prefixUrl: apiKnowledgeGraphBaseUrl,
      timeout: timeoutMs
    })
  }

  @aiFunction({
    name: 'diffbot_analyze_url',
    description:
      'Scrapes and extracts structured data from a web page. Also classifies the web page as one of several types (article, product, discussion, job, image, video, list, event, or other).',
    inputSchema: z.object({
      url: z.string().url().describe('The URL to process.')
    })
  })
  async analyzeUrl(options: diffbot.ExtractAnalyzeOptions) {
    return this._extract<diffbot.ExtractAnalyzeResponse>('v3/analyze', options)
  }

  @aiFunction({
    name: 'diffbot_extract_article_from_url',
    description:
      'Scrapes and extracts clean article text from news articles, blog posts, and other text-heavy web pages.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL to process.')
    })
  })
  async extractArticleFromUrl(options: diffbot.ExtractArticleOptions) {
    return this._extract<diffbot.ExtractArticleResponse>('v3/article', options)
  }

  @aiFunction({
    name: 'diffbot_enhance_entity',
    description:
      'Resolves and enriches a partial person or organization entity.',
    inputSchema: diffbot.EnhanceEntityOptionsSchema.omit({
      refresh: true,
      search: true,
      customId: true,
      threshold: true
    })
  })
  async enhanceEntity(
    opts: diffbot.EnhanceEntityOptions
  ): Promise<diffbot.EnhanceEntityResponse> {
    return this.kyKnowledgeGraph
      .get('kg/v3/enhance', {
        searchParams: sanitizeSearchParams({
          ...opts,
          token: this.apiKey
        })
      })
      .json<diffbot.EnhanceEntityResponse>()
  }

  async searchKnowledgeGraph(options: diffbot.KnowledgeGraphSearchOptions) {
    return this.kyKnowledgeGraph
      .get('kg/v3/dql', {
        searchParams: {
          ...options,
          token: this.apiKey
        }
      })
      .json<diffbot.KnowledgeGraphResponse>()
  }

  async enhanceKnowledgeGraph(options: diffbot.KnowledgeGraphEnhanceOptions) {
    return this.kyKnowledgeGraph
      .get('kg/v3/enhance', {
        searchParams: {
          ...options,
          token: this.apiKey
        }
      })
      .json<diffbot.KnowledgeGraphResponse>()
  }

  protected async _extract<
    T extends diffbot.ExtractResponse = diffbot.ExtractResponse
  >(endpoint: string, options: diffbot.ExtractOptions): Promise<T> {
    const { customJs, customHeaders, ...rest } = options
    const searchParams = sanitizeSearchParams({
      ...rest,
      token: this.apiKey
    })
    const headers = {
      ...Object.fromEntries(
        [['X-Forward-X-Evaluate', customJs]].filter(([, value]) => value)
      ),
      ...customHeaders
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
}
