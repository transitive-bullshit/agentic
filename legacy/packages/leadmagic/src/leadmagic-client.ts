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

export namespace leadmagic {
  export const API_BASE_URL = 'https://api.leadmagic.io'

  // Allow up to 300 requests per minute by default.
  // (5 requests per second)
  export const throttle = pThrottle({
    limit: 5,
    interval: 1000
  })

  export interface ProfileSearchOptions {
    linkedinUrl: string
  }

  export interface EnrichedPerson {
    profileUrl: string
    creditsConsumed: number
    firstName: string
    lastName: string
    fullName: string
    headline: string
    userSkills: string
    company_name: string
    company_size: string
    company_industry: string
    company_website: string
    totalTenureMonths: number
    totalTenureDays: number
    totalTenureYears: number
    connections: number
    country: string
    location: string
    about: string
    experiences: Experience[]
    highlights: any[]
  }

  export interface Experience {
    title: string
    subtitle: string
    caption: string
    subComponents: any[]
  }

  export interface EmailFinderOptions {
    first_name: string
    last_name: string
    domain: string
  }

  export interface MobileFinderOptions {
    linkedinUrl: string
  }

  export interface RoleFinderOptions {
    role: string
    domain: string
  }

  export interface CreditsResponse {
    credits: number
  }

  export interface EmailFinderResponse {
    emailAddress: string
    emailScore: number
    domain: string
    firstName: string
    lastName: string
    creditsConsumed: number
  }

  export interface MobileFinderResponse {
    profileUrl: string
    mobileNumber: string
    firstName: string
    lastName: string
    verificationScore: number
    creditsConsumed: number
  }

  export interface RoleFinderResponse {
    matches: RoleMatch[]
    creditsConsumed: number
  }

  export interface RoleMatch {
    fullName: string
    firstName: string
    lastName: string
    headline: string
    profileUrl: string
    emailAddress: string
    score: number
  }
}

/**
 * LeadMagic.io is a B2B person, company, and email enrichment API.
 *
 * @see https://docs.leadmagic.io
 */
export class LeadMagicClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('LEADMAGIC_API_KEY'),
    apiBaseUrl = leadmagic.API_BASE_URL,
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
      `LeadMagicClient missing required "apiKey" (defaults to "LEADMAGIC_API_KEY")`
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, leadmagic.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        'X-API-Key': apiKey
      }
    })
  }

  /**
   * Attempts to enrich a person with LeadMagic data based on their public
   * LinkedIn URL.
   */
  @aiFunction({
    name: 'leadmagic_get_person_by_linkedin_url',
    description:
      'Attempts to enrich a person with LeadMagic data based on their LinkedIn profile URL.',
    inputSchema: z.object({
      linkedinUrl: z
        .string()
        .describe(
          'The LinkedIn profile URL of the person to enrich. For example, "https://linkedin.com/in/fisch2"'
        )
    })
  })
  async getPersonByLinkedInUrl(urlOrOpts: leadmagic.ProfileSearchOptions) {
    const opts =
      typeof urlOrOpts === 'string' ? { linkedinUrl: urlOrOpts } : urlOrOpts

    return this.ky
      .post('profile-search', {
        json: {
          profile_url: opts.linkedinUrl
        }
      })
      .json<leadmagic.EnrichedPerson>()
  }

  /**
   * Checks the remaining credits balance for your LeadMagic account.
   */
  @aiFunction({
    name: 'leadmagic_check_credits',
    description:
      'Checks the remaining credits balance for your LeadMagic account.',
    inputSchema: z.object({})
  })
  async checkCredits() {
    return this.ky.post('credits').json()
  }

  /**
   * Finds email addresses based on a person's first name, last name, and company
   * domain.
   */
  @aiFunction({
    name: 'leadmagic_email_finder',
    description:
      "Finds email addresses based on a person's first name, last name, and company domain.",
    inputSchema: z.object({
      first_name: z.string().describe('The first name of the person'),
      last_name: z.string().describe('The last name of the person'),
      domain: z
        .string()
        .describe('The company domain (e.g., "https://company.com")')
    })
  })
  async findEmailsForPerson(opts: leadmagic.EmailFinderOptions) {
    return this.ky
      .post('email-finder', {
        json: {
          first_name: opts.first_name,
          last_name: opts.last_name,
          domain: opts.domain
        }
      })
      .json<leadmagic.EmailFinderResponse>()
  }

  /**
   * Finds mobile/phone numbers based on a person's LinkedIn profile URL.
   */
  @aiFunction({
    name: 'leadmagic_mobile_finder',
    description:
      "Finds mobile/phone numbers based on a person's LinkedIn profile URL.",
    inputSchema: z.object({
      linkedinUrl: z
        .string()
        .describe(
          'The LinkedIn profile URL of the person. For example, `https://linkedin.com/in/fisch2`'
        )
    })
  })
  async findMobilePhoneNumberForPerson(
    urlOrOpts: string | leadmagic.MobileFinderOptions
  ) {
    const opts =
      typeof urlOrOpts === 'string' ? { linkedinUrl: urlOrOpts } : urlOrOpts

    return this.ky
      .post('mobile-finder', {
        json: {
          profile_url: opts.linkedinUrl
        }
      })
      .json<leadmagic.MobileFinderResponse>()
  }

  /**
   * Finds people matching specific job roles at a company based on the company
   * domain.
   */
  @aiFunction({
    name: 'leadmagic_role_finder',
    description:
      'Finds people matching specific job roles at a company based on the company domain.',
    inputSchema: z.object({
      role: z
        .string()
        .describe(
          'The job role/title to search for (e.g., "CTO", "Marketing Manager")'
        ),
      domain: z
        .string()
        .describe('The company domain (e.g., "https://company.com")')
    })
  })
  async findPeopleByRole(opts: leadmagic.RoleFinderOptions) {
    return this.ky
      .post('role-finder', {
        json: {
          role: opts.role,
          domain: opts.domain
        }
      })
      .json<leadmagic.RoleFinderResponse>()
  }
}
