import defaultKy from 'ky'
import pThrottle from 'p-throttle'

import type { DeepNullable, KyInstance } from '../types.js'
import { assert, delay, getEnv, throttleKy } from '../utils.js'

export namespace clearbit {
  // Allow up to 600 requests per minute by default.
  export const throttle = pThrottle({
    limit: 600,
    interval: 60 * 1000
  })

  export interface CompanyEnrichmentOptions {
    domain: string
    webhook_url?: string
    company_name?: string
    linkedin?: string
    twitter?: string
    facebook?: string
  }

  export type CompanyNullableProps = {
    name: string
    legalName: string
    domain: string
    domainAliases: string[]
    site: {
      phoneNumbers: string[]
      emailAddresses: string[]
    }
    category: {
      sector: string
      industryGroup: string
      industry: string
      subIndustry: string
      gicsCode: string
      sicCode: string
      sic4Codes: string[]
      naicsCode: string
      naics6Codes: string[]
      naics6Codes2022: string[]
    }
    tags: string[]
    description: string
    foundedYear: number
    location: string
    timeZone: string
    utcOffset: number
    geo: {
      streetNumber: string
      streetName: string
      subPremise: string
      streetAddress: string
      city: string
      postalCode: string
      state: string
      stateCode: string
      country: string
      countryCode: string
      lat: number
      lng: number
    }
    logo: string
    facebook: {
      handle: string
      likes: number
    }
    linkedin: {
      handle: string
    }
    twitter: {
      handle: string
      id: string
      bio: string
      followers: number
      following: number
      location: string
      site: string
      avatar: string
    }
    crunchbase: {
      handle: string
    }
    emailProvider: boolean
    type: string
    ticker: string
    identifiers: {
      usEIN: string
      usCIK: string
    }
    phone: string
    metrics: {
      alexaUsRank: number
      alexaGlobalRank: number
      trafficRank: string
      employees: number
      employeesRange: string
      marketCap: string
      raised: number
      annualRevenue: string
      estimatedAnnualRevenue: string
      fiscalYearEnd: string
    }
    indexedAt: string
    tech: string[]
    techCategories: string[]
    parent: {
      domain: string
    }
    ultimateParent: {
      domain: string
    }
  }

  export type EmailLookupResponse = DeepNullable<{
    id: string
    name: {
      fullName: string
      givenName: string
      familyName: string
    }
    email: string
    location: string
    timeZone: string
    utcOffset: number
    geo: {
      city: string
      state: string
      stateCode: string
      country: string
      countryCode: string
      lat: number
      lng: number
    }
    bio: string
    site: string
    avatar: string
    employment: {
      domain: string
      name: string
      title: string
      role: string
      subRole: string
      seniority: string
    }
    facebook: {
      handle: string
    }
    github: {
      handle: string
      id: string
      avatar: string
      company: string
      blog: string
      followers: number
      following: number
    }
    twitter: {
      handle: string
      id: string
      bio: string
      followers: number
      following: number
      statuses: number
      favorites: number
      location: string
      site: string
      avatar: string
    }
    linkedin: {
      handle: string
    }
    googleplus: {
      handle: null
    }
    gravatar: {
      handle: string
      urls: {
        value: string
        title: string
      }[]
      avatar: string
      avatars: {
        url: string
        type: string
      }[]
    }
    fuzzy: boolean
    emailProvider: boolean
    indexedAt: string
    phone: string
    activeAt: string
    inactiveAt: string
  }>

  export type CompanyResponse = {
    id: string
  } & DeepNullable<CompanyNullableProps>

  export interface CompanySearchOptions {
    /**
     * See clearbit docs: https://dashboard.clearbit.com/docs?shell#discovery-api-tech-queries
     * Examples:
     * tech:google_apps
     * or:(twitter_followers:10000~ type:nonprofit)
     */
    query: string
    page?: number
    page_size?: number
    limit?: number
    sort?: string
  }

  export interface CompanySearchResponse {
    total: number
    page: number
    results: CompanyResponse[]
  }

  export interface BasicCompanyResponse {
    domain: string
    logo: string
    name: string
  }

  export interface PeopleSearchOptionsV2 {
    domains?: string[]
    names?: string[]
    roles?: string[]
    seniorities?: string[]
    titles?: string[]
    locations?: string[]
    employees_ranges?: string[]
    company_tags?: string[]
    company_tech?: string[]
    company_types?: string[]
    industries?: string[]
    revenue_ranges?: string[]
    linkedin_profile_handles?: string[]
    page?: number
    page_size?: number
    suppression?: string
  }

  // Prospector types
  export interface ProspectorResponseV2 {
    page: number
    page_size: number
    total: number
    results: PersonAttributesV2[]
  }

  export interface EmploymentAttributes {
    company: string
    domain: string
    linkedin: string
    title: string
    role: string
    subRole: string
    seniority: string
    startDate: string
    endDate: string
    present: boolean
    highlight: boolean
  }

  export interface EmailAttributes {
    address: string
    type: string
  }

  export interface PhoneAttributes {
    number: string
    type: string
  }

  interface Name {
    givenName: string
    familyName: string
    fullName: string
  }

  export type PersonAttributesV2 = {
    id: string
  } & DeepNullable<{
    name: Name
    avatar: string
    location: string
    linkedin: string
    employments: EmploymentAttributes[]
    emails: EmailAttributes[]
    phones: PhoneAttributes[]
  }>

  export type PeopleSearchOptionsV1 = {
    domain: string
    role?: string
    roles?: string[]
    seniority?: string
    seniorities?: string[]
    title?: string
    titles?: string[]
    city?: string
    cities?: string[]
    state?: string
    states?: string[]
    country?: string
    countries?: string[]
    name?: string
    query?: string
    page?: number
    page_size?: number
    suppression?: string
    email?: boolean
  }

  export interface Company {
    name: string
  }

  export interface PeopleSearchResponseV1 {
    id: string
    name: Name
    title: string
    role: string
    subRole: string
    seniority: string
    company: Company
    email: string
    verified: boolean
    phone: string
  }

  export interface ProspectorResponseV1 {
    page: number
    page_size: number
    total: number
    results: PeopleSearchResponseV1[]
  }

  export interface GeoIP {
    city: string
    state: string
    stateCode: string
    country: string
    countryCode: string
  }

  export interface CompanyRevealResponse {
    ip: string
    fuzzy: boolean
    domain: string
    type: string
    company?: CompanyResponse
    geoIP: GeoIP
    confidenceScore: 'very_high' | 'high' | 'medium' | 'low'
    role: string
    seniority: string
  }
}

/**
 * The Clearbit API helps with resolving and enriching people and company data.
 *
 * @see https://dashboard.clearbit.com/docs
 */
export class ClearbitClient {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly _maxPageSize = 100

  static readonly PersonRoles = [
    'communications',
    'customer_service',
    'education',
    'engineering',
    'finance',
    'health_professional',
    'human_resources',
    'information_technology',
    'leadership',
    'legal',
    'marketing',
    'operations',
    'product',
    'public_relations',
    'real_estate',
    'recruiting',
    'research',
    'sales'
  ]

  static readonly SenioritiesV2 = [
    'Executive',
    'VP',
    'Owner',
    'Partner',
    'Director',
    'Manager',
    'Senior',
    'Entry'
  ]

  static readonly Seniorities = ['executive', 'director', 'manager']

  static readonly SubIndustries = [
    'Automotive',
    'Consumer Discretionary',
    'Consumer Goods',
    'Consumer Electronics',
    'Household Appliances',
    'Photography',
    'Sporting Goods',
    'Apparel, Accessories & Luxury Goods',
    'Textiles',
    'Textiles, Apparel & Luxury Goods',
    'Consumer Services',
    'Education Services',
    'Specialized Consumer Services',
    'Casinos & Gaming',
    'Hotels, Restaurants & Leisure',
    'Leisure Facilities',
    'Restaurants',
    'Education',
    'Family Services',
    'Legal Services',
    'Advertising',
    'Broadcasting',
    'Media',
    'Movies & Entertainment',
    'Public Relations',
    'Publishing',
    'Distributors',
    'Retailing',
    'Home Improvement Retail',
    'Homefurnishing Retail',
    'Specialty Retail',
    'Consumer Staples',
    'Food Retail',
    'Beverages',
    'Agricultural Products',
    'Food',
    'Food Production',
    'Packaged Foods & Meats',
    'Tobacco',
    'Cosmetics',
    'Oil & Gas',
    'Banking & Mortgages',
    'Accounting',
    'Finance',
    'Financial Services',
    'Asset Management & Custody Banks',
    'Diversified Capital Markets',
    'Fundraising',
    'Investment Banking & Brokerage',
    'Payments',
    'Insurance',
    'Real Estate',
    'Eyewear',
    'Health & Wellness',
    'Health Care',
    'Health Care Services',
    'Biotechnology',
    'Life Sciences Tools & Services',
    'Pharmaceuticals',
    'Aerospace & Defense',
    'Capital Goods',
    'Civil Engineering',
    'Construction',
    'Construction & Engineering',
    'Mechanical Engineering',
    'Electrical',
    'Electrical Equipment',
    'Industrials & Manufacturing',
    'Industrial Machinery',
    'Machinery',
    'Trading Companies & Distributors',
    'Business Supplies',
    'Commercial Printing',
    'Corporate & Business',
    'Architecture',
    'Automation',
    'Consulting',
    'Design',
    'Human Resource & Employment Services',
    'Professional Services',
    'Research & Consulting Services',
    'Industrials',
    'Shipping & Logistics',
    'Airlines',
    'Marine',
    'Ground Transportation',
    'Transportation',
    'Semiconductors',
    'Cloud Services',
    'Internet',
    'Internet Software & Services',
    'Data Processing & Outsourced Services',
    'Graphic Design',
    'Communications',
    'Computer Networking',
    'Nanotechnology',
    'Computer Hardware',
    'Technology Hardware, Storage & Peripherals',
    'Building Materials',
    'Chemicals',
    'Commodity Chemicals',
    'Containers & Packaging',
    'Gold',
    'Metals & Mining',
    'Paper Products',
    'Integrated Telecommunication Services',
    'Wireless Telecommunication Services',
    'Renewable Energy',
    'Energy',
    'Utilities'
  ]

  constructor({
    apiKey = getEnv('CLEARBIT_API_KEY'),
    timeoutMs = 30_000,
    throttle = true,
    ky = defaultKy
  }: {
    apiKey?: string
    timeoutMs?: number
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'ClearbitClient missing required "apiKey" (defaults to "CLEARBIT_API_KEY")'
    )

    this.apiKey = apiKey

    const throttledKy = throttle ? throttleKy(ky, clearbit.throttle) : ky

    this.ky = throttledKy.extend({
      timeout: timeoutMs,
      headers: {
        // Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  async companyEnrichment(options: clearbit.CompanyEnrichmentOptions) {
    return this.ky
      .get('https://company-stream.clearbit.com/v2/companies/find', {
        searchParams: { ...options }
      })
      .json<clearbit.CompanyResponse>()
  }

  async companySearch(options: clearbit.CompanySearchOptions) {
    return this.ky
      .get('https://discovery.clearbit.com/v1/companies/search', {
        searchParams: { ...options }
      })
      .json<clearbit.CompanySearchResponse>()
  }

  async companyAutocomplete(name: string) {
    return this.ky
      .get('https://autocomplete.clearbit.com/v1/companies/suggest', {
        searchParams: { query: name }
      })
      .json<clearbit.BasicCompanyResponse[]>()
  }

  async prospectorPeopleV2(options: clearbit.PeopleSearchOptionsV2) {
    return this.ky
      .get('https://prospector.clearbit.com/v2/people/search', {
        // @ts-expect-error location is a string[] and searchparams shows a TS error heres
        searchParams: {
          ...options,
          page_size: Math.min(
            this._maxPageSize,
            options.page_size || this._maxPageSize
          )
        }
      })
      .json<clearbit.ProspectorResponseV2>()
  }

  async prospectorPeopleV1(options: clearbit.PeopleSearchOptionsV1) {
    return this.ky
      .get('https://prospector.clearbit.com/v1/people/search', {
        // @ts-expect-error location is a string[] and searchparams shows a TS error heres
        searchParams: {
          email: false,
          ...options,
          page_size: Math.min(
            this._maxPageSize,
            options.page_size || this._maxPageSize
          )
        }
      })
      .json<clearbit.ProspectorResponseV1>()
  }

  // TODO Status code = 202 means the response was queued.
  // Implement webhook when needed. The polling works well, in most cases we need
  // to try again once to get a 200 response.
  async emailLookup({
    email,
    maxRetries = 2
  }: {
    email: string
    maxRetries?: number
  }): Promise<clearbit.EmailLookupResponse> {
    const url = 'https://person.clearbit.com/v2/people/find'
    let response = await this.ky.get(url, {
      searchParams: { email }
    })

    if (response.status !== 202 || !maxRetries) {
      return response.json<clearbit.EmailLookupResponse>()
    }

    if (maxRetries && response.status === 202) {
      let count = 0
      let running = true
      while (running && count < maxRetries) {
        console.log(`Email Lookup was queued, retry ${count + 1}.`)
        await delay(1000)
        response = await this.ky.get(url, {
          searchParams: { email }
        })
        count++
        running = response.status === 202
      }
      return response.json<clearbit.EmailLookupResponse>()
    }

    throw new Error('clearbit email lookup error 202', { cause: response })
  }

  async nameToDomain(name: string) {
    return this.ky
      .get('https://company.clearbit.com/v1/domains/find', {
        searchParams: { name }
      })
      .json<clearbit.BasicCompanyResponse>()
      .catch((_) => undefined)
  }

  async revealCompanyFromIP(ip: string) {
    return this.ky
      .get('https://reveal.clearbit.com/v1/companies/find', {
        searchParams: { ip }
      })
      .json<clearbit.CompanyRevealResponse>()
      .catch((_) => undefined)
  }

  static filterEmploymentProspectorV2(
    companyName: string,
    employments: Array<DeepNullable<clearbit.EmploymentAttributes> | null> | null
  ) {
    if (employments && employments.length > 0) {
      // We filter by employment endDate because some people could have multiple
      // jobs at the same time.
      // Here we want to filter by people that actively works at a specific company.
      return employments
        .filter((item) => !item?.endDate)
        .some((item) =>
          item?.company?.toLowerCase().includes(companyName.toLowerCase())
        )
    }

    return false
  }
}
