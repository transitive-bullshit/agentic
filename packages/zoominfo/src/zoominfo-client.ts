import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  throttleKy
} from '@agentic/core'
import { KJUR } from 'jsrsasign'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

export namespace zoominfo {
  export const API_BASE_URL = 'https://api.zoominfo.com'

  // Access tokens expire after 60 minutes, so renew them every 55 minutes.
  export const ACCESS_TOKEN_EXPIRATION_MS = 55 * 60 * 1000

  // Allow up to 25 requests per second by default.
  // https://api-docs.zoominfo.com/#rate-and-usage-limits
  export const throttle = pThrottle({
    limit: 25,
    interval: 1000
  })

  export interface EnrichContactOptions {
    personId?: string
    emailAddress?: string
    hashedEmail?: string
    phone?: string

    firstName?: string
    lastName?: string
    companyId?: string
    companyName?: string

    fullName?: string

    jobTitle?: string
    externalURL?: string
    lastUpdatedDateAfter?: string
    validDateAfter?: string
    contactAccuracyScoreMin?: number
  }

  export interface EnrichCompanyOptions {
    companyId?: string // Unique ZoomInfo identifier for a company
    companyName?: string // Company name
    companyWebsite?: string //	Company website URL in http://www.example.com format
    companyTicker?: string //	Company stock ticker symbol
    companyPhone?: string //	Phone number of the company headquarters
    companyFax?: string //	Fax number of the company headquarters
    companyStreet?: string //	Street address for the company's primary address
    companyCity?: string //	City for the company's primary address
    companyState?: string //	Company state (U.S.) or province (Canada). You can use free text state or province names (e.g., "new hampshire"), the two-letter common abbreviation for a U.S. state (e.g., "nh"), or values provided in the State lookup endpoint.
    companyZipCode?: string //	Zip Code or Postal Code for the company's primary address
    companyCountry?: string //	Country for the company's primary address. You can use free text or see the Country lookup endpoint for values.
    ipAddress?: string //	IP address associated with the company
  }

  export interface EnrichContactResponse {
    success: boolean
    data: {
      outputFields: string[][]
      result: EnrichContactResult[]
    }
  }

  export interface EnrichContactResult {
    input: Partial<EnrichContactOptions>
    data: EnrichedContact[]
  }

  export interface EnrichedContact {
    id: number
    firstName: string
    middleName: string
    lastName: string
    email: string
    hasCanadianEmail: string
    phone: string
    directPhoneDoNotCall: boolean
    street: string
    city: string
    region: string
    metroArea: string
    zipCode: string
    state: string
    country: string
    personHasMoved: string
    withinEu: boolean
    withinCalifornia: boolean
    withinCanada: boolean
    lastUpdatedDate: string
    noticeProvidedDate: string
    salutation: string
    suffix: string
    jobTitle: string
    jobFunction: JobFunction[]
    education: Education[]
    hashedEmails: string[]
    picture: string
    mobilePhoneDoNotCall: boolean
    externalUrls: ExternalUrl[]
    contactAccuracyScore: number
    isDefunct: boolean
    employmentHistory: EmploymentHistory[]
    managementLevel: string[]
    locationCompanyId: number
    company: Company
  }

  export interface JobFunction {
    name: string
    department: string
  }

  export interface Education {
    school: string
    educationDegree: EducationDegree
  }

  export interface EducationDegree {
    degree: string
    areaOfStudy: string
  }

  export interface ExternalUrl {
    type: string
    url: string
  }

  export interface EmploymentHistory {
    jobTitle: string
    managementLevel: string[]
    fromDate: string
    toDate: string
    company: {
      companyId: number
      companyName: string
      companyPhone?: string
      companyWebsite?: string
    }
  }

  export interface Company {
    id: number
    name: string
    type: string
    division: string
    descriptionList: DescriptionList[]
    phone: string
    fax: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    logo: string
    sicCodes: Code[]
    naicsCodes: Code[]
    website: string
    revenue: string
    revenueNumeric: number
    employeeCount: number
    ticker: string
    ranking: string[]
    socialMediaUrls: any[]
    primaryIndustry: string[]
    industries: string[]
    revenueRange: string
    employeeRange: string
  }

  export interface DescriptionList {
    description: string
  }

  export interface Code {
    id: string
    name: string
  }

  export interface EnrichCompanyResponse {
    success: boolean
    data: {
      outputFields: string[][]
      result: EnrichCompanyResult[]
    }
  }

  export interface EnrichCompanyResult {
    input: Partial<EnrichCompanyOptions>
    data: EnrichedCompany[]
  }

  export interface EnrichedCompany {
    id: number
    ticker: string
    name: string
    website: string
    domainList: string[]
    logo: string
    socialMediaUrls: SocialMediaUrl[]
    revenue: number
    employeeCount: number
    numberOfContactsInZoomInfo: number
    phone: string
    fax: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    continent: string
    companyStatus: string
    companyStatusDate: string
    descriptionList: DescriptionList[]
    sicCodes: Code[]
    naicsCodes: Code[]
    competitors: Competitor[]
    ultimateParentId: number
    ultimateParentName: string
    ultimateParentRevenue: number
    ultimateParentEmployees: number
    subUnitCodes: any[]
    subUnitType: string
    subUnitIndustries: string[]
    primaryIndustry: string[]
    industries: string[]
    parentId: number
    parentName: string
    locationCount: number
    alexaRank: string
    metroArea: string
    lastUpdatedDate: string
    createdDate: string
    certificationDate: string
    certified: boolean
    hashtags: Hashtag[]
    products: any[]
    techAttributes: TechAttribute[]
    revenueRange: string
    employeeRange: string
    companyFunding: CompanyFunding[]
    recentFundingAmount: number
    recentFundingDate: string
    totalFundingAmount: number
    employeeGrowth: EmployeeGrowth
  }

  export interface SocialMediaUrl {
    type: string
    url: string
    followerCount: string
  }

  export interface DescriptionList {
    description: string
  }

  export interface Competitor {
    rank: number
    id: number
    name: string
    website: string
    employeeCount: number
  }

  export interface Hashtag {
    tag: string
    external_id: any
    searchString: string
    displayLabel: string
    description: string
    group: string
    score: any
    priority?: number
    parentCategory: string
    displayScore: string
    inverseScoreBase?: number
    scoreMultipler: any
    scoreUnit: string
    hidden: boolean
    label: string
    categorizedFlag: boolean
  }

  export interface TechAttribute {
    tag: string
    categoryParent: string
    category: string
    vendor: string
    product: string
    attribute: string
    website: string
    logo?: string
    domain?: string
    createdTime: string
    modifiedTime: string
    description: string
  }

  export interface CompanyFunding {
    date: string
    type: string
    amount: number
  }

  export interface EmployeeGrowth {
    oneYearGrowthRate: string
    twoYearGrowthRate: string
    employeeGrowthDataPoints: EmployeeGrowthDataPoint[]
  }

  export interface EmployeeGrowthDataPoint {
    label: string
    employeeCount: number
  }
}

/**
 * ZoomInfo ia a robust B2B entity enrichment API.
 *
 * @see https://api-docs.zoominfo.com
 */
export class ZoomInfoClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiBaseUrl: string

  protected readonly username: string
  protected readonly password: string | undefined
  protected readonly clientId: string | undefined
  protected readonly privateKey: string | undefined

  protected accessToken: string | undefined
  protected accessTokenDateMS: number | undefined

  constructor({
    username = getEnv('ZOOMINFO_USERNAME'),
    password = getEnv('ZOOMINFO_PASSWORD'),
    clientId = getEnv('ZOOMINFO_CLIENT_ID'),
    privateKey = getEnv('ZOOMINFO_PRIVATE_KEY'),
    apiBaseUrl = zoominfo.API_BASE_URL,
    timeoutMs = 60_000,
    throttle = true,
    ky = defaultKy
  }: {
    username?: string
    password?: string
    clientId?: string
    privateKey?: string
    apiBaseUrl?: string
    apiKnowledgeGraphBaseUrl?: string
    timeoutMs?: number
    throttle?: boolean
    ky?: KyInstance
  } = {}) {
    assert(
      username,
      `ZoomInfoClient missing required "username" (defaults to "ZOOMINFO_USERNAME")`
    )
    assert(
      password || (clientId && privateKey),
      `ZoomInfoClient missing required "password" for basic auth or "clientId" and "privateKey" for PKI auth (defaults to "ZOOMINFO_PASSWORD", "ZOOMINFO_CLIENT_ID", and "ZOOMINFO_PRIVATE_KEY")`
    )
    super()

    this.username = username
    this.password = password
    this.clientId = clientId
    this.privateKey = privateKey

    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, zoominfo.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs
    })
  }

  async authenticate({
    force = false
  }: { force?: boolean } = {}): Promise<void> {
    if (
      !force &&
      this.accessToken &&
      this.accessTokenDateMS! + zoominfo.ACCESS_TOKEN_EXPIRATION_MS < Date.now()
    ) {
      // Access token is still valid.
      return
    }

    if (this.username && this.password) {
      this.accessTokenDateMS = Date.now()
      this.accessToken = await this.getAccessTokenViaBasicAuth({
        username: this.username,
        password: this.password
      })
      assert(
        this.accessToken,
        'ZoomInfo failed to get access token via basic auth'
      )

      return
    }

    if (this.username && this.clientId && this.privateKey) {
      this.accessTokenDateMS = Date.now()
      this.accessToken = await this.getAccessTokenViaPKI({
        username: this.username,
        clientId: this.clientId,
        privateKey: this.privateKey
      })
      assert(
        this.accessToken,
        'ZoomInfo failed to get access token via PKI auth'
      )

      return
    }

    throw new Error(
      'ZoomInfoClient missing required authentication credentials'
    )
  }

  async getAccessTokenViaBasicAuth({
    username,
    password
  }: {
    username: string
    password: string
  }): Promise<string> {
    const res = await this.ky
      .post('authenticate', {
        json: {
          username,
          password
        }
      })
      .json<{ data: { jwt: string } }>()

    return res.data.jwt
  }

  async getAccessTokenViaPKI({
    username,
    clientId,
    privateKey
  }: {
    username: string
    clientId: string
    privateKey: string
  }): Promise<string> {
    const dtNow = Date.now()
    const header = {
      typ: 'JWT',
      alg: 'RS256'
    }
    const data = {
      iss: 'zoominfo-api-auth-client-nodejs',
      aud: 'enterprise_api',
      username,
      client_id: clientId,
      iat: getIAT(dtNow),
      exp: getEXP(dtNow)
    }
    const sHeader = JSON.stringify(header)
    const sPayload = JSON.stringify(data)

    const clientJWT = KJUR.jws.JWS.sign(
      header.alg,
      sHeader,
      sPayload,
      privateKey
    )

    const res = await this.ky
      .post('authenticate', {
        headers: {
          Authorization: `Bearer ${clientJWT}`
        }
      })
      .json<{ data: { jwt: string } }>()

    return res.data.jwt
  }

  @aiFunction({
    name: 'zoominfo_enrich_contact',
    description: `Attempts to enrich a person contact with ZoomInfo data. To match a contact, you must use one of the following combinations of parameters to construct your input:

personId OR emailAddress OR hashedEmail OR phone. Because these values are unique to a single person, you can use any one of these values to search without providing any additional parameters. You can optionally combine one of these values with a companyId/companyName.

firstName AND lastName AND companyId/companyName. Combining these values effectively results in a unique person.

fullName AND companyId/companyName. Combining these values effectively results in a unique person.`,
    inputSchema: z.object({
      firstName: z.string().optional().describe('First name of the person.'),
      lastName: z.string().optional().describe('Last name of the person.'),
      companyId: z
        .string()
        .optional()
        .describe("Unique ZoomInfo identifier of the person's company."),
      companyName: z
        .string()
        .optional()
        .describe(
          'Name of the company where the contact works, or has worked.'
        ),
      personId: z
        .string()
        .optional()
        .describe('Unique ZoomInfo identifier of the person.'),
      emailAddress: z.string().optional(),
      hashedEmail: z.string().optional(),
      phone: z.string().optional(),
      fullName: z.string().optional(),
      jobTitle: z.string().optional(),
      externalURL: z.string().optional(),
      lastUpdatedDateAfter: z.string().optional(),
      validDateAfter: z.string().optional(),
      contactAccuracyScoreMin: z.number().optional()
    })
  })
  async enrichContact(opts: zoominfo.EnrichContactOptions) {
    await this.authenticate()

    return this.ky
      .post('enrich/contact', {
        json: opts,
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .json<zoominfo.EnrichContactResponse>()
  }

  @aiFunction({
    name: 'zoominfo_enrich_company',
    description:
      'Attempts to enrich a company with ZoomInfo data. To match a company, you should ideally provide the `companyName` and `companyWebsite`.',
    inputSchema: z.object({
      companyId: z
        .string()
        .optional()
        .describe('Unique ZoomInfo identifier of company.'),
      companyName: z.string().optional().describe('Name of the company.'),
      companyWebsite: z.string().optional(),
      companyTicker: z.string().optional(),
      companyPhone: z.string().optional(),
      companyFax: z.string().optional(),
      companyStreet: z.string().optional(),
      companyCity: z.string().optional(),
      companyState: z.string().optional(),
      companyZipCode: z.string().optional(),
      companyCountry: z.string().optional(),
      ipAddress: z.string().optional()
    })
  })
  async enrichCompany(opts: zoominfo.EnrichCompanyOptions) {
    await this.authenticate()

    return this.ky
      .post('enrich/company', {
        json: opts,
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .json<zoominfo.EnrichCompanyResponse>()
  }
}

function getIAT(dtNow: number) {
  const iat = Math.floor(dtNow / 1000)
  return iat - 60
}

function getEXP(dtNow: number) {
  const exp = Math.floor(dtNow / 1000) + 5 * 60
  return exp - 60
}
