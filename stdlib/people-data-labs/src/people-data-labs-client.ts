import { assert, getEnv, sanitizeSearchParams, throttleKy } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'

/**
 * TODO: I'm holding off on converting this client to an `AIFunctionsProvider`
 * because it seems to be significantly more expensive than other data sources,
 * and I'm not sure if it's worth the cost.
 */

export namespace peopledatalabs {
  export const BASE_URL = 'https://api.peopledatalabs.com/v5/'

  // Allow up to 10 requests per minute.
  export const throttle10PerMin = pThrottle({
    limit: 10,
    interval: 60 * 1000,
    strict: true
  })

  // Allow up to 100 requests per minute.
  export const throttle100PerMin = pThrottle({
    limit: 100,
    interval: 60 * 1000,
    strict: true
  })

  export const JobTitleLevels = [
    'cxo',
    'director',
    'entry',
    'manager',
    'owner',
    'partner',
    'senior',
    'training',
    'unpaid',
    'vp'
  ]

  export const JobTitleRoles = [
    'customer_service',
    'design',
    'education',
    'engineering',
    'finance',
    'health',
    'human_resources',
    'legal',
    'marketing',
    'media',
    'operations',
    'public_relations',
    'real_estate',
    'sales',
    'trades'
  ]

  // TODO configure this type to make pdl_id or name or profile or ticker or website required.
  // Only one is required
  export interface CompanyLookupOptions {
    pdl_id?: string
    name?: string
    profile?: string
    ticker?: string
    website?: string
    location?: string[]
    locality?: string
    region?: string
    country?: string
    street_address?: string
    postal_code?: string
    data_include?: string
    pretty?: boolean
  }

  export interface Naics {
    naics_code: string
    sector: string
    sub_sector: string
    industry_group: string
    naics_industry: string | null
    national_industry: string | null
  }

  export interface Sic {
    sic_code: string
    major_group: string
    industry_group: string
    industry_sector: string | null
  }

  export interface Location {
    name: string
    locality: string
    region: string
    metro: string
    country: string
    continent: string
    street_address: string
    address_line_2: string | null
    postal_code: string
    geo: string
  }

  export interface EmployeeCountByCountry {
    [country: string]: number
  }

  export interface CompanyLookupResponse {
    status: number
    name: string
    display_name: string
    size: string
    employee_count: number
    id: string
    founded: number
    industry: string
    naics: Naics[]
    sic: Sic[]
    location: Location
    linkedin_id: string
    linkedin_url: string
    facebook_url: string
    twitter_url: string
    profiles: string[]
    website: string
    ticker: string
    gics_sector: string | null
    mic_exchange: string | null
    type: string
    summary: string
    tags: string[]
    headline: string
    alternative_names: string[]
    alternative_domains: string[]
    affiliated_profiles: string[]
    employee_count_by_country: EmployeeCountByCountry
    likelihood: number
  }

  export interface CompanySearchOptions {
    limit?: number
    query: {
      website?: string
      tags?: string
      industry?: string
      'location.country'?: string
      'location.metro'?: string
      summary?: string
      size?: string[]
      affiliated_profiles?: string
    }
  }

  export type CompanySearchOptionsQueryKeys =
    keyof CompanySearchOptions['query']

  export interface CompanySearchResponse {
    status: number
    data: {
      name: string
      display_name: string
      size: string
      employee_count: number
      id: string
      founded: number
      industry: string
      naics: Naics[]
      sic: Sic[]
      location: Location
      linkedin_id: string
      linkedin_url: string
      facebook_url: string
      twitter_url: string
      profiles: string[]
      website: string
      ticker: string
      gics_sector: string | null
      mic_exchange: string | null
      type: string
      summary: string
      tags: string[]
      headline: string
      alternative_names: string[]
      alternative_domains: string[]
      affiliated_profiles: string[]
      employee_count_by_country: EmployeeCountByCountry
    }[]
    scroll_token: string
    total: number
  }

  export interface PersonSearchOptions {
    limit?: number
    query: {
      first_name?: string
      full_name?: string
      last_name?: string
      job_company_website?: string
      job_title_role?: string
      /**
       * The docs says this property should be an array of strings.
       * But when sending the array a 404 error is returned.
       * See: https://docs.peopledatalabs.com/docs/fields#job_title_levels
       */
      job_title_levels?: string
      job_company_name?: string
      job_company_location_country?: string
    }
  }

  export type PersonSearchOptionsQueryKeys = keyof PersonSearchOptions['query']

  // Person response
  export interface SearchPersonApiResponse {
    id: string
    full_name: string
    first_name: string
    middle_initial: null | string
    middle_name: null | string
    last_initial: string
    last_name: string
    gender: string
    birth_year: null | number
    birth_date: null | string
    linkedin_url: string
    linkedin_username: string
    linkedin_id: string
    facebook_url: null | string
    facebook_username: null | string
    facebook_id: null | string
    twitter_url: string
    twitter_username: string
    github_url: null | string
    github_username: null | string
    work_email: string
    personal_emails: string[]
    recommended_personal_email: null | string
    mobile_phone: null | string
    industry: null | string
    job_title: string
    job_title_role: null | string
    job_title_sub_role: null | string
    job_title_levels: string[]
    job_onet_code: string
    job_onet_major_group: string
    job_onet_minor_group: string
    job_onet_broad_occupation: string
    job_onet_specific_occupation: string
    job_onet_specific_occupation_detail: string
    job_company_id: string
    job_company_name: string
    job_company_website: string
    job_company_size: string
    job_company_founded: number
    job_company_industry: string
    job_company_linkedin_url: string
    job_company_linkedin_id: string
    job_company_facebook_url: string
    job_company_twitter_url: string
    job_company_type: string
    job_company_ticker: null | string
    job_company_location_name: string
    job_company_location_locality: string
    job_company_location_metro: string
    job_company_location_region: string
    job_company_location_geo: string
    job_company_location_street_address: string
    job_company_location_address_line_2: string
    job_company_location_postal_code: string
    job_company_location_country: string
    job_company_location_continent: string
    job_last_updated: string
    job_start_date: string
    job_summary: null | string
    location_name: null | string
    location_locality: null | string
    location_metro: null | string
    location_region: null | string
    location_country: null | string
    location_continent: null | string
    location_street_address: null | string
    location_address_line_2: null | string
    location_postal_code: null | string
    location_geo: null | string
    location_last_updated: null | string
    linkedin_connections: number
    facebook_friends: null | string
    inferred_salary: string
    inferred_years_experience: number
    summary: null | string
    phone_numbers: string[]
    phones: string[]
    emails: Email[]
    interests: string[]
    skills: string[]
    location_names: string[]
    regions: string[]
    countries: string[]
    street_addresses: string[]
    experience: Experience[]
    education: Education[]
    profiles: Profile[]
    name_aliases: string[]
    possible_emails: PossibleEmail[]
    possible_profiles: PossibleProfile[]
    possible_phones: PossiblePhone[]
    possible_street_addresses: string[]
    possible_location_names: string[]
    possible_birth_dates: string[]
    job_history: JobHistory[]
    certifications: string[]
    languages: string[]
    first_seen: string
    num_sources: number
    num_records: number
    version_status: VersionStatus
  }

  export interface Email {
    address: string
    type: null | string
    first_seen: string
    last_seen: string
    num_sources: number
  }

  export interface Experience {
    company: Company
    start_date: null | string
    end_date: null | string
    title: Title
    location_names: string[]
    is_primary: boolean
    summary: null | string
    num_sources: number
    first_seen: string
    last_seen: string
  }

  export interface Company {
    name: string
    size: string
    id: string
    founded: number
    industry: string
    location: Location
    linkedin_url: string
    linkedin_id: string
    facebook_url: null | string
    twitter_url: string
    website: string
    ticker: null | string
    type: string
    raw: string[]
    fuzzy_match: boolean
  }

  export interface Title {
    name: string
    raw: string[]
    role: null | string
    sub_role: null | string
    levels: string[]
  }

  export interface Education {
    school: School
    degrees: string[]
    start_date: string
    end_date: string
    majors: string[]
    minors: string[]
    gpa: null | string
    raw: string[]
    summary: null | string
  }

  export interface School {
    name: string
    type: string
    id: string
    location: Location
    linkedin_url: string
    facebook_url: string
    twitter_url: string
    linkedin_id: string
    website: string
    domain: string
    raw: string[]
  }

  export interface Profile {
    network: string
    id: null | string
    url: string
    username: string
    num_sources: number
    first_seen: string
    last_seen: string
  }

  export interface PossibleEmail {
    address: string
    type: null | string
    first_seen: string
    last_seen: string
    num_sources: number
  }

  export interface PossibleProfile {
    network: string
    id: null | string
    url: string
    username: null | string
    num_sources: number
    first_seen: string
    last_seen: string
  }

  export interface PossiblePhone {
    number: string
    first_seen: string
    last_seen: string
    num_sources: number
  }

  export interface VersionStatus {
    status: string
    contains: string[]
    previous_version: string
    current_version: string
  }

  export interface JobHistory {
    company_id: string
    company_name: string
    title: string
    first_seen: string
    last_seen: string
    num_sources: number
  }
}

/**
 * People & Company Data
 *
 * @see https://www.peopledatalabs.com
 */
export class PeopleDataLabsClient {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('PEOPLE_DATA_LABS_API_KEY'),
    apiBaseUrl = peopledatalabs.BASE_URL,
    timeoutMs = 30_000,
    throttle = true,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    timeoutMs?: number
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'PeopleDataLabsClient missing required "apiKey" (defaults to "PEOPLE_DATA_LABS_API_KEY")'
    )

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle
      ? throttleKy(ky, peopledatalabs.throttle10PerMin)
      : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        'x-api-key': `${this.apiKey}`
      }
    })
  }

  async companyLookup(options: peopledatalabs.CompanySearchOptions) {
    const terms = options.query
    const termsQuery = []

    for (const term of Object.keys(
      terms
    ) as peopledatalabs.CompanySearchOptionsQueryKeys[]) {
      termsQuery.push({ term: { [term]: terms[term] } })
    }

    return this.ky
      .get('company/search', {
        searchParams: {
          size: options.limit || 1,
          query: JSON.stringify({
            bool: {
              must: termsQuery
            }
          })
        }
      })
      .json<peopledatalabs.CompanySearchResponse>()
  }

  async companyProfile(options: peopledatalabs.CompanyLookupOptions) {
    return this.ky
      .get('company/enrich', {
        searchParams: sanitizeSearchParams({ ...options })
      })
      .json<peopledatalabs.CompanyLookupResponse>()
  }

  async personSearch(options: peopledatalabs.PersonSearchOptions) {
    const terms = options.query
    const termsQuery = []

    for (const term of Object.keys(
      terms
    ) as peopledatalabs.PersonSearchOptionsQueryKeys[]) {
      termsQuery.push({ term: { [term]: terms[term] } })
    }

    return this.ky
      .get('person/search', {
        searchParams: {
          size: options.limit || 10,
          query: JSON.stringify({
            bool: {
              must: termsQuery
            }
          })
        }
      })
      .json<peopledatalabs.SearchPersonApiResponse>()
  }
}
