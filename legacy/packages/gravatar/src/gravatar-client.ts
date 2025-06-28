import crypto from 'node:crypto'

import {
  aiFunction,
  AIFunctionsProvider,
  getEnv,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

export namespace gravatar {
  export const API_BASE_URL = 'https://api.gravatar.com'

  // Allow up to 100 unauthenticated requests per hour by default.
  export const unauthenticatedThrottle = pThrottle({
    limit: 100,
    interval: 60 * 60 * 1000
  })

  // Allow up to 1000 authenticated requests per hour by default.
  export const authenticatedThrottle = pThrottle({
    limit: 1000,
    interval: 60 * 60 * 1000
  })

  export type GetProfileByIdentifierOptions = {
    email: string
  }

  export interface Profile {
    /** The SHA256 hash of the user’s primary email address. */
    hash: string
    /** The user’s display name that appears on their profile. */
    display_name: string
    first_name?: string
    last_name?: string
    /** The full URL to the user’s Gravatar profile. */
    profile_url: string
    /** The URL to the user’s avatar image, if set. */
    avatar_url: string
    /** Alternative text describing the user’s avatar. */
    avatar_alt_text: string
    /** The user’s geographical location. */
    location: string
    /** A short biography or description about the user found on their profile. */
    description: string
    /** The user’s current job title. */
    job_title: string
    /** The name of the company where the user is employed. */
    company: string
    /** An array of verified accounts the user has added to their profile. The number of verified accounts displayed is limited to a maximum of 4 in unauthenticated requests. */
    verified_accounts: VerifiedAccount[]
    /** A phonetic guide to pronouncing the user’s name. */
    pronunciation: string
    /** The pronouns the user prefers to use. */
    pronouns: string

    is_organization?: boolean
    links?: Link[]
    interests?: any[]
    gallery?: GalleryImage[]
    payments?: {
      links?: Link[]
      crypto_wallets?: CryptoWallet[]
    }

    /** The total number of verified accounts the user has added to their profile, including those not displayed on their profile. This property is only provided in authenticated API requests. */
    number_verified_accounts?: number

    /** The date and time (UTC) when the user last edited their profile. This property is only provided in authenticated API requests. Example: "2021-10-01T12:00:00Z" */
    last_profile_edit?: string

    /** The date the user registered their account. This property is only provided in authenticated API requests. Example: "2021-10-01" */
    registration_date?: string

    contact_info?: ContactInfo
  }

  export interface VerifiedAccount {
    service_type: string
    service_label: string
    service_icon: string
    url: string
    is_hidden: boolean
  }

  export interface Link {
    label: string
    url: string
  }

  export interface GalleryImage {
    url: string
    alt_text: string
  }

  export interface CryptoWallet {
    label: string
    address: string
  }

  export interface ContactInfo {
    home_phone: string
    work_phone: string
    cell_phone: string
    email: string
    contact_form: string
    calendar: string
  }
}

/**
 * A client for the Gravatar API.
 *
 * API key is optional.
 *
 * @see https://docs.gravatar.com/getting-started/
 */
export class GravatarClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey?: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('GRAVATAR_API_KEY'),
    apiBaseUrl = gravatar.API_BASE_URL,
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
    super()

    // API key is optional
    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle
      ? throttleKy(
          ky,
          apiKey
            ? gravatar.authenticatedThrottle
            : gravatar.unauthenticatedThrottle
        )
      : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: Object.fromEntries(
        apiKey ? [['Authorization', `Bearer ${apiKey}`]] : []
      )
    })
  }

  /**
   * Get Gravatar profile by email. Returns a profile object or `undefined` if not found.
   */
  @aiFunction({
    name: 'gravatar_get_profile',
    description:
      'Get Gravatar profile by email. Returns a profile object or `undefined` if not found.',
    inputSchema: z.object({
      email: z.string()
    })
  })
  async getProfileByIdentifier(
    emailOrOpts: string | gravatar.GetProfileByIdentifierOptions
  ): Promise<gravatar.Profile | undefined> {
    const { email } =
      typeof emailOrOpts === 'string' ? { email: emailOrOpts } : emailOrOpts
    const hashedEmail = crypto
      .createHash('SHA256')
      .update(email.trim().toLowerCase(), 'utf8')
      .digest('hex')

    try {
      return await this.ky
        .get(`v3/profiles/${hashedEmail}`)
        .json<gravatar.Profile>()
    } catch (err: any) {
      if (err.response?.status === 404) {
        return
      }

      throw err
    }
  }

  async getAvatarForIdentifier(
    emailOrOpts: string | gravatar.GetProfileByIdentifierOptions
  ): Promise<string> {
    const { email } =
      typeof emailOrOpts === 'string' ? { email: emailOrOpts } : emailOrOpts
    const hashedEmail = crypto
      .createHash('SHA256')
      .update(email.trim().toLowerCase(), 'utf8')
      .digest('hex')

    return `https://gravatar.com/avatar/${hashedEmail}`
  }
}
