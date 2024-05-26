import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'

import type { DeepNullable } from '../types.js'
import { assert, getEnv, throttleKy } from '../utils.js'

const predictionLeadsAPIThrottle = pThrottle({
  limit: 20,
  interval: 60 * 1000,
  strict: true
})

export namespace predictleads {
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
}

export class PredictLeadsClient {
  readonly ky: KyInstance
  readonly apiKey: string
  readonly apiToken: string
  readonly _maxPageSize = 100

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
    assert(apiKey, 'PredictLeadsClient missing required "apiKey"')
    assert(apiToken, 'PredictLeadsClient missing required "apiToken"')

    this.apiKey = apiKey
    this.apiToken = apiToken

    const throttledKy = throttle
      ? throttleKy(ky, predictionLeadsAPIThrottle)
      : ky

    this.ky = throttledKy.extend({
      timeout: timeoutMs,
      headers: {
        'X-Api-Key': apiKey,
        'X-Api-Token': apiToken
      }
    })
  }

  async followCompany(domain: string, customCompanyIdentifier?: string) {
    return this.ky
      .post(
        `https://predictleads.com/api/v2/companies/${domain}/follow`,
        customCompanyIdentifier
          ? {
              json: { customCompanyIdentifier }
            }
          : undefined
      )
      .json<predictleads.GenericSuccessResponse>()
  }

  async getFollowingCompanies(limit: number = this._maxPageSize) {
    return this.ky
      .get(`https://predictleads.com/api/v2/followings`, {
        searchParams: { limit }
      })
      .json<predictleads.FollowedCompaniesResponse>()
  }

  async unfollowCompany(domain: string, customCompanyIdentifier?: string) {
    return this.ky
      .post(
        `https://predictleads.com/api/v2/companies/${domain}/unfollow`,
        customCompanyIdentifier
          ? {
              json: { customCompanyIdentifier }
            }
          : undefined
      )
      .json<predictleads.GenericSuccessResponse>()
  }

  async events(
    domain: string,
    params: {
      categories?: string
      found_at_from?: string
      found_at_until?: string
      page?: number
      limit?: string
      with_news_article_bodies?: boolean
    } = {}
  ) {
    return this.ky
      .get(`https://predictleads.com/api/v2/companies/${domain}/events`, {
        searchParams: { page: 1, ...params }
      })
      .json<predictleads.Response>()
  }

  async eventById(id: string) {
    return this.ky
      .get(`https://predictleads.com/api/v2/events/${id}`)
      .json<predictleads.Response>()
  }

  async financingEvents(domain: string) {
    return this.ky
      .get(
        `https://predictleads.com/api/v2/companies/${domain}/financing_events`
      )
      .json<predictleads.Response>()
  }

  async jobOpenings(
    domain: string,
    params: {
      categories?: string
      with_job_descriptions?: boolean
      active_only?: boolean
      not_closed?: boolean
      limit?: string
    } = {}
  ) {
    return this.ky
      .get(`https://predictleads.com/api/v2/companies/${domain}/job_openings`, {
        searchParams: params
      })
      .json<predictleads.JobOpeningResponse>()
  }

  async jobOpeningById(id: string) {
    return this.ky
      .get(`https://predictleads.com/api/v2/job_openings/${id}`)
      .json<predictleads.JobOpeningByIdResponse>()
  }

  async technologies(
    domain: string,
    params: {
      categories: string
      limit?: string
    }
  ) {
    return this.ky
      .get(`https://predictleads.com/api/v2/companies/${domain}/technologies`, {
        searchParams: params
      })
      .json<predictleads.Response>()
  }

  async connections(
    domain: string,
    params?: {
      categories: string
      limit?: string
    }
  ) {
    return this.ky
      .get(`https://predictleads.com/api/v2/companies/${domain}/connections`, {
        searchParams: params
      })
      .json<predictleads.Response>()
  }

  async websiteEvolution(
    domain: string,
    { limit = 100 }: { limit?: number } = {}
  ) {
    return this.ky
      .get(
        `https://predictleads.com/api/v2/companies/${domain}/website_evolution`,
        {
          searchParams: { limit }
        }
      )
      .json<predictleads.Response>()
  }

  async githubRepositories(
    domain: string,
    { limit = 100 }: { limit?: number } = {}
  ) {
    return this.ky
      .get(
        `https://predictleads.com/api/v2/companies/${domain}/github_repositories`,
        {
          searchParams: { limit }
        }
      )
      .json<predictleads.Response>()
  }

  async products(
    domain: string,
    params?: {
      sources: string
      limit?: number
    }
  ) {
    return this.ky
      .get(`https://predictleads.com/api/v2/companies/${domain}/products`, {
        searchParams: params
      })
      .json<predictleads.Response>()
  }

  async company(domain: string) {
    return this.ky
      .get(`https://predictleads.com/api/v2/companies/${domain}`)
      .json<predictleads.Response>()
  }

  async discoverStartupJobs(params?: {
    post_datetime_from?: string
    post_datetime_until?: string
    min_score?: string
    limit?: string
  }) {
    return this.ky
      .get(
        `https://predictleads.com/api/v2/discover/startup_platform/jobs_hn`,
        {
          searchParams: params
        }
      )
      .json<predictleads.Response>()
  }

  async discoverStartupShow(params?: {
    post_datetime_from?: string
    post_datetime_until?: string
    min_score?: string
    limit?: string
  }) {
    return this.ky
      .get(
        `https://predictleads.com/api/v2/discover/startup_platform/show_hn`,
        {
          searchParams: params
        }
      )
      .json<predictleads.Response>()
  }

  /*
    TODO this returns 500 error, even using the curl example from docs.
    Also for this reason I couldn't test the other segments endpoints
    curl -X POST "https://predictleads.com/api/v2/segments"
    -d '{"technologies":"Salesforce", "job_categories":"sales"}'
    -H "Content-Type: application/json" \
    -H 'X-Api-Key: <key>' \
    -H 'X-Api-Token: <token>'
  */
  async createSegment(params: {
    webhook_url?: string
    locations?: string
    headquarters_locations?: string
    job_categories?: string
    technologies?: string
    found_at_from?: string
    found_at_until?: string
    active?: string
    limit?: string
  }) {
    return this.ky
      .post(`https://predictleads.com/api/v2/segments`, {
        json: params
      })
      .json<any>()
  }

  async updateSegment(params: {
    id: string
    webhook_url: string
    active: string
  }) {
    return this.ky
      .put(
        `https://predictleads.com/api/v2/discover/startup_platform/show_hn`,
        {
          json: params
        }
      )
      .json<any>()
  }

  async showSegment(id: string) {
    return this.ky
      .get(`https://predictleads.com/api/v2/segments/${id}`)
      .json<any>()
  }

  async showAllSegment(limit = 100) {
    return this.ky
      .get(`https://predictleads.com/api/v2/segments`, {
        searchParams: { limit }
      })
      .json<any>()
  }
}
