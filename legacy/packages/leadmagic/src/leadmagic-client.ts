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
    linkedinUsername: string
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
      `LeadMagicClient missing required "username" (defaults to "LEADMAGIC_API_KEY")`
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
   * Attempts to enrich a person with LeadMagic data based on their public LinkedIn username / identifier.
   */
  @aiFunction({
    name: 'leadmagic_profile_search',
    description:
      'Attempts to enrich a person with LeadMagic data based on their public LinkedIn username / identifier.',
    inputSchema: z.object({
      linkedinUsername: z
        .string()
        .describe(
          'The public LinkedIn username / identifier of the person to enrich. This is the last part of the LinkedIn profile URL. For example, `https://linkedin.com/in/fisch2` would be `fisch2`.'
        )
    })
  })
  async profileSearch(opts: leadmagic.ProfileSearchOptions) {
    return this.ky
      .post('profile-search', {
        json: {
          profile_url: opts.linkedinUsername.split('/').at(-1)?.trim()!
        }
      })
      .json<leadmagic.EnrichedPerson>()
  }
}
