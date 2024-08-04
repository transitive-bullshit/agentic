import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  type DeepNullable,
  getEnv,
  pruneUndefined,
  sanitizeSearchParams,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

// TODO: improve `domain` validation for fast-fail

export namespace predictleads {
  // Allow up to 20 requests per minute by default.
  export const throttle = pThrottle({
    limit: 20,
    interval: 60 * 1000
  })

  export const DEFAULT_PAGE_SIZE = 100
  export const MAX_PAGE_SIZE = 1000

  export type Meta = DeepNullable<{
    count: number
    message?: string | null
    message_type?: string
  }>

  export type GenericSuccessResponse = {
    success: {
      type: string
      message: string
    }
  }

  export type FollowedCompaniesResponse = {
    data: DeepNullable<
      Array<{
        domain: string
        custom_company_identifier: string | null
      }>
    >
    meta: Meta
  }

  export type Relationship = Record<
    string,
    {
      data: {
        id: string
        type: string
      }
    }
  >

  export type AdditionalData = {
    relationships: {
      companies: [string, string]
    }
    date: string
    location: string
    location_data: {
      region?: string
      continent?: string
      country?: string
      state?: string
      zip_code?: string
      city?: string
      fuzzy_match?: boolean
    }
    contact?: string
    job_title?: string
    product?: string
    product_tags?: string[]
    amount?: number
    recognition?: string
    assets?: string
    asset_tags?: string[]
    headcount?: number
    award?: string
    financing_type?: string
    financing_type_tags?: string[]
    funding_round?: string
    division?: string
    conference?: string
    vulnerability?: string
    planning?: boolean
    article_title?: string
    article_sentence?: string
    article_body?: string
    article_source?: string
    article_published_at?: string
    article_image_url?: string
  }

  export type Event = {
    id: string
    type: string
    attributes: {
      categories: string[]
      title: string
      url: string
      found_at: string
      additional_data: AdditionalData
      domain: string
      location: string
      location_data: {
        state: string
        country: string
      }
      company_name: string
      friendly_company_name: string
      ticker: null
      meta_title: string
      meta_description: string
      published_at: string
      post_type: string
      post_url: string
      company_domain: string
      fuzzy_match: boolean
    }
    relationships: Relationship
  }

  export type Response = DeepNullable<{
    data: Event[]
    included: Relationship
    meta: Meta
  }>

  export type JobOpeningData = {
    id: string
    type: string
    attributes: {
      title: string
      url: string
      description: string
      salary: string
      salary_data: {
        salary_low: number
        salary_high: number
        salary_currency: string
        salary_low_usd: number
        salary_high_usd: number
        salary_time_unit: string
      }
      job_opening_closed: boolean
      location: string
      contract_types: string[]
      first_seen_at: string
      last_seen_at: string
      last_processed_at: string
      categories: string[]
      onet_code: string
      additional_data: {
        job_title_seniority: string
        tags: string[]
        location_data: {
          country: string
          city: string
          fuzzy_match: boolean
        }
      }
    }
    relationships: {
      company: {
        data: {
          id: string
          type: string
        }
      }
    }
  }

  export type CompanyData = {
    id: string
    type: string
    attributes: {
      domain: string
      company_name: string
      ticker: string | null
    }
  }

  export type JobOpeningResponse = DeepNullable<{
    data: JobOpeningData[]
    included: CompanyData[]
    meta: {
      count: number
    }
  }>

  export type JobOpeningByIdResponse = Omit<JobOpeningResponse, 'meta'>

  export const EventCategorySchema = z
    .union([
      z
        .literal('hires')
        .describe(
          'Company hired new executive or senior personnel. (leadership)'
        ),
      z
        .literal('promotes')
        .describe(
          'Company promoted existing executive or senior personnel. (leadership)'
        ),
      z
        .literal('leaves')
        .describe(
          'Executive or senior personnel left the company. (leadership)'
        ),
      z
        .literal('retires')
        .describe(
          'Executive or senior personnel retires from the company. (leadership)'
        ),
      z
        .literal('acquires')
        .describe('Company acquired other company. (acquisition)'),
      z
        .literal('merges_with')
        .describe('Company merges with other company. (acquisition)'),
      z
        .literal('sells_assets_to')
        .describe(
          'Company sells assets (like properties or warehouses) to other company. (acquisition)'
        ),
      z
        .literal('expands_offices_to')
        .describe(
          'Company opens new offices in another town, state, country or continent. (expansion)'
        ),
      z
        .literal('expands_offices_in')
        .describe('Company expands existing offices. (expansion)'),
      z
        .literal('expands_facilities')
        .describe(
          'Company opens new or expands existing facilities like warehouses, data centers, manufacturing plants etc. (expansion)'
        ),
      z
        .literal('opens_new_location')
        .describe(
          'Company opens new service location like hotels, restaurants, bars, hospitals etc. (expansion)'
        ),
      z
        .literal('increases_headcount_by')
        .describe('Company offers new job vacancies. (expansion)'),
      z
        .literal('launches')
        .describe('Company launches new offering. (new_offering)'),
      z
        .literal('integrates_with')
        .describe('Company integrates with other company. (new_offering)'),
      z
        .literal('is_developing')
        .describe(
          'Company begins development of a new offering. (new_offering)'
        ),
      z
        .literal('receives_financing')
        .describe(
          'Company receives investment like venture funding, loan, grant etc. (investment)'
        ),
      z
        .literal('invests_into')
        .describe('Company invests into other company. (investment)'),
      z
        .literal('invests_into_assets')
        .describe(
          'Company invests into assets like property, trucks, facilities etc. (investment)'
        ),
      z
        .literal('goes_public')
        .describe(
          'Company issues shares to the public for the first time. (investment)'
        ),
      z
        .literal('closes_offices_in')
        .describe('Company closes existing offices. (cost_cutting)'),
      z
        .literal('decreases_headcount_by')
        .describe('Company lays off employees. (cost_cutting)'),
      z
        .literal('partners_with')
        .describe('Company partners with other company. (partnership)'),
      z
        .literal('receives_award')
        .describe(
          'Company or person at the company receives an award. (recognition)'
        ),
      z
        .literal('recognized_as')
        .describe(
          'Company or person at the company receives recognition. (recognition)'
        ),
      z
        .literal('signs_new_client')
        .describe('Company signs new client. (contract)'),
      z
        .literal('files_suit_against')
        .describe(
          'Company files suit against other company. (corporate_challenges)'
        ),
      z
        .literal('has_issues_with')
        .describe('Company has vulnerability problems. (corporate_challenges)'),
      z
        .literal('identified_as_competitor_of')
        .describe('New or existing competitor was identified. (relational)')
    ])
    .describe('Event category')
  export type EventCategory = z.infer<typeof EventCategorySchema>

  export const CompanyParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company')
  })
  export type CompanyParams = z.infer<typeof CompanyParamsSchema>

  export const CompanyEventsParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company'),
    categories: z.array(EventCategorySchema).optional(),
    found_at_from: z
      .string()
      .optional()
      .describe('Signals found from specified date (ISO 8601).'),
    found_at_until: z
      .string()
      .optional()
      .describe('Signals found until specified date (ISO 8601).'),
    page: z.number().int().positive().default(1).optional(),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE)
      .optional(),
    with_news_article_bodies: z
      .boolean()
      .optional()
      .describe('Whether or not to include the body contents of news articles.')
  })
  export type CompanyEventsParams = z.infer<typeof CompanyEventsParamsSchema>

  export const CompanyFinancingEventsParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company')
  })
  export type CompanyFinancingEventsParams = z.infer<
    typeof CompanyFinancingEventsParamsSchema
  >

  export const CompanyJobOpeningsParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company'),
    categories: z.array(EventCategorySchema).optional(),
    found_at_from: z
      .string()
      .optional()
      .describe('Signals found from specified date (ISO 8601).'),
    found_at_until: z
      .string()
      .optional()
      .describe('Signals found until specified date (ISO 8601).'),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE)
      .optional(),
    with_job_descriptions: z
      .boolean()
      .optional()
      .describe('Whether or not to include the full descriptions of the jobs.'),
    with_description_only: z
      .boolean()
      .optional()
      .describe('If set, only returns job openings with descriptions.'),
    with_location_only: z
      .boolean()
      .optional()
      .describe('If set, only returns job openings with locations.'),
    active_only: z
      .boolean()
      .optional()
      .describe(
        'If set, only returns job openings that are not closed, have `last_seen_at` more recent than 5 days and were found in the last year.'
      ),
    not_closed: z
      .boolean()
      .optional()
      .describe(
        'Similar to `active_only`, but without considering `last_seen_at` timestamp.'
      )
  })
  export type CompanyJobOpeningsParams = z.infer<
    typeof CompanyJobOpeningsParamsSchema
  >

  export const CompanyTechnologiesParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company'),
    categories: z.array(EventCategorySchema).optional(),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE)
      .optional()
  })
  export type CompanyTechnologiesParams = z.infer<
    typeof CompanyTechnologiesParamsSchema
  >

  export const CompanyConnectionsParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company'),
    categories: z.array(EventCategorySchema).optional(),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE)
      .optional()
  })
  export type CompanyConnectionsParams = z.infer<
    typeof CompanyConnectionsParamsSchema
  >

  export const CompanyWebsiteEvolutionParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company'),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE)
      .optional()
  })
  export type CompanyWebsiteEvolutionParams = z.infer<
    typeof CompanyWebsiteEvolutionParamsSchema
  >

  export const CompanyGitHubReposParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company'),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE)
      .optional()
  })
  export type CompanyGitHubReposParams = z.infer<
    typeof CompanyGitHubReposParamsSchema
  >

  export const CompanyProductsParamsSchema = z.object({
    domain: z.string().min(3).describe('domain of the company'),
    sources: z.array(z.string()).optional(),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE)
      .optional()
  })
  export type CompanyProductsParams = z.infer<
    typeof CompanyProductsParamsSchema
  >
}

/**
 * In-depth company data, including signals like fundraising announcemnts,
 * hiring intent, new customers signed, technologies used, product launches,
 * location expansions, awards received, etc.
 *
 * @see https://predictleads.com
 */
export class PredictLeadsClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiToken: string

  constructor({
    apiKey = getEnv('PREDICT_LEADS_API_KEY'),
    apiToken = getEnv('PREDICT_LEADS_API_TOKEN'),
    timeoutMs = 30_000,
    throttle = true,
    ky = defaultKy
  }: {
    apiKey?: string
    apiToken?: string
    apiBaseUrl?: string
    timeoutMs?: number
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'PredictLeadsClient missing required "apiKey" (defaults to "PREDICT_LEADS_API_KEY")'
    )
    assert(
      apiToken,
      'PredictLeadsClient missing required "apiToken" (defaults to "PREDICT_LEADS_API_TOKEN")'
    )
    super()

    this.apiKey = apiKey
    this.apiToken = apiToken

    const throttledKy = throttle ? throttleKy(ky, predictleads.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: 'https://predictleads.com/api',
      timeout: timeoutMs,
      headers: {
        'x-api-key': apiKey,
        'x-api-token': apiToken
      }
    })
  }

  @aiFunction({
    name: 'get_company',
    description:
      'Returns basic information about a company given its `domain` like location, name, stock ticker, description, etc.',
    inputSchema: predictleads.CompanyParamsSchema
  })
  async getCompany(domainOrOpts: string | predictleads.CompanyParams) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky.get(`v2/companies/${domain}`).json<predictleads.Response>()
  }

  @aiFunction({
    name: 'get_company_events',
    description:
      'Returns a list of events from news for a given company. Events are found in press releases, industry news, blogs, social media, and other online sources.',
    inputSchema: predictleads.CompanyEventsParamsSchema
  })
  async getCompanyEvents(
    domainOrOpts: string | predictleads.CompanyEventsParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const {
      domain,
      page = 1,
      limit = predictleads.DEFAULT_PAGE_SIZE,
      ...params
    } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/events`, {
        searchParams: sanitizeSearchParams({
          page,
          limit,
          ...params
        })
      })
      .json<predictleads.Response>()
  }

  async getEventById(id: string) {
    return this.ky.get(`v2/events/${id}`).json<predictleads.Response>()
  }

  @aiFunction({
    name: 'get_company_financing_events',
    description:
      'Returns a list of financing events for a given company. Financing events include fundraising announcements and quarterly earning reports for public companies. They are sourced from press releases, industry news, blogs, social media, and other online sources.',
    inputSchema: predictleads.CompanyFinancingEventsParamsSchema
  })
  async getCompanyFinancingEvents(
    domainOrOpts: string | predictleads.CompanyFinancingEventsParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/financing_events`)
      .json<predictleads.Response>()
  }

  @aiFunction({
    name: 'get_company_job_openings',
    description:
      'Returns a list of job openings for a given company. Job openings are found on companies’ career sites and job boards.',
    inputSchema: predictleads.CompanyJobOpeningsParamsSchema
  })
  async getCompanyJobOpenings(
    domainOrOpts: string | predictleads.CompanyJobOpeningsParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain, limit = predictleads.DEFAULT_PAGE_SIZE, ...params } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/job_openings`, {
        searchParams: sanitizeSearchParams({
          limit,
          ...params
        })
      })
      .json<predictleads.JobOpeningResponse>()
  }

  async getJobOpeningById(id: string) {
    return this.ky
      .get(`v2/job_openings/${id}`)
      .json<predictleads.JobOpeningByIdResponse>()
  }

  @aiFunction({
    name: 'get_company_technologies',
    description: 'Returns a list of technology providers for a given company.',
    inputSchema: predictleads.CompanyTechnologiesParamsSchema
  })
  async getCompanyTechnologies(
    domainOrOpts: string | predictleads.CompanyTechnologiesParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain, limit = predictleads.DEFAULT_PAGE_SIZE, ...params } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/technologies`, {
        searchParams: sanitizeSearchParams({
          limit,
          ...params
        })
      })
      .json<predictleads.Response>()
  }

  @aiFunction({
    name: 'get_company_connections',
    description:
      'Returns a list of categorized business connections. Business connections can be found via backlinks or logos on /our-customers, /case-studies, /portfolio, /clients etc. pages. Business connections enable you to eg. calculate network health of a company, to build systems when new high value connections are made… Connections can be of many types: partner, vendor, investor, parent…',
    inputSchema: predictleads.CompanyConnectionsParamsSchema
  })
  async getCompanyConnections(
    domainOrOpts: string | predictleads.CompanyConnectionsParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain, limit = predictleads.DEFAULT_PAGE_SIZE, ...params } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/connections`, {
        searchParams: sanitizeSearchParams({
          limit,
          ...params
        })
      })
      .json<predictleads.Response>()
  }

  @aiFunction({
    name: 'get_company_website_evolution',
    description:
      'Returns insights into how a website has changed over time. E.g., when pages like “Blog”, “Privacy policy”, “Pricing”, “Product”, “API Docs”, “Team”, “Support pages” etc were added. This can serve as a proxy to how quickly a website is growing, to determine the growth stage they are at and also to help segment websites.',
    inputSchema: predictleads.CompanyWebsiteEvolutionParamsSchema
  })
  async getCompanyWebsiteEvolution(
    domainOrOpts: string | predictleads.CompanyWebsiteEvolutionParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain, limit = predictleads.DEFAULT_PAGE_SIZE, ...params } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/website_evolution`, {
        searchParams: sanitizeSearchParams({ limit, ...params })
      })
      .json<predictleads.Response>()
  }

  @aiFunction({
    name: 'get_company_github_repos',
    description:
      'Returns insights into how frequently a company is contributing to its public GitHub repositories.',
    inputSchema: predictleads.CompanyGitHubReposParamsSchema
  })
  async getCompanyGitHubRepositories(
    domainOrOpts: string | predictleads.CompanyGitHubReposParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain, limit = predictleads.DEFAULT_PAGE_SIZE, ...params } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/github_repositories`, {
        searchParams: sanitizeSearchParams({ limit, ...params })
      })
      .json<predictleads.Response>()
  }

  @aiFunction({
    name: 'get_company_products',
    description:
      'Returns what kind of products / solutions / features a company is offering.',
    inputSchema: predictleads.CompanyProductsParamsSchema
  })
  async getCompanyProducts(
    domainOrOpts: string | predictleads.CompanyProductsParams
  ) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    const { domain, limit = predictleads.DEFAULT_PAGE_SIZE, ...params } = opts
    assert(domain, 'Missing required company "domain"')

    return this.ky
      .get(`v2/companies/${domain}/products`, {
        searchParams: sanitizeSearchParams({
          limit,
          ...params
        })
      })
      .json<predictleads.Response>()
  }

  async discoverStartupJobsHN(params?: {
    post_datetime_from?: string
    post_datetime_until?: string
    min_score?: string
    limit?: string
  }) {
    return this.ky
      .get(`v2/discover/startup_platform/jobs_hn`, {
        searchParams: params
      })
      .json<predictleads.Response>()
  }

  async discoverStartupShowHN(params?: {
    post_datetime_from?: string
    post_datetime_until?: string
    min_score?: string
    limit?: string
  }) {
    return this.ky
      .get(`v2/discover/startup_platform/show_hn`, {
        searchParams: params
      })
      .json<predictleads.Response>()
  }

  // --------------------------------------------------------------------------
  // Stateful endpoints which should generally not be used as AI functions.
  // --------------------------------------------------------------------------

  async followCompany(domain: string, customCompanyIdentifier?: string) {
    return this.ky
      .post(`v2/companies/${domain}/follow`, {
        json: pruneUndefined({ customCompanyIdentifier })
      })
      .json<predictleads.GenericSuccessResponse>()
  }

  async getFollowingCompanies(limit: number = predictleads.DEFAULT_PAGE_SIZE) {
    return this.ky
      .get(`v2/followings`, {
        searchParams: sanitizeSearchParams({ limit })
      })
      .json<predictleads.FollowedCompaniesResponse>()
  }

  async unfollowCompany(domain: string, customCompanyIdentifier?: string) {
    return this.ky
      .post(`v2/companies/${domain}/unfollow`, {
        json: pruneUndefined({ customCompanyIdentifier })
      })
      .json<predictleads.GenericSuccessResponse>()
  }
}
