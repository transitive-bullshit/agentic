import {
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'

export namespace rocketreach {
  export const API_BASE_URL = 'https://api.rocketreach.co'

  // Allow up to 5 requests per second by default.
  export const throttle = pThrottle({
    limit: 5,
    interval: 1000
  })

  export interface EnrichPersonOptions {
    // RocketReach internal person ID returned by searches.
    id?: number

    // Must specify along with current_employer.
    name?: string

    // Must specify along with name.
    current_employer?: string

    // Desired prospect's job title. May improve match rate.
    title?: string

    // LinkedIn URL of prospect to lookup.
    linkedin_url?: string

    // A known email address of the prospect. May improve match rate.
    email?: string

    // An NPI number for a US healthcare professional. Can be used as a unique match criteria.
    npi_number?: number

    // Specify an alternative lookup type to use (if available).
    lookup_type?:
      | 'standard'
      | 'premium'
      | 'premium (feeds disabled)'
      | 'bulk'
      | 'phone'
      | 'enrich'
  }

  export interface Person {
    id: number
    status: string
    name: string
    profile_pic: string
    linkedin_url: string
    links: Record<string, string>
    location: string
    current_title: string
    current_employer: string
    current_employer_id: number
    current_employer_domain: string
    current_employer_website: string
    current_employer_linkedin_url: string
    job_history: JobHistory[]
    education: Education[]
    skills: string[]
    birth_year: number
    region_latitude: number
    region_longitude: number
    city: string
    region: string
    country: string
    country_code: string
    npi_data: NpiData
    recommended_email: string
    recommended_personal_email: string
    recommended_professional_email: string
    current_work_email: string
    current_personal_email: string
    emails: Email[]
    phones: Phone[]
    profile_list: ProfileList
  }

  export interface ProfileList {
    id: number
    name: string
  }

  export interface JobHistory {
    start_date: string
    end_date: string
    company: string
    company_name: string
    company_id: number
    company_linkedin_url: string
    department: string
    title: string
    highest_level: string
    description: string
    last_updated: string
    sub_department: string
    is_current: boolean
  }

  export interface Education {
    major: string
    school: string
    degree: string
    start: number
    end: number
  }

  export interface NpiData {
    npi_number: string
    credentials: string
    license_number: string
    specialization: string
  }

  export interface Email {
    email: string
    smtp_valid: string
    type: string
    last_validation_check: string
    grade: string
  }

  export interface Phone {
    number: string
    type: string
    validity: string
    recommended: boolean
    premium: boolean
    last_checked: string
  }
}

/**
 * RocketReach is a B2B person and company enrichment API.
 *
 * @see https://rocketreach.co/api/v2/docs
 */
export class RocketReachClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('ROCKETREACH_API_KEY'),
    apiBaseUrl = rocketreach.API_BASE_URL,
    timeoutMs = 60_000,
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
      `RocketReachClient missing required "apiKey" (defaults to "ROCKETREACH_API_KEY")`
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, rocketreach.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        'Api-Key': apiKey
      }
    })
  }

  async lookupPerson(opts: rocketreach.EnrichPersonOptions) {
    return this.ky
      .get('api/v2/person/lookup', { searchParams: sanitizeSearchParams(opts) })
      .json<rocketreach.Person>()
  }
}
