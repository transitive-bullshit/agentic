import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

export namespace apollo {
  export const API_BASE_URL = 'https://api.apollo.io'

  // Allow up to 5 requests per second by default.
  // https://docs.apollo.io/reference/rate-limits
  export const throttle = pThrottle({
    limit: 5,
    interval: 1000
  })

  export interface EnrichPersonOptions {
    first_name?: string
    last_name?: string
    name?: string
    email?: string
    hashed_email?: string
    organization_name?: string
    domain?: string
    id?: string
    linkedin_url?: string
    reveal_personal_emails?: boolean
    reveal_phone_number?: boolean
    webhook_url?: string
  }

  export interface EnrichPersonResponse {
    person: Person
  }

  export interface Person {
    id: string
    first_name: string
    last_name: string
    name: string
    linkedin_url: string
    title: string
    email_status: string
    photo_url: string
    twitter_url: any
    github_url: any
    facebook_url: any
    extrapolated_email_confidence: any
    headline: string
    email: string
    organization_id: string
    employment_history: EmploymentHistory[]
    state: string
    city: string
    country: string
    contact_id: string
    contact: Contact
    revealed_for_current_team: boolean
    organization: Organization
    is_likely_to_engage: boolean
    intent_strength: any
    show_intent: boolean
    departments: string[]
    subdepartments: string[]
    functions: string[]
    seniority: string
  }

  export interface EmploymentHistory {
    _id: string
    id: string
    created_at: string | null
    updated_at: string | null
    title: string
    key: string
    current: boolean
    degree: string | null
    description: string | null
    emails: any
    end_date?: string
    grade_level: string | null
    kind: string | null
    major: string | null
    organization_id?: string | null
    organization_name: string | null
    raw_address: string | null
    start_date: string
  }

  export interface Contact {
    contact_roles: any[]
    id: string
    first_name: string
    last_name: string
    name: string
    linkedin_url: string
    title: string
    contact_stage_id: string
    owner_id: any
    creator_id: string
    person_id: string
    email_needs_tickling: any
    organization_name: string
    source: string
    original_source: string
    organization_id: string
    headline: string
    photo_url: any
    present_raw_address: string
    linkedin_uid: any
    extrapolated_email_confidence: any
    salesforce_id: any
    salesforce_lead_id: any
    salesforce_contact_id: any
    salesforce_account_id: any
    crm_owner_id: any
    created_at: string
    emailer_campaign_ids: any[]
    direct_dial_status: any
    direct_dial_enrichment_failed_at: any
    email_status: string
    email_source: any
    account_id: string
    last_activity_date: any
    hubspot_vid: any
    hubspot_company_id: any
    crm_id: any
    sanitized_phone: string
    merged_crm_ids: any
    updated_at: string
    queued_for_crm_push: any
    suggested_from_rule_engine_config_id: any
    email_unsubscribed: any
    label_ids: any[]
    has_pending_email_arcgate_request: boolean
    has_email_arcgate_request: boolean
    existence_level: string
    email: string
    email_from_customer: boolean
    typed_custom_fields: TypedCustomFields
    custom_field_errors: any
    crm_record_url: any
    email_status_unavailable_reason: any
    email_true_status: string
    updated_email_true_status: boolean
    contact_rule_config_statuses: any[]
    source_display_name: string
    contact_emails: ContactEmail[]
    time_zone: string
    phone_numbers: PhoneNumber[]
    account_phone_note: any
    free_domain: boolean
    is_likely_to_engage: boolean
  }

  export type TypedCustomFields = any

  export interface ContactEmail {
    email: string
    email_md5: string
    email_sha256: string
    email_status: string
    email_source: any
    extrapolated_email_confidence: any
    position: number
    email_from_customer: any
    free_domain: boolean
  }

  export interface PhoneNumber {
    raw_number: string
    sanitized_number: string
    type: any
    position: number
    status: string
    dnc_status: any
    dnc_other_info: any
    dialer_flags?: DialerFlags
  }

  export interface DialerFlags {
    country_name: string
    country_enabled: boolean
    high_risk_calling_enabled: boolean
    potential_high_risk_number: boolean
  }

  export interface Organization {
    id: string
    name: string
    website_url: string
    blog_url: any
    angellist_url: any
    linkedin_url: string
    twitter_url: string
    facebook_url: string
    primary_phone: PrimaryPhone
    languages: any[]
    alexa_ranking: number
    phone: any
    linkedin_uid: string
    founded_year: number
    publicly_traded_symbol: any
    publicly_traded_exchange: any
    logo_url: string
    crunchbase_url: any
    primary_domain: string
    industry: string
    keywords: string[]
    estimated_num_employees: number
    industries: string[]
    secondary_industries: any[]
    snippets_loaded: boolean
    industry_tag_id: string
    industry_tag_hash: IndustryTagHash
    retail_location_count: number
    raw_address: string
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
    owned_by_organization_id: any
    seo_description: string
    short_description: string
    suborganizations: any[]
    num_suborganizations: number
    annual_revenue_printed: string
    annual_revenue: number
    total_funding: number
    total_funding_printed: string
    latest_funding_round_date: string
    latest_funding_stage: string
    funding_events: FundingEvent[]
    technology_names: string[]
    current_technologies: CurrentTechnology[]
    org_chart_root_people_ids: string[]
    org_chart_sector: string
    org_chart_removed: boolean
    org_chart_show_department_filter: boolean
  }

  export type PrimaryPhone = any

  export interface IndustryTagHash {
    'information technology & services': string
  }

  export interface FundingEvent {
    id: string
    date: string
    news_url?: string
    type: string
    investors: string
    amount: string
    currency: string
  }

  export interface CurrentTechnology {
    uid: string
    name: string
    category: string
  }
}

/**
 * Apollo.io is a B2B person and company enrichment API.
 *
 * @see https://docs.apollo.io
 */
export class ApolloClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('APOLLO_API_KEY'),
    apiBaseUrl = apollo.API_BASE_URL,
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
      `ApolloClient missing required "apiKey" (defaults to "APOLLO_API_KEY")`
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, apollo.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        'x-api-key': apiKey
      }
    })
  }

  /**
   * Attempts to enrich a person with Apollo data.
   *
   * Apollo relies on the information you pass via the endpoint's parameters to identify the correct person to enrich. If you provide more information about a person, Apollo is more likely to find a match within its database. If you only provide general information, such as a name without a domain or email address, you might receive a 200 response, but the response will indicate that no records have been enriched.
   *
   * By default, this endpoint does not return personal emails or phone numbers. Use the reveal_personal_emails and reveal_phone_number parameters to retrieve emails and phone numbers.
   */
  @aiFunction({
    name: 'apollo_enrich_person',
    description: `Attempts to enrich a person with Apollo data.

Apollo relies on the information you pass via the endpoint's parameters to identify the correct person to enrich. If you provide more information about a person, Apollo is more likely to find a match within its database. If you only provide general information, such as a name without a domain or email address, you might receive a 200 response, but the response will indicate that no records have been enriched.

By default, this endpoint does not return personal emails or phone numbers. Use the reveal_personal_emails and reveal_phone_number parameters to retrieve emails and phone numbers.`,
    inputSchema: z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      hashed_email: z.string().optional(),
      organization_name: z.string().optional(),
      domain: z.string().optional(),
      id: z.string().optional(),
      linkedin_url: z.string().optional(),
      reveal_personal_emails: z.boolean().optional(),
      reveal_phone_number: z.boolean().optional(),
      webhook_url: z.string().optional()
    })
  })
  async enrichPerson(opts: apollo.EnrichPersonOptions) {
    return this.ky
      .post('api/v1/people/match', { json: opts })
      .json<apollo.EnrichPersonResponse>()
  }
}
