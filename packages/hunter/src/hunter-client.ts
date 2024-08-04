import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  pruneNullOrUndefinedDeep,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace hunter {
  export const API_BASE_URL = 'https://api.hunter.io'

  export const DepartmentSchema = z.enum([
    'executive',
    'it',
    'finance',
    'management',
    'sales',
    'legal',
    'support',
    'hr',
    'marketing',
    'communication',
    'education',
    'design',
    'health',
    'operations'
  ])
  export type Department = z.infer<typeof DepartmentSchema>

  export const SenioritySchema = z.enum(['junior', 'senior', 'executive'])
  export type Seniority = z.infer<typeof SenioritySchema>

  export const PersonFieldSchema = z.enum([
    'full_name',
    'position',
    'phone_number'
  ])
  export type PersonField = z.infer<typeof PersonFieldSchema>

  export const DomainSearchOptionsSchema = z.object({
    domain: z.string().optional().describe('domain to search for'),
    company: z.string().optional().describe('company name to search for'),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
    type: z.enum(['personal', 'generic']).optional(),
    seniority: z.union([SenioritySchema, z.array(SenioritySchema)]).optional(),
    department: z
      .union([DepartmentSchema, z.array(DepartmentSchema)])
      .optional(),
    required_field: z
      .union([PersonFieldSchema, z.array(PersonFieldSchema)])
      .optional()
  })
  export type DomainSearchOptions = z.infer<typeof DomainSearchOptionsSchema>

  export const EmailFinderOptionsSchema = z.object({
    domain: z.string().optional().describe('domain to search for'),
    company: z.string().optional().describe('company name to search for'),
    first_name: z.string().describe("person's first name"),
    last_name: z.string().describe("person's last name"),
    max_duration: z.number().int().positive().min(3).max(20).optional()
  })
  export type EmailFinderOptions = z.infer<typeof EmailFinderOptionsSchema>

  export const EmailVerifierOptionsSchema = z.object({
    email: z.string().describe('email address to verify')
  })
  export type EmailVerifierOptions = z.infer<typeof EmailVerifierOptionsSchema>

  export interface DomainSearchResponse {
    data: DomainSearchData
    meta: {
      results: number
      limit: number
      offset: number
      params: {
        domain?: string
        company?: string
        type?: string
        seniority?: string
        department?: string
      }
    }
    errors?: Error[]
  }

  export interface DomainSearchData {
    domain: string
    disposable: boolean
    webmail?: boolean
    accept_all?: boolean
    pattern?: string
    organization?: string
    description?: string
    industry?: string
    twitter?: string
    facebook?: string
    linkedin?: string
    instagram?: string
    youtube?: string
    technologies?: string[]
    country?: string
    state?: string
    city?: string
    postal_code?: string
    street?: string
    headcount?: string
    company_type?: string
    emails?: Email[]
    linked_domains?: string[]
  }

  export interface Email {
    value: string
    type: string
    confidence: number
    first_name?: string
    last_name?: string
    position?: string
    seniority?: string
    department?: string
    linkedin?: string
    twitter?: string
    phone_number?: string
    verification?: Verification
    sources?: Source[]
  }

  export interface Source {
    domain: string
    uri: string
    extracted_on: string
    last_seen_on: string
    still_on_page?: boolean
  }

  export interface Verification {
    date: string
    status: string
  }

  export interface EmailFinderResponse {
    data: EmailFinderData
    meta: {
      params: {
        first_name?: string
        last_name?: string
        full_name?: string
        domain?: string
        company?: string
        max_duration?: string
      }
    }
    errors?: Error[]
  }

  export interface EmailFinderData {
    first_name: string
    last_name: string
    email: string
    score: number
    domain: string
    accept_all: boolean
    position?: string
    twitter?: any
    linkedin_url?: any
    phone_number?: any
    company?: string
    sources?: Source[]
    verification?: Verification
  }

  export interface EmailVerifierResponse {
    data: EmailVerifierData
    meta: {
      params: {
        email: string
      }
    }
    errors?: Error[]
  }

  export interface EmailVerifierData {
    status:
      | 'valid'
      | 'invalid'
      | 'accept_all'
      | 'webmail'
      | 'disposable'
      | 'unknown'
    result: 'deliverable' | 'undeliverable' | 'risky'
    score: number
    email: string
    regexp: boolean
    gibberish: boolean
    disposable: boolean
    webmail: boolean
    mx_records: boolean
    smtp_server: boolean
    smtp_check: boolean
    accept_all: boolean
    block: boolean
    sources?: Source[]
    _deprecation_notice?: string
  }

  export interface Error {
    id: string
    code: number
    details: string
  }
}

/**
 * Lightweight wrapper around Hunter.io email finder, verifier, and enrichment
 * APIs.
 *
 * @see https://hunter.io/api-documentation
 */
export class HunterClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('HUNTER_API_KEY'),
    apiBaseUrl = hunter.API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'HunterClient missing required "apiKey" (defaults to "HUNTER_API_KEY")'
    )

    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  @aiFunction({
    name: 'hunter_domain_search',
    description:
      'Gets all the email addresses associated with a given company or domain.',
    inputSchema: hunter.DomainSearchOptionsSchema.pick({
      domain: true,
      company: true
    })
  })
  async domainSearch(domainOrOpts: string | hunter.DomainSearchOptions) {
    const opts =
      typeof domainOrOpts === 'string' ? { domain: domainOrOpts } : domainOrOpts
    if (!opts.domain && !opts.company) {
      throw new Error('Either "domain" or "company" is required')
    }

    const res = await this.ky
      .get('v2/domain-search', {
        searchParams: sanitizeSearchParams(
          {
            ...opts,
            api_key: this.apiKey
          },
          { csv: true }
        )
      })
      .json<hunter.DomainSearchResponse>()

    return pruneNullOrUndefinedDeep(res)
  }

  @aiFunction({
    name: 'hunter_email_finder',
    description:
      'Finds the most likely email address from a domain name, a first name and a last name.',
    inputSchema: hunter.EmailFinderOptionsSchema.pick({
      domain: true,
      company: true,
      first_name: true,
      last_name: true
    })
  })
  async emailFinder(opts: hunter.EmailFinderOptions) {
    if (!opts.domain && !opts.company) {
      throw new Error('Either "domain" or "company" is required')
    }

    const res = await this.ky
      .get('v2/email-finder', {
        searchParams: sanitizeSearchParams({
          ...opts,
          api_key: this.apiKey
        })
      })
      .json<hunter.EmailFinderResponse>()

    return pruneNullOrUndefinedDeep(res)
  }

  @aiFunction({
    name: 'hunter_email_verifier',
    description: 'Verifies the deliverability of an email address.',
    inputSchema: hunter.EmailVerifierOptionsSchema
  })
  async emailVerifier(emailOrOpts: string | hunter.EmailVerifierOptions) {
    const opts =
      typeof emailOrOpts === 'string' ? { email: emailOrOpts } : emailOrOpts

    const res = await this.ky
      .get('v2/email-verifier', {
        searchParams: sanitizeSearchParams({
          ...opts,
          api_key: this.apiKey
        })
      })
      .json<hunter.EmailVerifierResponse>()

    return pruneNullOrUndefinedDeep(res)
  }
}
