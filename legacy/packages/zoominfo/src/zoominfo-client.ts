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

  // Access tokens expire after 60 minutes, so renew them every 57 minutes.
  export const ACCESS_TOKEN_EXPIRATION_MS = 57 * 60 * 1000

  // Allow up to 1500 requests per minute by default.
  // https://api-docs.zoominfo.com/#rate-and-usage-limits
  export const throttle = pThrottle({
    limit: 1500,
    interval: 60_000
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

    outputFields?: string[]
  }

  export interface EnrichCompanyOptions {
    /**
     * Unique ZoomInfo identifier for a company
     */
    companyId?: string
    /**
     * Company name
     */
    companyName?: string
    /**
     * Company website URL in http://www.example.com format
     */
    companyWebsite?: string
    /**
     * Company stock ticker symbol
     */
    companyTicker?: string
    /**
     * Phone number of the company headquarters
     */
    companyPhone?: string
    /**
     * Fax number of the company headquarters
     */
    companyFax?: string
    /**
     * Street address for the company's primary address
     */
    companyStreet?: string
    /**
     * City for the company's primary address
     */
    companyCity?: string
    /**
     * Company state (U.S.) or province (Canada). You can use free text state or province names (e.g., "new hampshire"), the two-letter common abbreviation for a U.S. state (e.g., "nh"), or values provided in the State lookup endpoint.
     */
    companyState?: string
    /**
     * Zip Code or Postal Code for the company's primary address
     */
    companyZipCode?: string
    /**
     * Country for the company's primary address. You can use free text or see the Country lookup endpoint for values.
     */
    companyCountry?: string
    /**
     * IP address associated with the company
     */
    ipAddress?: string

    outputFields?: string[]
  }

  export interface EnrichContactResponse {
    success: boolean
    data: {
      outputFields: string[][]
      result: EnrichContactResult[]
    }
  }

  export type MatchStatus =
    | 'NO_MATCH'
    | 'FULL_MATCH'
    | 'CONTACT_ONLY_MATCH'
    | 'COMPANY_ONLY_MATCH'
    | 'NON_MATCH_BY_REQUIRED_FIELDS'
    | 'NON_MATCH_BY_LAST_UPDATED_DATE'
    | 'NON_MATCH_BY_VALID_DATE'
    | 'NON_MATCH_BY_CONTACT_ACCURACY_MIN'
    | 'INVALID_INPUT'
    | 'LIMIT_EXCEEDED'
    | 'SERVICE_ERROR'
    | 'OPT_OUT'

  export interface EnrichContactResult {
    input: Partial<Omit<EnrichContactOptions, 'outputFields'>>
    data: EnrichedContact[]
    matchStatus?: MatchStatus
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
    matchStatus?: MatchStatus
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

  export interface SearchContactsOptions {
    /**
     * Limits the results returned to the given number of results per page. Default is 25.
     */
    rpp?: number
    /**
     * Provides the results for the given page, used in conjunction with rpp
     */
    page?: number
    /**
     * Provide sortBy if specifying sortOrder. Valid values are asc, ascending, desc, and descending. By default, results are sorted in descending order.
     */
    sortOrder?: string
    /**
     * Sort results by valid output fields: contactAccuracyScore, lastName, companyName, hierarchy, sourceCount, lastMentioned, relevance
     */
    sortBy?: string
    /**
     * Unique ZoomInfo identifier for the contact. Can include a comma-separated list.
     */
    personId?: string
    /**
     * Work email address for the contact in example@example.com format
     */
    emailAddress?: string
    /**
     * Supplemental email address for the contact in example@example.com format
     */
    supplementalEmail?: string[]
    /**
     * Hashed email value for the contact. Allows searching via an email address with the extra security of not exposing the email. Supported hash algorithms are: MD5, SHA1, SHA256 and SHA512.
     */
    hashedEmail?: string
    /**
     * List of person phones or mobile numbers. Here's an example list - any of the following phone number formats are acceptable: ["(123)-456-7890", "1234567890", "123 456 7890", "123-445-7890"]. Alphabetical characters are not allowed.
     */
    phone?: string[]
    /**
     * Contact full name
     */
    fullName?: string
    /**
     * Contact first name
     */
    firstName?: string
    /**
     * Contact middle initial
     */
    middleInitial?: string
    /**
     * Contact last name
     */
    lastName?: string
    /**
     * Contact title at current place of employment. Use OR to input multiple job titles.
     */
    jobTitle?: string
    /**
     * Exclude comma-separated list of job titles
     */
    excludeJobTitle?: string
    /**
     * Contact management level at current place of employment. See the Management Levels lookup endpoint for values.
     */
    managementLevel?: string
    /**
     * Exclude contact based on management level. See the Management Levels lookup endpoint for values.
     */
    excludeManagementLevel?: string
    /**
     * Contact department at current place of employment. See the Contact Departments lookup endpoint for values.
     */
    department?: string
    /**
     * Exclude or include board members from search results. By default, the API includes board members in results. See the Board Members lookup endpoint for values.
     */
    boardMember?: string
    /**
     * Contacts who do not have an active company associated with them are considered partial profiles. Exclude contacts with a partial profile from search results.
     */
    excludePartialProfiles?: boolean
    /**
     * Return only executives
     */
    executivesOnly?: boolean
    /**
     * Specify a list of required fields for each record returned. Can include email, phone (direct or company), directPhone, personalEmail, and mobilePhone. Can include a comma-separated list of these fields. For example, requiring direct phone (directPhone) will only return contacts which have the Direct Phone Number field populated.
     */
    requiredFields?: string
    /**
     * Minimum accuracy score for search results. This score indicates the likelihood that a contact is reachable and still employed by the company listed. Minimum score is 70 and maximum is 99.
     */
    contactAccuracyScoreMin?: string
    /**
     * Maximum accuracy score for search results. This score indicates the likelihood that a contact is reachable and still employed by the company listed. Minimum score is 70 and maximum is 99.
     */
    contactAccuracyScoreMax?: string
    /**
     * Contact job function at their current place of employment. See the Job Function lookup endpoint for values.
     */
    jobFunction?: string
    /**
     * The date after which the contact's profile was last updated in YYYY-MM-DD format
     */
    lastUpdatedDateAfter?: string
    /**
     * The date after which the contact's profile was last validated in YYYY-MM-DD format
     */
    validDateAfter?: string
    /**
     * Number of months within which the contact's profile was last updated. For example, if lastUpdatedinMonths is 12 only contacts that were updated in the last 12 months will be returned.
     */
    lastUpdatedInMonths?: number
    /**
     * Contacts who have been notified of inclusion in ZoomInfo's database. Values are exclude, include, and only.
     */
    hasBeenNotified?: string
    /**
     * Returns companies based on a contact's work history. Values are present (default), past, and pastAndPresent.
     */
    companyPastOrPresent?: string
    /**
     * Contact educational institution
     */
    school?: string
    /**
     * Contact education degree
     */
    degree?: string
    /**
     * Searches by contact's location IDs. Use the Location Enrich endpoint to obtain a list of location IDs for a company.
     */
    locationCompanyId?: string[]
    /**
     * ZoomInfo unique identifier for the company. Will accept a comma-separated list.
     */
    companyId?: string
    /**
     * Company name. Can use OR and NOT operators to include or exclude companies by name. For example, "Vodaphone OR Comcast NOT Verizon"
     */
    companyName?: string
    /**
     * URL to the company website in http://www.example.com format
     */
    companyWebsite?: string
    /**
     * Company stock ticker symbol
     */
    companyTicker?: string[]
    /**
     * Text description unique to the company you want to use as search criteria
     */
    companyDescription?: string
    /**
     * ZoomInfo Company ID for parent company
     */
    parentId?: string
    /**
     * ZoomInfo Company ID for ultimate parent company
     */
    ultimateParentId?: string
    /**
     * Company type (private, public, and so on). See the Company Type lookup endpoint for values.
     */
    companyType?: string
    /**
     * Company address
     */
    address?: string
    /**
     * Company street
     */
    street?: string
    /**
     * Company state (U.S.) or province (Canada). You can use free text state or province names (e.g., "new hampshire"), the two-letter common abbreviation for a U.S. state (e.g., "nh"), or values provided in the State lookup endpoint.
     */
    state?: string
    /**
     * Zip Code of the company's primary address.
     */
    zipCode?: string
    /**
     * Country for the company's primary address. You can use free text or see the Country lookup endpoint for values.
     */
    country?: string
    /**
     * Continent for the company's primary address. See the Continent lookup endpoint for values.
     */
    continent?: string
    /**
     * Used in conjunction with zipCode, designates a geographical radius (in miles) from the zipCode provided.
     */
    zipCodeRadiusMiles?: string
    /**
     * Hash tags for a company. Can include a comma-separated list.
     */
    hashTagString?: string
    /**
     * Specify technology product tags. See the Tech - Product lookup endpoint for values. This string uses a numerical dot notation format similar to an IP address. The notation denotes the hierarchical structure: parent-category.category.vendor. For example, 333.202.28. You can use wildcards in the notation (e.g., 333.202.\\\\\\*, \\\\\\*.202.\\\\\\*, and so on).
     */
    techAttributeTagList?: string
    /**
     * Company sub types (e.g., division, subsidiary and so on). See the Sub Unit Type lookup endpoint for values.
     */
    subUnitTypes?: string
    /**
     * Used in conjunction with the industryCodes input parameter. When set to true, any result returned must have one of the specified industries as a primary industry. If no industries are specified, then this parameter will be ignored. Default is false.
     */
    primaryIndustriesOnly?: boolean
    /**
     * Top-level industry that the contact works in. A contact can have multiple top level industries. Tags are based on the contact's current company. Can include a comma-separated list. See the Industry Codes lookup endpoint for values.
     */
    industryCodes?: string
    /**
     * Industry keywords associated with a company. Can include a comma-separated list.
     */
    industryKeywords?: string
    /**
     * The Standard Industrial Classification is a system for classifying industries by a four-digit code. See the SIC Codes lookup endpoint for values.
     */
    sicCodes?: string
    /**
     * The North American Industry Classification System (NAICS) is the standard used by Federal statistical agencies in classifying business establishments for the purpose of collecting, analyzing, and publishing statistical data related to the U.S. business economy. See the NAICS Codes lookup endpoint for values.
     */
    naicsCodes?: string
    /**
     * Minimum annual revenue for a company in U.S. dollars. Use with revenueMax to set a range. Alternatively, you can use the revenue parameter to search for pre-defined ranges.
     */
    revenueMin?: number
    /**
     * Maximum annual revenue for a company in U.S. dollars. Use with revenueMin to set a range. Alternatively, you can use the revenue parameter to search for pre-defined ranges.
     */
    revenueMax?: number
    /**
     * Annual revenue range in U.S. dollars. Accepts a comma-separated list of values. See the Revenue Range lookup endpoint for values. Alternatively, to get more granular ranges, you can use the revenueMin and revenueMax parameters.
     */
    revenue?: string
    /**
     * Minimum employee count for a company. Use with employeeRangeMax to set a range. Alternatively, you can use the employeeCount parameter to search for pre-defined ranges.
     */
    employeeRangeMin?: string
    /**
     * Maximum employee count for a company. Use with employeeRangeMin to set a range. Alternatively, you can use the employeeCount parameter to search for pre-defined ranges.
     */
    employeeRangeMax?: string
    /**
     * Employee count range. Accepts a comma-separated list of values. See the Employee Count lookup endpoint for values. Alternatively, to get more granular ranges, you can use the employeeRangeMin and employeeRangeMax parameters.
     */
    employeeCount?: string
    /**
     * Company ranking list (e.g., Fortune 500 and so on). See the Company Ranking lookup endpoint for values.
     */
    companyRanking?: string
    /**
     * Company metro area. Accepts a comma-separated list of U.S. and Canada metro areas. See the Metro Area lookup endpoint for values.
     */
    metroRegion?: string
    /**
     * Location criteria for search. Values are PersonOrHQ, PersonAndHQ, Person, HQ, PersonThenHQ.
     */
    locationSearchType?: string
    /**
     * Minimum funding amount in thousands (e.g., 1 = 1000, 500 = 500,000). If fundingAmountMin is used without fundingAmountMax, the result will be the amount specified or greater.
     */
    fundingAmountMin?: number
    /**
     * Maximum funding amount in thousands (e.g., 1 = 1000, 500 = 500,000). If fundingAmountMax is used without fundingAmountMin, the result will be the amount specified or less.
     */
    fundingAmountMax?: number
    /**
     * Start date of the funding in YYYY-MM-DD format. If fundingStartDate and fundingEndDate are both specified, they will be used as a range. Start date after end date returns an error. If start date and end date are the same, will return results for exact date.
     */
    fundingStartDate?: string
    /**
     * End date of the funding in YYYY-MM-DD format. If fundingStartDate and fundingEndDate are both specified, they will be used as a range. Start date after end date returns an error. If start date and end date are the same, will return results for exact date.
     */
    fundingEndDate?: string
    /**
     * Exclude a company metro area. Accepts a comma-separated list of U.S. and Canada metro areas. See the Metro Area lookup endpoint for values.
     */
    excludedRegions?: string
    /**
     * Minimum number of ZoomInfo contacts associated with company
     */
    zoominfoContactsMin?: string
    /**
     * Maximum number of ZoomInfo contacts associated with company
     */
    zoominfoContactsMax?: string
    /**
     * Company hierarchical structure
     */
    companyStructureIncludedSubUnitTypes?: string
    /**
     * Minimum one year employee growth rate for a company. Use with oneYearEmployeeGrowthRateMax to set a range.
     */
    oneYearEmployeeGrowthRateMin?: string
    /**
     * Maximum one year employee growth rate for a company. Use with oneYearEmployeeGrowthRateMin to set a range.
     */
    oneYearEmployeeGrowthRateMax?: string
    /**
     * Minimum two year employee growth rate for a company. Use with twoYearEmployeeGrowthRateMax to set a range.
     */
    twoYearEmployeeGrowthRateMin?: string
    /**
     * Maximum two year employee growth rate for a company. Use with twoYearEmployeeGrowthRateMin to set a range.
     */
    twoYearEmployeeGrowthRateMax?: string
    /**
     * Minimum date for when a contact began current employment. Use with positionStartDateMax to set a range.
     */
    positionStartDateMin?: string
    /**
     * Maximum date for when a contact began current employment. Use with positionStartDateMin to set a range.
     */
    positionStartDateMax?: string
    /**
     * List of web references for a contact. Default criteria is OR between multiple values. Should only contain english letters and numbers.
     */
    webReferences?: string[]
    /**
     * Boolean flag for Buying Committee. Setting this to TRUE will filter the results based on the Buying Committees set for the account. Default is FALSE.
     */
    filterByBuyingCommittee?: boolean
    /**
     * List of technology skills for a contact. Default criteria is OR between multiple values. Should only contain string numbers
     */
    techSkills?: string[]
    /**
     * Years of overall experience. Must be a comma-separated string of values. See the Years of Experience lookup endpoint for values.
     */
    yearsOfExperience?: string
    /**
     * Engagement start date in YYYY-MM-DD format.
     */
    engagementStartDate?: string
    /**
     * Engagement end date in YYYY-MM-DD format. EngagementStartDate is required.
     */
    engagementEndDate?: string
    /**
     * List of engagement types to search for. Accepted values are a list of email, phone, online meeting.
     */
    engagementType?: string[]
  }

  export interface SearchCompaniesOptions {
    /**
     * Limits the results returned to the given number of results per page. Default is 25.
     */
    rpp?: number
    /**
     * Provides the results for the given page, used in conjunction with rpp
     */
    page?: number
    /**
     * Provide sortBy if specifying sortOrder. Valid values are asc, ascending, desc, and descending. By default, results are sorted in descending order.
     */
    sortOrder?: string
    /**
     * Sort results by valid output fields: name, employeeCount, revenue
     */
    sortBy?: string
    /**
     * ZoomInfo unique identifier for the company. Will accept-comma-separated list.
     */
    companyId?: string
    /**
     * Company name
     */
    companyName?: string
    /**
     * URL to the company website in http://www.example.com format
     */
    companyWebsite?: string
    /**
     * Text description unique to the company you want to use as search criteria
     */
    companyDescription?: string
    /**
     * ZoomInfo Company ID for parent company
     */
    parentId?: string
    /**
     * ZoomInfo Company ID for ultimate parent company
     */
    ultimateParentId?: string
    /**
     * Company stock ticker symbol
     */
    companyTicker?: string[]
    /**
     * Company type (private, public, and so on). See the Company Type lookup endpoint for values.
     */
    companyType?: string
    /**
     * Search using Business Model (B2C, B2B, B2G) for a company. Default is All
     */
    businessModel?: string[]
    /**
     * Company address
     */
    address?: string
    /**
     * Company street
     */
    street?: string
    /**
     * Company state (U.S.) or province (Canada). You can use free text state or province names (e.g., "new hampshire"), the two-letter common abbreviation for a U.S. state (e.g., "nh"), or values provided in the State lookup endpoint. Do not use state in conjunction with country in a search request, as the system uses OR logic between these two fields. If both are included in the request, the returned results will reflect all states.
     */
    state?: string
    /**
     * Zip Code of the company's primary address.
     */
    zipCode?: string
    /**
     * Country for the company's primary address. You can use free text or see the Country lookup endpoint for values. Do not use country in conjunction with state in a search request, as the system uses OR logic between these two fields. If both are included in the request, the returned results will reflect all states.
     */
    country?: string
    /**
     * Continent for the company's primary address. See the Continent lookup endpoint for values.
     */
    continent?: string
    /**
     * Used in conjunction with zipCode, designates a geographical radius (in miles) from the zipCode provided.
     */
    zipCodeRadiusMiles?: string
    /**
     * Hash tags for a company. Can include a comma-separated list.
     */
    hashTagString?: string
    /**
     * Specify technology product tags. See the Tech - Product lookup endpoint for values. This string uses a numerical dot notation format similar to an IP address. The notation denotes the hierarchical structure: parent-category.category.vendor. For example, 333.202.28. You can use wildcards in the notation (e.g., 333.202.\\\\*, \\\\*.202.\\\\*, and so on).
     */
    techAttributeTagList?: string
    /**
     * Company sub types (e.g., division, subsidiary and so on). See the Sub Unit Type lookup endpoint for values.
     */
    subUnitTypes?: string
    /**
     * Used in conjunction with the industryCodes input parameter. When set to true, any result returned must have one of the specified industries as a primary industry. If no industries are specified, then this parameter will be ignored. Default is false.
     */
    primaryIndustriesOnly?: boolean
    /**
     * Top-level Industry that the contact works in. A contact can have multiple top level industries. Tags are based on the contact's current company. Can include a comma-separated list. See the Industry Codes lookup endpoint for values.
     */
    industryCodes?: string
    /**
     * Industry keywords associated with a company. Can include either 'AND' or 'OR' operators. For example, 'software AND security' or 'software OR security'.
     */
    industryKeywords?: string
    /**
     * The Standard Industrial Classification is a system for classifying industries by a four-digit code. See the SIC Codes lookup endpoint for values.
     */
    sicCodes?: string
    /**
     * The North American Industry Classification System (NAICS) is the standard used by Federal statistical agencies in classifying business establishments for the purpose of collecting, analyzing, and publishing statistical data related to the U.S. business economy. See the NAICS Codes lookup endpoint for values.
     */
    naicsCodes?: string
    /**
     * Minimum annual revenue for a company in U.S. dollars. Use with revenueMax to set a range. Alternatively, you can use the revenue parameter to search for pre-defined ranges.
     */
    revenueMin?: number
    /**
     * Maximum annual revenue for a company in U.S. dollars. Use with revenueMin to set a range. Alternatively, you can use the revenue parameter to search for pre-defined ranges.
     */
    revenueMax?: number
    /**
     * Annual revenue range in U.S. dollars. Accepts a comma-separated list of values. See the Revenue Range lookup endpoint for values. Alternatively, to get more granular ranges, you can use the revenueMin and revenueMax parameters.
     */
    revenue?: string
    /**
     * Minimum employee count for a company. Use with employeeRangeMax to set a range. Alternatively, you can use the employeeCount parameter to search for pre-defined ranges.
     */
    employeeRangeMin?: string
    /**
     * Maximum employee count for a company. Use with employeeRangeMin to set a range. Alternatively, you can use the employeeCount parameter to search for pre-defined ranges.
     */
    employeeRangeMax?: string
    /**
     * Employee count range. Accepts a comma-separated list of values. See the Employee Count lookup endpoint for values. Alternatively, to get more granular ranges, you can use the employeeRangeMin and employeeRangeMax parameters.
     */
    employeeCount?: string
    /**
     * Company ranking list (e.g., Fortune 500 and so on). See the Company Ranking lookup endpoint for values.
     */
    companyRanking?: string
    /**
     * Company metro area. Accepts a comma-separated list of U.S. and Canada metro areas. See the Metro Area lookup endpoint for values.
     */
    metroRegion?: string
    /**
     * Location criteria for search. Values are PersonOrHQ, PersonAndHQ, Person, HQ, PersonThenHQ.
     */
    locationSearchType?: string
    /**
     * Minimum funding amount in thousands (e.g., 1 = 1000, 500 = 500,000). If fundingAmountMin is used without fundingAmountMax, the result will be the amount specified or greater.
     */
    fundingAmountMin?: number
    /**
     * Maximum funding amount in thousands (e.g., 1 = 1000, 500 = 500,000). If fundingAmountMax is used without fundingAmountMin, the result will be the amount specified or less.
     */
    fundingAmountMax?: number
    /**
     * Start date of the funding in YYYY-MM-DD format. If fundingStartDate and fundingEndDate are both specified, they will be used as a range. Start date after end date returns an error. If start date and end date are the same, will return results for exact date.
     */
    fundingStartDate?: string
    /**
     * End date of the funding in YYYY-MM-DD format. If fundingStartDate and fundingEndDate are both specified, they will be used as a range. Start date after end date returns an error. If start date and end date are the same, will return results for exact date.
     */
    fundingEndDate?: string
    /**
     * Exclude a company metro area. Accepts a comma-separated list of U.S. and Canada metro areas. See the Metro Area lookup endpoint for values.
     */
    excludedRegions?: string
    /**
     * Minimum number of ZoomInfo contacts associated with company
     */
    zoominfoContactsMin?: string
    /**
     * Maximum number of ZoomInfo contacts associated with company
     */
    zoominfoContactsMax?: string
    /**
     * Company hierarchical structure
     */
    companyStructureIncludedSubUnitTypes?: string
    /**
     * Denotes if ZoomInfo's research and data team has confirmed activity within the past 12 months
     */
    certified?: number
    /**
     * Include or exclude defunct companies. The default value is false.
     */
    excludeDefunctCompanies?: boolean
    /**
     * Minimum one year employee growth rate for a company. Use with oneYearEmployeeGrowthRateMax to set a range.
     */
    oneYearEmployeeGrowthRateMin?: string
    /**
     * Maximum one year employee growth rate for a company. Use with oneYearEmployeeGrowthRateMin to set a range.
     */
    oneYearEmployeeGrowthRateMax?: string
    /**
     * Minimum two year employee growth rate for a company. Use with twoYearEmployeeGrowthRateMax to set a range.
     */
    twoYearEmployeeGrowthRateMin?: string
    /**
     * Maximum two year employee growth rate for a company. Use with twoYearEmployeeGrowthRateMin to set a range.
     */
    twoYearEmployeeGrowthRateMax?: string
    /**
     * Engagement start date in YYYY-MM-DD format.
     */
    engagementStartDate?: string
    /**
     * Engagement end date in YYYY-MM-DD format. EngagementStartDate is required.
     */
    engagementEndDate?: string
    /**
     * List of engagement types to search for. Accepted values are a list of email, phone, online meeting.
     */
    engagementType?: string[]
  }

  export interface SearchResult<T> {
    maxResults: number
    totalResults: number
    currentPage: number
    data: T[]
  }

  export type SearchContactsResponse = SearchResult<ContactSearchResult>
  export type SearchCompaniesResponse = SearchResult<CompanySearchResult>

  export interface ContactSearchResult {
    id: number
    firstName: string
    middleName: string
    lastName: string
    validDate: string
    lastUpdatedDate: string
    jobTitle: string
    contactAccuracyScore: number
    hasEmail: boolean
    hasSupplementalEmail: boolean
    hasDirectPhone: boolean
    hasMobilePhone: boolean
    hasCompanyIndustry: boolean
    hasCompanyPhone: boolean
    hasCompanyStreet: boolean
    hasCompanyState: boolean
    hasCompanyZipCode: boolean
    hasCompanyCountry: boolean
    hasCompanyRevenue: boolean
    hasCompanyEmployeeCount: boolean
    company: CompanySearchResult
  }

  export interface CompanySearchResult {
    id: number
    name: string
  }

  export const defaultEnrichContactOutputFields = [
    'id',
    'firstName',
    'middleName',
    'lastName',
    'email',
    'hasCanadianEmail',
    'phone',
    'directPhoneDoNotCall',
    'street',
    'city',
    'region',
    'metroArea',
    'zipCode',
    'state',
    'country',
    'personHasMoved',
    'withinEu',
    'withinCalifornia',
    'withinCanada',
    'lastUpdatedDate',
    'noticeProvidedDate',
    'salutation',
    'suffix',
    'jobTitle',
    'jobFunction',
    'companyDivision',
    'education',
    'hashedEmails',
    'picture',
    'mobilePhoneDoNotCall',
    'externalUrls',
    'companyId',
    'companyName',
    'companyDescriptionList',
    'companyPhone',
    'companyFax',
    'companyStreet',
    'companyCity',
    'companyState',
    'companyZipCode',
    'companyCountry',
    'companyLogo',
    'companySicCodes',
    'companyNaicsCodes',
    'contactAccuracyScore',
    'companyWebsite',
    'companyRevenue',
    'companyRevenueNumeric',
    'companyEmployeeCount',
    'companyType',
    'companyTicker',
    'companyRanking',
    'isDefunct',
    'companySocialMediaUrls',
    'companyPrimaryIndustry',
    'companyIndustries',
    'companyRevenueRange',
    'companyEmployeeRange',
    'employmentHistory',
    'managementLevel',
    'locationCompanyId'
  ] as const

  export const defaultEnrichCompanyOutputFields = [
    'id',
    'name',
    'website',
    'domainList',
    'logo',
    'ticker',
    'revenue',
    'socialMediaUrls',
    'employeeCount',
    'numberOfContactsInZoomInfo',
    'phone',
    'fax',
    'street',
    'city',
    'state',
    'zipCode',
    'country',
    'continent',
    'companyStatus',
    'companyStatusDate',
    'descriptionList',
    'sicCodes',
    'naicsCodes',
    'competitors',
    'ultimateParentId',
    'ultimateParentName',
    'ultimateParentRevenue',
    'ultimateParentEmployees',
    'subUnitCodes',
    'subUnitType',
    'subUnitIndustries',
    'primaryIndustry',
    'industries',
    'parentId',
    'parentName',
    'locationCount',
    'metroArea',
    'lastUpdatedDate',
    'createdDate',
    'certificationDate',
    'certified',
    'hashtags',
    'products',
    'techAttributes',
    'revenueRange',
    'employeeRange',
    'companyFunding',
    'recentFundingAmount',
    'recentFundingDate',
    'totalFundingAmount',
    'employeeGrowth'
  ] as const

  export interface UsageResponse {
    usage: Usage[]
  }

  export interface Usage {
    limitType: string
    description: string
    limit: number
    currentUsage: number
    usageRemaining: number
  }
}

/**
 * ZoomInfo is a robust B2B enrichment and search API for people and companies.
 *
 * @see https://api-docs.zoominfo.com
 * @see https://tech-docs.zoominfo.com/enterprise-api-getting-started-guide.pdf
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

  /**
   * Attempts to authenticate with ZoomInfo using the provided credentials
   * (either basic auth or PKI auth). If there's already a valid access token,
   * then it will be reused unless `force` is set to `true`.
   *
   * NOTE: All API methods call this internally, so there is no reason to call
   * this yourself unless you need to force a re-authentication.
   */
  async authenticate({
    force = false
  }: { force?: boolean } = {}): Promise<void> {
    if (
      !force &&
      this.accessToken &&
      this.accessTokenDateMS! + zoominfo.ACCESS_TOKEN_EXPIRATION_MS > Date.now()
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

  /**
   * This method is used internally and should not be called directly except
   * for advanced use cases.
   */
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
        },
        headers: {
          'cache-control': 'no-cache'
        }
      })
      .json<{ jwt: string }>()

    return res.jwt
  }

  /**
   * This method is used internally and should not be called directly except
   * for advanced use cases.
   */
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
      aud: 'enterprise_api',
      iss: 'api-client@zoominfo.com',
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
        json: {},
        headers: {
          Authorization: `Bearer ${clientJWT}`,
          'cache-control': 'no-cache'
        }
      })
      .json<{ jwt: string }>()

    return res.jwt
  }

  /**
   * Attempts to enrich a person contact with ZoomInfo data
   */
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
      contactAccuracyScoreMin: z.number().optional(),
      outputFields: z.array(z.string()).optional()
    })
  })
  async enrichContact(opts: zoominfo.EnrichContactOptions) {
    await this.authenticate()

    const {
      outputFields = zoominfo.defaultEnrichContactOutputFields,
      ...matchPersonInput
    } = opts

    return this.ky
      .post('enrich/contact', {
        json: {
          matchPersonInput: [matchPersonInput],
          outputFields
        },
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .json<zoominfo.EnrichContactResponse>()
  }

  /**
   * Attempts to enrich a company with ZoomInfo data.
   */
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
      ipAddress: z.string().optional(),
      outputFields: z.array(z.string()).optional()
    })
  })
  async enrichCompany(opts: zoominfo.EnrichCompanyOptions) {
    await this.authenticate()

    const {
      outputFields = zoominfo.defaultEnrichCompanyOutputFields,
      ...matchCompanyInput
    } = opts

    return this.ky
      .post('enrich/company', {
        json: {
          matchCompanyInput: [matchCompanyInput],
          outputFields
        },
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .json<zoominfo.EnrichCompanyResponse>()
  }

  /**
   * Returns a list of Contacts from ZoomInfo's data that meet the specified
   * search criteria.
   */
  @aiFunction({
    name: 'zoominfo_search_contacts',
    description:
      "Returns a list of Contacts from ZoomInfo's data that meet the specified search criteria.",
    inputSchema: z.object({
      rpp: z.number().optional(),
      page: z.number().optional(),
      sortOrder: z.string().optional(),
      sortBy: z.string().optional(),
      personId: z.string().optional(),
      emailAddress: z.string().optional(),
      supplementalEmail: z.array(z.string()).optional(),
      hashedEmail: z.string().optional(),
      phone: z.array(z.string()).optional(),
      fullName: z.string().optional(),
      firstName: z.string().optional(),
      middleInitial: z.string().optional(),
      lastName: z.string().optional(),
      jobTitle: z.string().optional(),
      excludeJobTitle: z.string().optional(),
      managementLevel: z.string().optional(),
      excludeManagementLevel: z.string().optional(),
      department: z.string().optional(),
      boardMember: z.string().optional(),
      excludePartialProfiles: z.boolean().optional(),
      executivesOnly: z.boolean().optional(),
      requiredFields: z.string().optional(),
      contactAccuracyScoreMin: z.string().optional(),
      contactAccuracyScoreMax: z.string().optional(),
      jobFunction: z.string().optional(),
      lastUpdatedDateAfter: z.string().optional(),
      validDateAfter: z.string().optional(),
      lastUpdatedInMonths: z.number().optional(),
      hasBeenNotified: z.string().optional(),
      companyPastOrPresent: z.string().optional(),
      school: z.string().optional(),
      degree: z.string().optional(),
      locationCompanyId: z.array(z.string()).optional(),
      companyId: z.string().optional(),
      companyName: z.string().optional(),
      companyWebsite: z.string().optional(),
      companyTicker: z.array(z.string()).optional(),
      companyDescription: z.string().optional(),
      parentId: z.string().optional(),
      ultimateParentId: z.string().optional(),
      companyType: z.string().optional(),
      address: z.string().optional(),
      street: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
      continent: z.string().optional(),
      zipCodeRadiusMiles: z.string().optional(),
      hashTagString: z.string().optional(),
      techAttributeTagList: z.string().optional(),
      subUnitTypes: z.string().optional(),
      primaryIndustriesOnly: z.boolean().optional(),
      industryCodes: z.string().optional(),
      industryKeywords: z.string().optional(),
      sicCodes: z.string().optional(),
      naicsCodes: z.string().optional(),
      revenueMin: z.number().optional(),
      revenueMax: z.number().optional(),
      revenue: z.string().optional(),
      employeeRangeMin: z.string().optional(),
      employeeRangeMax: z.string().optional(),
      employeeCount: z.string().optional(),
      companyRanking: z.string().optional(),
      metroRegion: z.string().optional(),
      locationSearchType: z.string().optional(),
      fundingAmountMin: z.number().optional(),
      fundingAmountMax: z.number().optional(),
      fundingStartDate: z.string().optional(),
      fundingEndDate: z.string().optional(),
      excludedRegions: z.string().optional(),
      zoominfoContactsMin: z.string().optional(),
      zoominfoContactsMax: z.string().optional(),
      companyStructureIncludedSubUnitTypes: z.string().optional(),
      oneYearEmployeeGrowthRateMin: z.string().optional(),
      oneYearEmployeeGrowthRateMax: z.string().optional(),
      twoYearEmployeeGrowthRateMin: z.string().optional(),
      twoYearEmployeeGrowthRateMax: z.string().optional(),
      positionStartDateMin: z.string().optional(),
      positionStartDateMax: z.string().optional(),
      webReferences: z.array(z.string()).optional(),
      filterByBuyingCommittee: z.boolean().optional(),
      techSkills: z.array(z.string()).optional(),
      yearsOfExperience: z.string().optional(),
      engagementStartDate: z.string().optional(),
      engagementEndDate: z.string().optional(),
      engagementType: z.array(z.string()).optional()
    })
  })
  async searchContacts(opts: zoominfo.SearchContactsOptions) {
    await this.authenticate()

    return this.ky
      .post('search/contact', {
        json: opts,
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .json<zoominfo.SearchContactsResponse>()
  }

  /**
   * Returns a list of Companies from ZoomInfo's data which meet the specified
   * search criteria.
   */
  @aiFunction({
    name: 'zoominfo_search_companies',
    description:
      "Returns a list of Companies from ZoomInfo's data that meet the specified search criteria.",
    inputSchema: z.object({
      rpp: z.number().optional(),
      page: z.number().optional(),
      sortOrder: z.string().optional(),
      sortBy: z.string().optional(),
      companyId: z.string().optional(),
      companyName: z.string().optional(),
      companyWebsite: z.string().optional(),
      companyDescription: z.string().optional(),
      parentId: z.string().optional(),
      ultimateParentId: z.string().optional(),
      companyTicker: z.array(z.string()).optional(),
      companyType: z.string().optional(),
      businessModel: z.array(z.string()).optional(),
      address: z.string().optional(),
      street: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
      continent: z.string().optional(),
      zipCodeRadiusMiles: z.string().optional(),
      hashTagString: z.string().optional(),
      techAttributeTagList: z.string().optional(),
      subUnitTypes: z.string().optional(),
      primaryIndustriesOnly: z.boolean().optional(),
      industryCodes: z.string().optional(),
      industryKeywords: z.string().optional(),
      sicCodes: z.string().optional(),
      naicsCodes: z.string().optional(),
      revenueMin: z.number().optional(),
      revenueMax: z.number().optional(),
      revenue: z.string().optional(),
      employeeRangeMin: z.string().optional(),
      employeeRangeMax: z.string().optional(),
      employeeCount: z.string().optional(),
      companyRanking: z.string().optional(),
      metroRegion: z.string().optional(),
      locationSearchType: z.string().optional(),
      fundingAmountMin: z.number().optional(),
      fundingAmountMax: z.number().optional(),
      fundingStartDate: z.string().optional(),
      fundingEndDate: z.string().optional(),
      excludedRegions: z.string().optional(),
      zoominfoContactsMin: z.string().optional(),
      zoominfoContactsMax: z.string().optional(),
      companyStructureIncludedSubUnitTypes: z.string().optional(),
      certified: z.number().optional(),
      excludeDefunctCompanies: z.boolean().optional(),
      oneYearEmployeeGrowthRateMin: z.string().optional(),
      oneYearEmployeeGrowthRateMax: z.string().optional(),
      twoYearEmployeeGrowthRateMin: z.string().optional(),
      twoYearEmployeeGrowthRateMax: z.string().optional(),
      engagementStartDate: z.string().optional(),
      engagementEndDate: z.string().optional(),
      engagementType: z.array(z.string()).optional()
    })
  })
  async searchCompanies(opts: zoominfo.SearchCompaniesOptions) {
    await this.authenticate()

    return this.ky
      .post('search/company', {
        json: opts,
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .json<zoominfo.SearchCompaniesResponse>()
  }

  /**
   * Retrieve current usage stats and available data depending on your
   * ZoomInfo plan.
   */
  @aiFunction({
    name: 'zoominfo_get_usage',
    description:
      'Retrieves current usage stats for available data depending on your ZoomInfo plan.',
    inputSchema: z.object({})
  })
  async getUsage() {
    await this.authenticate()

    return this.ky
      .get('lookup/usage', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'cache-control': 'no-cache'
        }
      })
      .json<zoominfo.UsageResponse>()
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
