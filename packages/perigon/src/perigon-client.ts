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

// TODO: https://docs.goperigon.com/docs/searching-sources
// TODO: https://docs.goperigon.com/docs/journalist-data
// TODO: https://docs.goperigon.com/docs/topics

export namespace perigon {
  // Allow up to 2 requests per second by default.
  export const throttle = pThrottle({
    limit: 2,
    interval: 1000,
    strict: true
  })

  export const DEFAULT_PAGE_SIZE = 10
  export const MAX_PAGE_SIZE = 100

  export const ArticleLabelSchema = z.union([
    z.literal('Opinion'),
    z.literal('Non-news'),
    z.literal('Paid News'),
    z.literal('Fact Check'),
    z.literal('Pop Culture'),
    z.literal('Roundup'),
    z.literal('Press Release')
  ])
  export type ArticleLabel = z.infer<typeof ArticleLabelSchema>

  export const CategoriesSchema = z.union([
    z.literal('Politics'),
    z.literal('Tech'),
    z.literal('Sports'),
    z.literal('Business'),
    z.literal('Finance'),
    z.literal('Entertainment'),
    z.literal('Health'),
    z.literal('Weather'),
    z.literal('Lifestyle'),
    z.literal('Auto'),
    z.literal('Science'),
    z.literal('Travel'),
    z.literal('Environment'),
    z.literal('World'),
    z.literal('General'),
    z.literal('none')
  ])
  export type Categories = z.infer<typeof CategoriesSchema>

  export const SourceGroupSchema = z.union([
    z.literal('top10').describe('Top 10 most popular sources globally'),
    z.literal('top100').describe('Top 100 most popular sources globally'),
    z
      .literal('top500English')
      .describe('Top 500 most popular (English) sources globally'),
    z
      .literal('top25crypto')
      .describe(
        'Top 25 most popular sources covering cryptocurrency & blockchain developments'
      ),
    z
      .literal('top25finance')
      .describe(
        'Top 25 most popular sources covering financial news, movement in the markets & public equities'
      ),
    z
      .literal('top50tech')
      .describe('Top 50 sources covering new technology & businesses in tech'),
    z
      .literal('top100sports')
      .describe(
        'Top 100 most popular (English) sources covering sports of all types'
      ),
    z
      .literal('top100leftUS')
      .describe(
        'Top 100 most popular (US) sources with an average political bias rating of Left or Leans Left'
      ),
    z
      .literal('top100rightUS')
      .describe(
        'Top 100 most popular (US) sources with an average political bias rating of Right or Leans Right'
      ),
    z
      .literal('top100centerUS')
      .describe(
        'Top 100 most popular (US) sources with an average political bias rating of Center or Middle'
      )
  ])
  export type SourceGroup = z.infer<typeof SourceGroupSchema>

  export const SortBySchema = z.union([
    z.literal('date'),
    z.literal('relevance'),
    z.literal('addDate'),
    z.literal('pubDate'),
    z.literal('refreshDate')
  ])
  export type SortBy = z.infer<typeof SortBySchema>

  export const ArticlesSearchOptionsSchema = z.object({
    q: z.string()
      .describe(`Search query. It may use boolean operators (AND, OR, NOT) and quotes for exact matching. Example search queries:

- election news
- "elon musk" AND tesla
- (upcoming release OR launch) AND apple
- (Google OR Amazon) AND NOT ("Jeff Bezos" OR Android)
- "climate change"
`),
    title: z
      .string()
      .optional()
      .describe(
        'Search query which applies only to article titles / headlines.'
      ),
    desc: z.string().optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    from: z
      .string()
      .optional()
      .describe(
        'Filter to only return articles published after the specified date (ISO or "yyyy-mm-dd" format)'
      ),
    to: z
      .string()
      .optional()
      .describe(
        'Filter to only return articles published before the specified date (ISO or "yyyy-mm-dd" format)'
      ),
    addDateFrom: z.string().optional(),
    addDateTo: z.string().optional(),
    refreshDateFrom: z.string().optional(),
    refreshDateTo: z.string().optional(),
    articleId: z.string().optional(),
    clusterId: z.string().optional(),
    medium: z.union([z.literal('article'), z.literal('video')]).optional(),
    source: z
      .string()
      .optional()
      .describe("Filter articles from a specific publisher's source domain."),
    sourceGroup: SourceGroupSchema.optional().describe(
      'The source group to retrieve articles from.'
    ),
    excludeSource: z
      .string()
      .optional()
      .describe(
        'Source website domains which should be excluded from the search. Wildcards (* and ?) are suported (e.g. "*.cnn.com").'
      ),
    paywall: z
      .boolean()
      .optional()
      .describe(
        'Filter to show only results where the source has a paywall (true) or does not have a paywall (false).'
      ),
    country: z
      .string()
      .optional()
      .describe('Country code to filter by country.'),
    language: z.string().optional(),
    label: ArticleLabelSchema.optional().describe(
      'Labels to filter by, could be "Opinion", "Paid-news", "Non-news", etc. If multiple parameters are passed, they will be applied as OR operations.'
    ),
    excludeLabel: z
      .array(z.union([ArticleLabelSchema, z.literal('Low Content')]))
      .optional()
      .describe(
        'Exclude results that include specific labels ("Opinion", "Non-news", "Paid News", etc.). You can filter multiple by repeating the parameter.'
      ),
    byline: z.string().optional(),
    topic: z.string().optional(),
    category: CategoriesSchema.optional().describe(
      'Filter by categories. Categories are general themes that the article is about. Examples of categories: Tech, Politics, etc. If multiple parameters are passed, they will be applied as OR operations. Use "none" to search uncategorized articles.'
    ),
    journalistId: z.string().optional(),
    state: z
      .string()
      .optional()
      .describe(
        'Filters articles where a specified state plays a central role in the content, beyond mere mentions, to ensure the results are deeply relevant to the state in question.'
      ),
    city: z
      .string()
      .optional()
      .describe(
        'Filters articles where a specified city plays a central role in the content, beyond mere mentions, to ensure the results are deeply relevant to the urban area in question.'
      ),
    area: z
      .string()
      .optional()
      .describe(
        'Filters articles where a specified area, such as a neighborhood, borough, or district, plays a central role in the content, beyond mere mentions, to ensure the results are deeply relevant to the area in question.'
      ),
    location: z.string().optional(),
    sortBy: SortBySchema.default('relevance')
      .optional()
      .describe('How to sort the article results.'),
    showReprints: z
      .boolean()
      .optional()
      .describe(
        'Whether to return reprints in the response or not. Reprints are usually wired articles from sources like AP or Reuters that are reprinted in multiple sources at the same time. By default, this parameter is "true".'
      ),
    showNumResults: z.boolean().optional(),
    type: z
      .union([z.literal('all'), z.literal('local'), z.literal('world')])
      .optional(),
    linkTo: z.string().optional(),
    reprintGroupId: z.string().optional(),
    personWikidataId: z.array(z.string()).optional(),
    personName: z
      .array(z.string())
      .optional()
      .describe('List of person names for exact matches.'),
    companyId: z.array(z.string()).optional(),
    companyName: z.string().optional().describe('Search by company name.'),
    companyDomain: z
      .array(z.string())
      .optional()
      .describe('Search by company domain.'),
    companySymbol: z
      .array(z.string())
      .optional()
      .describe('Search by company stock ticker symbol.'),
    maxDistance: z.number().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    searchTranslation: z
      .boolean()
      .optional()
      .describe(
        'Expand a query to search the translation, translatedTitle, and translatedDescription fields for non-English articles.'
      ),
    page: z
      .number()
      .int()
      .positive()
      .max(10_000)
      .default(0)
      .optional()
      .describe('Page number of results to return (zero-based)'),
    size: z
      .number()
      .int()
      .positive()
      .max(DEFAULT_PAGE_SIZE)
      .optional()
      .describe('Number of results to return per page')
  })
  export type ArticlesSearchOptions = z.infer<
    typeof ArticlesSearchOptionsSchema
  >

  export const StoriesSearchOptionsSchema = ArticlesSearchOptionsSchema.pick({
    q: true,
    clusterId: true,
    topic: true,
    category: true,
    from: true,
    to: true,
    state: true,
    city: true,
    area: true,
    showNumResults: true,
    page: true,
    size: true,
    sourceGroup: true,
    personWikidataId: true,
    personName: true,
    companyId: true,
    companyName: true,
    companyDomain: true,
    companySymbol: true
  }).extend({
    name: z.string().optional().describe('Search stories by name.'),
    nameExists: z.boolean().optional(),
    initializedFrom: z.string().optional(),
    initializedTo: z.string().optional(),
    updatedFrom: z.string().optional(),
    updatedTo: z.string().optional(),
    minClusterSize: z.number().optional(),
    maxClusterSize: z.number().optional(),
    showDuplicates: z
      .boolean()
      .optional()
      .describe(
        'Stories are deduplicated by default. If a story is deduplicated, all future articles are merged into the original story. `duplicateOf` field contains the original cluster id. When showDuplicates=true, all stories are shown.'
      ),
    sortBy: z
      .union([
        z.literal('count'),
        z.literal('createdAt'),
        z.literal('updatedAt')
      ])
      .optional()
      .describe('How to sort the results.')
  })
  export type StoriesSearchOptions = z.infer<typeof StoriesSearchOptionsSchema>

  export const PeopleSearchOptionsSchema = z.object({
    name: z
      .string()
      .describe(
        'Person name query to search for. It may use boolean operators (AND, OR, NOT) and quotes for exact matching.'
      ),
    wikidataId: z
      .array(z.string())
      .optional()
      .describe('Search by ID of Wikidata entity.'),
    occupationId: z
      .array(z.string())
      .optional()
      .describe('Search by Wikidata occupation ID.'),
    occupationLabel: z
      .string()
      .optional()
      .describe('Search by occupation name.'),
    size: z
      .number()
      .int()
      .positive()
      .max(DEFAULT_PAGE_SIZE)
      .optional()
      .describe('Number of results to return per page')
  })
  export type PeopleSearchOptions = z.infer<typeof PeopleSearchOptionsSchema>

  export const CompanySearchOptionsSchema = z.object({
    q: z
      .string()
      .optional()
      .describe(
        'Company search query. It may use boolean operators (AND, OR, NOT) and quotes for exact matching.'
      ),
    name: z
      .string()
      .optional()
      .describe(
        'Search by company name. It may use boolean operators (AND, OR, NOT) and quotes for exact matching.'
      ),
    industry: z
      .string()
      .optional()
      .describe(
        'Search by company industry. It may use boolean operators (AND, OR, NOT) and quotes for exact matching.'
      ),
    sector: z
      .string()
      .optional()
      .describe(
        'Search by company sector. It may use boolean operators (AND, OR, NOT) and quotes for exact matching.'
      ),
    id: z.array(z.string()).optional().describe('Search by company ID.'),
    symbol: z
      .array(z.string())
      .optional()
      .describe('Search by company stock ticker symbol.'),
    domain: z
      .array(z.string())
      .optional()
      .describe('Search by company domain.'),
    country: z.string().optional().describe('Search by country.'),
    exchange: z.string().optional().describe('Search by exchange name.'),
    numEmployeesFrom: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Minimum number of employees.'),
    numEmployeesTo: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Maximum number of employees.'),
    ipoFrom: z
      .string()
      .optional()
      .describe('Starting IPO date (ISO or "yyyy-mm-dd" format)'),
    ipoTo: z
      .string()
      .optional()
      .describe('Ending IPO date (ISO or "yyyy-mm-dd" format)'),
    size: z
      .number()
      .int()
      .positive()
      .max(DEFAULT_PAGE_SIZE)
      .optional()
      .describe('Number of results to return per page')
  })
  export type CompanySearchOptions = z.infer<typeof CompanySearchOptionsSchema>

  export type ArticlesSearchResponse = {
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

  export type StoriesSearchResponse = {
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

  export interface PeopleSearchResponse {
    status: number
    numResults: number
    results: Person[]
  }

  export interface Person {
    wikidataId: string
    name: string
    gender: Gender
    dateOfBirth: DateOfBirth
    dateOfDeath: any
    description: string
    aliases: string[]
    occupation: Occupation[]
    position: Position[]
    politicalParty: PoliticalParty[]
    image?: Image
    abstract: string
  }

  export interface Gender {
    wikidataId: string
    label: string
  }

  export interface DateOfBirth {
    time: string
    precision: string
  }

  export interface Occupation {
    wikidataId: string
    label: string
  }

  export interface Position {
    wikidataId: string
    label: string
    startTime: any
    endTime: any
    employer: any
  }

  export interface PoliticalParty {
    wikidataId: string
    label: string
    startTime: any
    endTime: any
  }

  export interface Image {
    url: string
  }

  export interface CompanySearchResponse {
    status: number
    numResults: number
    results: Company[]
  }

  export interface Company {
    id: string
    name: string
    altNames: string[]
    domains: string[]
    monthlyVisits: number
    globalRank?: number
    description: string
    ceo: any
    industry: string
    sector: any
    country: string
    fullTimeEmployees?: number
    address: any
    city: any
    state: any
    zip: any
    logo?: string
    favicon?: string
    isEtf: boolean
    isActivelyTrading: any
    isFund: boolean
    isAdr: boolean
    symbols: any[]
  }
}

/**
 * **The intelligent news API**
 *
 * Real-time global news and web content data from 140,000+ sources.
 *
 * - search news articles
 * - search news stories (clusters of related news articles)
 * - search people, companies, topics, and journalists
 *
 * @see https://www.goperigon.com/products/news-api
 */
export class PerigonClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string

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
    assert(
      apiKey,
      'PerigonClient missing required "apiKey" (defaults to "PERIGON_API_KEY")'
    )
    super()

    this.apiKey = apiKey

    const throttledKy = throttle ? throttleKy(ky, perigon.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: 'https://api.goperigon.com/v1/',
      timeout: timeoutMs
    })
  }

  /**
   * @see https://docs.goperigon.com/docs/overview
   * @see https://docs.goperigon.com/reference/all-news
   */
  @aiFunction({
    name: 'search_news_articles',
    description:
      'Search for news articles indexed by Perigon. Articles can optionally be filtered by various parameters.',
    inputSchema: perigon.ArticlesSearchOptionsSchema.pick({
      q: true,
      title: true,
      from: true,
      to: true,
      source: true,
      sourceGroup: true,
      excludeSource: true,
      category: true,
      personName: true,
      companyName: true,
      companyDomain: true,
      sortBy: true
    })
  })
  async searchArticles(opts: perigon.ArticlesSearchOptions) {
    return this.ky
      .get('all', {
        searchParams: sanitizeSearchParams({
          sortBy: 'relevance',
          ...opts,
          apiKey: this.apiKey,
          size: Math.max(
            1,
            Math.min(
              perigon.MAX_PAGE_SIZE,
              opts.size || perigon.DEFAULT_PAGE_SIZE
            )
          )
        })
      })
      .json<perigon.ArticlesSearchResponse>()
  }

  /**
   * @see https://docs.goperigon.com/docs/stories-overview
   * @see https://docs.goperigon.com/reference/stories-1
   */
  @aiFunction({
    name: 'search_news_stories',
    description:
      'Search for news stories indexed by Perigon. Stories are clusters of related news articles and are useful for finding top stories and trending headlines. Stories can optionally be filtered by various parameters.',
    inputSchema: perigon.StoriesSearchOptionsSchema.pick({
      q: true,
      name: true,
      from: true,
      to: true,
      sourceGroup: true,
      category: true,
      personName: true,
      companyName: true,
      companyDomain: true,
      sortBy: true
    })
  })
  async searchStories(opts: perigon.StoriesSearchOptions) {
    return this.ky
      .get('stories/all', {
        searchParams: sanitizeSearchParams({
          sortBy: 'relevance',
          ...opts,
          apiKey: this.apiKey,
          size: Math.max(
            1,
            Math.min(
              perigon.MAX_PAGE_SIZE,
              opts.size || perigon.DEFAULT_PAGE_SIZE
            )
          )
        })
      })
      .json<perigon.StoriesSearchResponse>()
  }

  /**
   * @see https://docs.goperigon.com/docs/people-data
   * @see https://docs.goperigon.com/reference/people
   */
  @aiFunction({
    name: 'search_people',
    description: 'Search for well-known people indexed by Perigon.',
    inputSchema: perigon.PeopleSearchOptionsSchema
  })
  async searchPeople(opts: perigon.PeopleSearchOptions) {
    return this.ky
      .get('people/all', {
        searchParams: sanitizeSearchParams({
          ...opts,
          apiKey: this.apiKey,
          size: Math.max(
            1,
            Math.min(
              perigon.MAX_PAGE_SIZE,
              opts.size || perigon.DEFAULT_PAGE_SIZE
            )
          )
        })
      })
      .json<perigon.PeopleSearchResponse>()
  }

  /**
   * @see https://docs.goperigon.com/docs/company-data
   * @see https://docs.goperigon.com/reference/companies
   */
  @aiFunction({
    name: 'search_companies',
    description:
      'Search for companies indexed by Perigon. Includes public and private companies sourced from public records and Wikidata.',
    inputSchema: perigon.CompanySearchOptionsSchema
  })
  async searchCompanies(opts: perigon.CompanySearchOptions) {
    return this.ky
      .get('companies/all', {
        searchParams: sanitizeSearchParams({
          ...opts,
          apiKey: this.apiKey,
          size: Math.max(
            1,
            Math.min(
              perigon.MAX_PAGE_SIZE,
              opts.size || perigon.DEFAULT_PAGE_SIZE
            )
          )
        })
      })
      .json<perigon.CompanySearchResponse>()
  }
}
