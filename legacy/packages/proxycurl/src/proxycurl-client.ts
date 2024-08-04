import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams,
  type Simplify,
  throttleKy
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import pThrottle from 'p-throttle'
import { z } from 'zod'

// All proxycurl types are auto-generated from their openapi spec
export namespace proxycurl {
  // Allow up to 300 requests per minute by default (enforced at 5 minute intervals).
  export const throttle = pThrottle({
    limit: 1500,
    interval: 5 * 60 * 1000
  })

  export const CompanyTypeSchema = z.enum([
    'EDUCATIONAL',
    'GOVERNMENT_AGENCY',
    'NON_PROFIT',
    'PARTNERSHIP',
    'PRIVATELY_HELD',
    'PUBLIC_COMPANY',
    'SELF_EMPLOYED',
    'SELF_OWNED'
  ])
  export type CompanyType = z.infer<typeof CompanyTypeSchema>

  export const OptionalFieldSchema = z.enum(['exclude', 'include']).optional()
  export type OptionalField = z.infer<typeof OptionalFieldSchema>

  export const OptionalEnrichFieldSchema = z.enum(['skip', 'enrich']).optional()
  export type OptionalEnrichField = z.infer<typeof OptionalEnrichFieldSchema>

  export const UseCacheSchema = z.enum(['if-present', 'if-recent']).optional()
  export type UseCache = z.infer<typeof UseCacheSchema>

  export const FallbackToCacheSchema = z.enum(['on-error', 'never']).optional()
  export type FallbackToCache = z.infer<typeof FallbackToCacheSchema>

  export const CompanyProfileEndpointParamsQueryClassSchema = z.object({
    url: z.string(),
    acquisitions: OptionalFieldSchema,
    categories: OptionalFieldSchema,
    exit_data: OptionalFieldSchema,
    extra: OptionalFieldSchema,
    funding_data: OptionalFieldSchema,
    resolve_numeric_id: z.boolean().optional(),
    fallback_to_cache: FallbackToCacheSchema,
    use_cache: UseCacheSchema
  })
  export type CompanyProfileEndpointParamsQueryClass = z.infer<
    typeof CompanyProfileEndpointParamsQueryClassSchema
  >

  /**
   * Requires one of:
   * - `facebook_profile_url`
   * - `linkedin_profile_url`
   * - `twitter_profile_url`
   */
  export const PersonProfileEndpointParamsQueryClassSchema = z.object({
    facebook_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    twitter_profile_url: z.string().optional(),
    facebook_profile_id: OptionalFieldSchema,
    twitter_profile_id: OptionalFieldSchema,
    extra: OptionalFieldSchema,
    github_profile_id: OptionalFieldSchema,
    inferred_salary: OptionalFieldSchema,
    personal_contact_number: OptionalFieldSchema,
    personal_email: OptionalFieldSchema,
    skills: OptionalFieldSchema,
    fallback_to_cache: FallbackToCacheSchema,
    use_cache: UseCacheSchema
  })
  export type PersonProfileEndpointParamsQueryClass = Simplify<
    z.infer<typeof PersonProfileEndpointParamsQueryClassSchema>
  >

  export const PersonLookupEndpointParamsQueryClassSchema = z.object({
    company_domain: z
      .string()
      .describe('The domain URL of the company the person works at'),
    first_name: z.string(),
    last_name: z.string().optional(),
    location: z.string().optional(),
    similarity_checks: z.string().optional(),
    title: z.string().optional(),
    enrich_profile: OptionalEnrichFieldSchema
  })
  export type PersonLookupEndpointParamsQueryClass = z.infer<
    typeof PersonLookupEndpointParamsQueryClassSchema
  >

  export const RoleLookupEndpointParamsQueryClassSchema = z.object({
    company_name: z.string(),
    role: z.string(),
    enrich_profile: OptionalEnrichFieldSchema
  })
  export type RoleLookupEndpointParamsQueryClass = z.infer<
    typeof RoleLookupEndpointParamsQueryClassSchema
  >

  export const CompanyLookupEndpointParamsQueryClassSchema = z.object({
    company_domain: z.string().optional(),
    company_location: z.string().optional(),
    company_name: z.string().optional(),
    enrich_profile: OptionalEnrichFieldSchema
  })
  export type CompanyLookupEndpointParamsQueryClass = z.infer<
    typeof CompanyLookupEndpointParamsQueryClassSchema
  >

  export const ReverseEmailLookupEndpointParamsQueryClassSchema = z.object({
    email: z.string(),
    enrich_profile: OptionalEnrichFieldSchema,
    lookup_depth: z.string().optional()
  })
  export type ReverseEmailLookupEndpointParamsQueryClass = z.infer<
    typeof ReverseEmailLookupEndpointParamsQueryClassSchema
  >

  export const CompanySearchEndpointParamsQueryClassSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional(),
    employee_count_max: z.string().optional(),
    employee_count_min: z.string().optional(),
    follower_count_max: z.string().optional(),
    follower_count_min: z.string().optional(),
    founded_after_year: z.string().optional(),
    founded_before_year: z.string().optional(),
    funding_amount_max: z.string().optional(),
    funding_amount_min: z.string().optional(),
    funding_raised_after: z.string().optional(),
    funding_raised_before: z.string().optional(),
    industry: z.string().optional(),
    name: z.string().optional(),
    page_size: z.string().optional(),
    public_identifier_in_list: z.string().optional(),
    public_identifier_not_in_list: z.string().optional(),
    region: z.string().optional(),
    type: z.string().optional(),
    enrich_profiles: z.string().optional()
  })
  export type CompanySearchEndpointParamsQueryClass = z.infer<
    typeof CompanySearchEndpointParamsQueryClassSchema
  >

  export const PersonSearchEndpointParamsQueryClassSchema = z.object({
    city: z.string().optional(),
    country: z.string(),
    current_company_city: z.string().optional(),
    current_company_country: z.string().optional(),
    current_company_description: z.string().optional(),
    current_company_employee_count_max: z.string().optional(),
    current_company_employee_count_min: z.string().optional(),
    current_company_follower_count_max: z.string().optional(),
    current_company_follower_count_min: z.string().optional(),
    current_company_founded_after_year: z.string().optional(),
    current_company_founded_before_year: z.string().optional(),
    current_company_funding_amount_max: z.string().optional(),
    current_company_funding_amount_min: z.string().optional(),
    current_company_funding_raised_after: z.string().optional(),
    current_company_funding_raised_before: z.string().optional(),
    current_company_industry: z.string().optional(),
    current_company_linkedin_profile_url: z.string().optional(),
    current_company_name: z.string().optional(),
    current_company_region: z.string().optional(),
    current_company_type: z.string().optional(),
    current_job_description: z.string().optional(),
    current_role_after: z.string().optional(),
    current_role_before: z.string().optional(),
    current_role_title: z.string().optional(),
    education_degree_name: z.string().optional(),
    education_field_of_study: z.string().optional(),
    education_school_linkedin_profile_url: z.string().optional(),
    education_school_name: z.string().optional(),
    enrich_profiles: z.string().optional(),
    first_name: z.string().optional(),
    headline: z.string().optional(),
    industries: z.string().optional(),
    interests: z.string().optional(),
    languages: z.string().optional(),
    last_name: z.string().optional(),
    linkedin_groups: z.string().optional(),
    page_size: z.string().optional(),
    past_company_linkedin_profile_url: z.string().optional(),
    past_company_name: z.string().optional(),
    past_job_description: z.string().optional(),
    past_role_title: z.string().optional(),
    public_identifier_in_list: z.string().optional(),
    public_identifier_not_in_list: z.string().optional(),
    region: z.string().optional(),
    skills: z.string().optional(),
    summary: z.string().optional()
  })
  export type PersonSearchEndpointParamsQueryClass = z.infer<
    typeof PersonSearchEndpointParamsQueryClassSchema
  >

  export const PurpleCourseSchema = z.object({
    name: z.string().optional(),
    number: z.string().optional()
  })
  export type PurpleCourse = z.infer<typeof PurpleCourseSchema>

  export const PurpleDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type PurpleDate = z.infer<typeof PurpleDateSchema>

  export const FluffyDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type FluffyDate = z.infer<typeof FluffyDateSchema>

  export const TentacledDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type TentacledDate = z.infer<typeof TentacledDateSchema>

  export const StickyDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type StickyDate = z.infer<typeof StickyDateSchema>

  export const IndigoDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type IndigoDate = z.infer<typeof IndigoDateSchema>

  export const IndecentDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type IndecentDate = z.infer<typeof IndecentDateSchema>

  export const HilariousDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type HilariousDate = z.infer<typeof HilariousDateSchema>

  export const AmbitiousDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type AmbitiousDate = z.infer<typeof AmbitiousDateSchema>

  export const PurpleActivitySchema = z.object({
    activity_status: z.string().optional(),
    link: z.string().optional(),
    title: z.string().optional()
  })
  export type PurpleActivity = z.infer<typeof PurpleActivitySchema>

  export const CunningDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type CunningDate = z.infer<typeof CunningDateSchema>

  export const MagentaDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type MagentaDate = z.infer<typeof MagentaDateSchema>

  export const FriskyDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type FriskyDate = z.infer<typeof FriskyDateSchema>

  export const MischievousDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type MischievousDate = z.infer<typeof MischievousDateSchema>

  export const BraggadociousDateSchema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type BraggadociousDate = z.infer<typeof BraggadociousDateSchema>

  export const Date1Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date1 = z.infer<typeof Date1Schema>

  export const Date2Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date2 = z.infer<typeof Date2Schema>

  export const Date3Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date3 = z.infer<typeof Date3Schema>

  export const PurplePersonExtraSchema = z.object({
    facebook_profile_id: z.string().optional(),
    github_profile_id: z.string().optional(),
    twitter_profile_id: z.string().optional(),
    website: z.string().optional()
  })
  export type PurplePersonExtra = z.infer<typeof PurplePersonExtraSchema>

  export const PurplePersonGroupSchema = z.object({
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    url: z.string().optional()
  })
  export type PurplePersonGroup = z.infer<typeof PurplePersonGroupSchema>

  export const PurpleInferredSalarySchema = z.object({
    max: z.number().optional(),
    min: z.number().optional()
  })
  export type PurpleInferredSalary = z.infer<typeof PurpleInferredSalarySchema>

  export const PurplePeopleAlsoViewedSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type PurplePeopleAlsoViewed = z.infer<
    typeof PurplePeopleAlsoViewedSchema
  >

  export const PurpleSimilarProfileSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type PurpleSimilarProfile = z.infer<typeof PurpleSimilarProfileSchema>

  export const Date4Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date4 = z.infer<typeof Date4Schema>

  export const Date5Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date5 = z.infer<typeof Date5Schema>

  export const FluffyCourseSchema = z.object({
    name: z.string().optional(),
    number: z.string().optional()
  })
  export type FluffyCourse = z.infer<typeof FluffyCourseSchema>

  export const Date6Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date6 = z.infer<typeof Date6Schema>

  export const Date7Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date7 = z.infer<typeof Date7Schema>

  export const Date8Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date8 = z.infer<typeof Date8Schema>

  export const Date9Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date9 = z.infer<typeof Date9Schema>

  export const Date10Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date10 = z.infer<typeof Date10Schema>

  export const Date11Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date11 = z.infer<typeof Date11Schema>

  export const Date12Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date12 = z.infer<typeof Date12Schema>

  export const Date13Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date13 = z.infer<typeof Date13Schema>

  export const FluffyActivitySchema = z.object({
    activity_status: z.string().optional(),
    link: z.string().optional(),
    title: z.string().optional()
  })
  export type FluffyActivity = z.infer<typeof FluffyActivitySchema>

  export const Date14Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date14 = z.infer<typeof Date14Schema>

  export const Date15Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date15 = z.infer<typeof Date15Schema>

  export const Date16Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date16 = z.infer<typeof Date16Schema>

  export const Date17Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date17 = z.infer<typeof Date17Schema>

  export const Date18Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date18 = z.infer<typeof Date18Schema>

  export const Date19Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date19 = z.infer<typeof Date19Schema>

  export const Date20Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date20 = z.infer<typeof Date20Schema>

  export const Date21Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date21 = z.infer<typeof Date21Schema>

  export const FluffyPersonExtraSchema = z.object({
    facebook_profile_id: z.string().optional(),
    github_profile_id: z.string().optional(),
    twitter_profile_id: z.string().optional(),
    website: z.string().optional()
  })
  export type FluffyPersonExtra = z.infer<typeof FluffyPersonExtraSchema>

  export const FluffyPersonGroupSchema = z.object({
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    url: z.string().optional()
  })
  export type FluffyPersonGroup = z.infer<typeof FluffyPersonGroupSchema>

  export const FluffyInferredSalarySchema = z.object({
    max: z.number().optional(),
    min: z.number().optional()
  })
  export type FluffyInferredSalary = z.infer<typeof FluffyInferredSalarySchema>

  export const FluffyPeopleAlsoViewedSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type FluffyPeopleAlsoViewed = z.infer<
    typeof FluffyPeopleAlsoViewedSchema
  >

  export const FluffySimilarProfileSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type FluffySimilarProfile = z.infer<typeof FluffySimilarProfileSchema>

  export const Date22Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date22 = z.infer<typeof Date22Schema>

  export const Date23Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date23 = z.infer<typeof Date23Schema>

  export const TentacledCourseSchema = z.object({
    name: z.string().optional(),
    number: z.string().optional()
  })
  export type TentacledCourse = z.infer<typeof TentacledCourseSchema>

  export const Date24Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date24 = z.infer<typeof Date24Schema>

  export const Date25Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date25 = z.infer<typeof Date25Schema>

  export const Date26Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date26 = z.infer<typeof Date26Schema>

  export const Date27Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date27 = z.infer<typeof Date27Schema>

  export const Date28Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date28 = z.infer<typeof Date28Schema>

  export const Date29Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date29 = z.infer<typeof Date29Schema>

  export const Date30Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date30 = z.infer<typeof Date30Schema>

  export const Date31Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date31 = z.infer<typeof Date31Schema>

  export const TentacledActivitySchema = z.object({
    activity_status: z.string().optional(),
    link: z.string().optional(),
    title: z.string().optional()
  })
  export type TentacledActivity = z.infer<typeof TentacledActivitySchema>

  export const Date32Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date32 = z.infer<typeof Date32Schema>

  export const Date33Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date33 = z.infer<typeof Date33Schema>

  export const Date34Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date34 = z.infer<typeof Date34Schema>

  export const Date35Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date35 = z.infer<typeof Date35Schema>

  export const Date36Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date36 = z.infer<typeof Date36Schema>

  export const Date37Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date37 = z.infer<typeof Date37Schema>

  export const Date38Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date38 = z.infer<typeof Date38Schema>

  export const Date39Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date39 = z.infer<typeof Date39Schema>

  export const TentacledPersonExtraSchema = z.object({
    facebook_profile_id: z.string().optional(),
    github_profile_id: z.string().optional(),
    twitter_profile_id: z.string().optional(),
    website: z.string().optional()
  })
  export type TentacledPersonExtra = z.infer<typeof TentacledPersonExtraSchema>

  export const TentacledPersonGroupSchema = z.object({
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    url: z.string().optional()
  })
  export type TentacledPersonGroup = z.infer<typeof TentacledPersonGroupSchema>

  export const TentacledInferredSalarySchema = z.object({
    max: z.number().optional(),
    min: z.number().optional()
  })
  export type TentacledInferredSalary = z.infer<
    typeof TentacledInferredSalarySchema
  >

  export const TentacledPeopleAlsoViewedSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type TentacledPeopleAlsoViewed = z.infer<
    typeof TentacledPeopleAlsoViewedSchema
  >

  export const TentacledSimilarProfileSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type TentacledSimilarProfile = z.infer<
    typeof TentacledSimilarProfileSchema
  >

  export const Date40Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date40 = z.infer<typeof Date40Schema>

  export const Date41Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date41 = z.infer<typeof Date41Schema>

  export const StickyCourseSchema = z.object({
    name: z.string().optional(),
    number: z.string().optional()
  })
  export type StickyCourse = z.infer<typeof StickyCourseSchema>

  export const Date42Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date42 = z.infer<typeof Date42Schema>

  export const Date43Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date43 = z.infer<typeof Date43Schema>

  export const Date44Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date44 = z.infer<typeof Date44Schema>

  export const Date45Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date45 = z.infer<typeof Date45Schema>

  export const Date46Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date46 = z.infer<typeof Date46Schema>

  export const Date47Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date47 = z.infer<typeof Date47Schema>

  export const Date48Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date48 = z.infer<typeof Date48Schema>

  export const Date49Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date49 = z.infer<typeof Date49Schema>

  export const StickyActivitySchema = z.object({
    activity_status: z.string().optional(),
    link: z.string().optional(),
    title: z.string().optional()
  })
  export type StickyActivity = z.infer<typeof StickyActivitySchema>

  export const Date50Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date50 = z.infer<typeof Date50Schema>

  export const Date51Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date51 = z.infer<typeof Date51Schema>

  export const Date52Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date52 = z.infer<typeof Date52Schema>

  export const Date53Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date53 = z.infer<typeof Date53Schema>

  export const Date54Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date54 = z.infer<typeof Date54Schema>

  export const Date55Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date55 = z.infer<typeof Date55Schema>

  export const Date56Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date56 = z.infer<typeof Date56Schema>

  export const StickyPersonGroupSchema = z.object({
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    url: z.string().optional()
  })
  export type StickyPersonGroup = z.infer<typeof StickyPersonGroupSchema>

  export const StickyPeopleAlsoViewedSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type StickyPeopleAlsoViewed = z.infer<
    typeof StickyPeopleAlsoViewedSchema
  >

  export const StickySimilarProfileSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type StickySimilarProfile = z.infer<typeof StickySimilarProfileSchema>

  export const Date57Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date57 = z.infer<typeof Date57Schema>

  export const Date58Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date58 = z.infer<typeof Date58Schema>

  export const Date59Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date59 = z.infer<typeof Date59Schema>

  export const Date60Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date60 = z.infer<typeof Date60Schema>

  export const PurpleAffiliatedCompanySchema = z.object({
    industry: z.string().optional(),
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional()
  })
  export type PurpleAffiliatedCompany = z.infer<
    typeof PurpleAffiliatedCompanySchema
  >

  export const PurpleExitSchema = z.object({
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    name: z.string().optional()
  })
  export type PurpleExit = z.infer<typeof PurpleExitSchema>

  export const Date61Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date61 = z.infer<typeof Date61Schema>

  export const Date62Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date62 = z.infer<typeof Date62Schema>

  export const Date63Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date63 = z.infer<typeof Date63Schema>

  export const PurpleInvestorSchema = z.object({
    linkedin_profile_url: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional()
  })
  export type PurpleInvestor = z.infer<typeof PurpleInvestorSchema>

  export const PurpleCompanyLocationSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    is_hq: z.boolean().optional(),
    line_1: z.string().optional(),
    postal_code: z.string().optional(),
    state: z.string().optional()
  })
  export type PurpleCompanyLocation = z.infer<
    typeof PurpleCompanyLocationSchema
  >

  export const FluffyCompanyLocationSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    is_hq: z.boolean().optional(),
    line_1: z.string().optional(),
    postal_code: z.string().optional(),
    state: z.string().optional()
  })
  export type FluffyCompanyLocation = z.infer<
    typeof FluffyCompanyLocationSchema
  >

  export const PurpleSimilarCompanySchema = z.object({
    industry: z.string().optional(),
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional()
  })
  export type PurpleSimilarCompany = z.infer<typeof PurpleSimilarCompanySchema>

  export const Date64Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date64 = z.infer<typeof Date64Schema>

  export const Date65Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date65 = z.infer<typeof Date65Schema>

  export const Date66Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date66 = z.infer<typeof Date66Schema>

  export const FluffyAffiliatedCompanySchema = z.object({
    industry: z.string().optional(),
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional()
  })
  export type FluffyAffiliatedCompany = z.infer<
    typeof FluffyAffiliatedCompanySchema
  >

  export const FluffyExitSchema = z.object({
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    name: z.string().optional()
  })
  export type FluffyExit = z.infer<typeof FluffyExitSchema>

  export const Date67Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date67 = z.infer<typeof Date67Schema>

  export const Date68Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date68 = z.infer<typeof Date68Schema>

  export const Date69Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date69 = z.infer<typeof Date69Schema>

  export const FluffyInvestorSchema = z.object({
    linkedin_profile_url: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional()
  })
  export type FluffyInvestor = z.infer<typeof FluffyInvestorSchema>

  export const TentacledCompanyLocationSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    is_hq: z.boolean().optional(),
    line_1: z.string().optional(),
    postal_code: z.string().optional(),
    state: z.string().optional()
  })
  export type TentacledCompanyLocation = z.infer<
    typeof TentacledCompanyLocationSchema
  >

  export const StickyCompanyLocationSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    is_hq: z.boolean().optional(),
    line_1: z.string().optional(),
    postal_code: z.string().optional(),
    state: z.string().optional()
  })
  export type StickyCompanyLocation = z.infer<
    typeof StickyCompanyLocationSchema
  >

  export const FluffySimilarCompanySchema = z.object({
    industry: z.string().optional(),
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional()
  })
  export type FluffySimilarCompany = z.infer<typeof FluffySimilarCompanySchema>

  export const Date70Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date70 = z.infer<typeof Date70Schema>

  export const PurpleHonourAwardSchema = z.object({
    description: z.string().optional(),
    issued_on: PurpleDateSchema.optional(),
    issuer: z.string().optional(),
    title: z.string().optional()
  })
  export type PurpleHonourAward = z.infer<typeof PurpleHonourAwardSchema>

  export const PurpleAccomplishmentOrgSchema = z.object({
    description: z.string().optional(),
    ends_at: FluffyDateSchema.optional(),
    org_name: z.string().optional(),
    starts_at: TentacledDateSchema.optional(),
    title: z.string().optional()
  })
  export type PurpleAccomplishmentOrg = z.infer<
    typeof PurpleAccomplishmentOrgSchema
  >

  export const PurplePatentSchema = z.object({
    application_number: z.string().optional(),
    description: z.string().optional(),
    issued_on: StickyDateSchema.optional(),
    issuer: z.string().optional(),
    patent_number: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type PurplePatent = z.infer<typeof PurplePatentSchema>

  export const PurpleProjectSchema = z.object({
    description: z.string().optional(),
    ends_at: IndigoDateSchema.optional(),
    starts_at: IndecentDateSchema.optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type PurpleProject = z.infer<typeof PurpleProjectSchema>

  export const PurplePublicationSchema = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    published_on: HilariousDateSchema.optional(),
    publisher: z.string().optional(),
    url: z.string().optional()
  })
  export type PurplePublication = z.infer<typeof PurplePublicationSchema>

  export const PurpleTestScoreSchema = z.object({
    date_on: AmbitiousDateSchema.optional(),
    description: z.string().optional(),
    name: z.string().optional(),
    score: z.string().optional()
  })
  export type PurpleTestScore = z.infer<typeof PurpleTestScoreSchema>

  export const PurpleArticleSchema = z.object({
    author: z.string().optional(),
    image_url: z.string().optional(),
    link: z.string().optional(),
    published_date: CunningDateSchema.optional(),
    title: z.string().optional()
  })
  export type PurpleArticle = z.infer<typeof PurpleArticleSchema>

  export const PurpleCertificationSchema = z.object({
    authority: z.string().optional(),
    display_source: z.string().optional(),
    ends_at: FriskyDateSchema.optional(),
    license_number: z.string().optional(),
    name: z.string().optional(),
    starts_at: MischievousDateSchema.optional(),
    url: z.string().optional()
  })
  export type PurpleCertification = z.infer<typeof PurpleCertificationSchema>

  export const PurpleEducationSchema = z.object({
    activities_and_societies: z.string().optional(),
    degree_name: z.string().optional(),
    description: z.string().optional(),
    ends_at: BraggadociousDateSchema.optional(),
    field_of_study: z.string().optional(),
    grade: z.string().optional(),
    logo_url: z.string().optional(),
    school: z.string().optional(),
    school_facebook_profile_url: z.string().optional(),
    school_linkedin_profile_url: z.string().optional(),
    starts_at: Date1Schema.optional()
  })
  export type PurpleEducation = z.infer<typeof PurpleEducationSchema>

  export const PurpleExperienceSchema = z.object({
    company: z.string().optional(),
    company_facebook_profile_url: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date2Schema.optional(),
    location: z.string().optional(),
    logo_url: z.string().optional(),
    starts_at: Date3Schema.optional(),
    title: z.string().optional()
  })
  export type PurpleExperience = z.infer<typeof PurpleExperienceSchema>

  export const PurpleVolunteeringExperienceSchema = z.object({
    cause: z.string().optional(),
    company: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date4Schema.optional(),
    logo_url: z.string().optional(),
    starts_at: Date5Schema.optional(),
    title: z.string().optional()
  })
  export type PurpleVolunteeringExperience = z.infer<
    typeof PurpleVolunteeringExperienceSchema
  >

  export const FluffyHonourAwardSchema = z.object({
    description: z.string().optional(),
    issued_on: Date6Schema.optional(),
    issuer: z.string().optional(),
    title: z.string().optional()
  })
  export type FluffyHonourAward = z.infer<typeof FluffyHonourAwardSchema>

  export const FluffyAccomplishmentOrgSchema = z.object({
    description: z.string().optional(),
    ends_at: Date7Schema.optional(),
    org_name: z.string().optional(),
    starts_at: Date8Schema.optional(),
    title: z.string().optional()
  })
  export type FluffyAccomplishmentOrg = z.infer<
    typeof FluffyAccomplishmentOrgSchema
  >

  export const FluffyPatentSchema = z.object({
    application_number: z.string().optional(),
    description: z.string().optional(),
    issued_on: Date9Schema.optional(),
    issuer: z.string().optional(),
    patent_number: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type FluffyPatent = z.infer<typeof FluffyPatentSchema>

  export const FluffyProjectSchema = z.object({
    description: z.string().optional(),
    ends_at: Date10Schema.optional(),
    starts_at: Date11Schema.optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type FluffyProject = z.infer<typeof FluffyProjectSchema>

  export const FluffyPublicationSchema = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    published_on: Date12Schema.optional(),
    publisher: z.string().optional(),
    url: z.string().optional()
  })
  export type FluffyPublication = z.infer<typeof FluffyPublicationSchema>

  export const FluffyTestScoreSchema = z.object({
    date_on: Date13Schema.optional(),
    description: z.string().optional(),
    name: z.string().optional(),
    score: z.string().optional()
  })
  export type FluffyTestScore = z.infer<typeof FluffyTestScoreSchema>

  export const FluffyArticleSchema = z.object({
    author: z.string().optional(),
    image_url: z.string().optional(),
    link: z.string().optional(),
    published_date: Date14Schema.optional(),
    title: z.string().optional()
  })
  export type FluffyArticle = z.infer<typeof FluffyArticleSchema>

  export const FluffyCertificationSchema = z.object({
    authority: z.string().optional(),
    display_source: z.string().optional(),
    ends_at: Date16Schema.optional(),
    license_number: z.string().optional(),
    name: z.string().optional(),
    starts_at: Date17Schema.optional(),
    url: z.string().optional()
  })
  export type FluffyCertification = z.infer<typeof FluffyCertificationSchema>

  export const FluffyEducationSchema = z.object({
    activities_and_societies: z.string().optional(),
    degree_name: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date18Schema.optional(),
    field_of_study: z.string().optional(),
    grade: z.string().optional(),
    logo_url: z.string().optional(),
    school: z.string().optional(),
    school_facebook_profile_url: z.string().optional(),
    school_linkedin_profile_url: z.string().optional(),
    starts_at: Date19Schema.optional()
  })
  export type FluffyEducation = z.infer<typeof FluffyEducationSchema>

  export const FluffyExperienceSchema = z.object({
    company: z.string().optional(),
    company_facebook_profile_url: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date20Schema.optional(),
    location: z.string().optional(),
    logo_url: z.string().optional(),
    starts_at: Date21Schema.optional(),
    title: z.string().optional()
  })
  export type FluffyExperience = z.infer<typeof FluffyExperienceSchema>

  export const FluffyVolunteeringExperienceSchema = z.object({
    cause: z.string().optional(),
    company: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date22Schema.optional(),
    logo_url: z.string().optional(),
    starts_at: Date23Schema.optional(),
    title: z.string().optional()
  })
  export type FluffyVolunteeringExperience = z.infer<
    typeof FluffyVolunteeringExperienceSchema
  >

  export const TentacledHonourAwardSchema = z.object({
    description: z.string().optional(),
    issued_on: Date24Schema.optional(),
    issuer: z.string().optional(),
    title: z.string().optional()
  })
  export type TentacledHonourAward = z.infer<typeof TentacledHonourAwardSchema>

  export const TentacledAccomplishmentOrgSchema = z.object({
    description: z.string().optional(),
    ends_at: Date25Schema.optional(),
    org_name: z.string().optional(),
    starts_at: Date26Schema.optional(),
    title: z.string().optional()
  })
  export type TentacledAccomplishmentOrg = z.infer<
    typeof TentacledAccomplishmentOrgSchema
  >

  export const TentacledPatentSchema = z.object({
    application_number: z.string().optional(),
    description: z.string().optional(),
    issued_on: Date27Schema.optional(),
    issuer: z.string().optional(),
    patent_number: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type TentacledPatent = z.infer<typeof TentacledPatentSchema>

  export const TentacledProjectSchema = z.object({
    description: z.string().optional(),
    ends_at: Date28Schema.optional(),
    starts_at: Date29Schema.optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type TentacledProject = z.infer<typeof TentacledProjectSchema>

  export const TentacledPublicationSchema = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    published_on: Date30Schema.optional(),
    publisher: z.string().optional(),
    url: z.string().optional()
  })
  export type TentacledPublication = z.infer<typeof TentacledPublicationSchema>

  export const TentacledTestScoreSchema = z.object({
    date_on: Date31Schema.optional(),
    description: z.string().optional(),
    name: z.string().optional(),
    score: z.string().optional()
  })
  export type TentacledTestScore = z.infer<typeof TentacledTestScoreSchema>

  export const TentacledArticleSchema = z.object({
    author: z.string().optional(),
    image_url: z.string().optional(),
    link: z.string().optional(),
    published_date: Date32Schema.optional(),
    title: z.string().optional()
  })
  export type TentacledArticle = z.infer<typeof TentacledArticleSchema>

  export const TentacledCertificationSchema = z.object({
    authority: z.string().optional(),
    display_source: z.string().optional(),
    ends_at: Date34Schema.optional(),
    license_number: z.string().optional(),
    name: z.string().optional(),
    starts_at: Date35Schema.optional(),
    url: z.string().optional()
  })
  export type TentacledCertification = z.infer<
    typeof TentacledCertificationSchema
  >

  export const TentacledEducationSchema = z.object({
    activities_and_societies: z.string().optional(),
    degree_name: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date36Schema.optional(),
    field_of_study: z.string().optional(),
    grade: z.string().optional(),
    logo_url: z.string().optional(),
    school: z.string().optional(),
    school_facebook_profile_url: z.string().optional(),
    school_linkedin_profile_url: z.string().optional(),
    starts_at: Date37Schema.optional()
  })
  export type TentacledEducation = z.infer<typeof TentacledEducationSchema>

  export const TentacledExperienceSchema = z.object({
    company: z.string().optional(),
    company_facebook_profile_url: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date38Schema.optional(),
    location: z.string().optional(),
    logo_url: z.string().optional(),
    starts_at: Date39Schema.optional(),
    title: z.string().optional()
  })
  export type TentacledExperience = z.infer<typeof TentacledExperienceSchema>

  export const TentacledVolunteeringExperienceSchema = z.object({
    cause: z.string().optional(),
    company: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date40Schema.optional(),
    logo_url: z.string().optional(),
    starts_at: Date41Schema.optional(),
    title: z.string().optional()
  })
  export type TentacledVolunteeringExperience = z.infer<
    typeof TentacledVolunteeringExperienceSchema
  >

  export const StickyHonourAwardSchema = z.object({
    description: z.string().optional(),
    issued_on: Date42Schema.optional(),
    issuer: z.string().optional(),
    title: z.string().optional()
  })
  export type StickyHonourAward = z.infer<typeof StickyHonourAwardSchema>

  export const StickyAccomplishmentOrgSchema = z.object({
    description: z.string().optional(),
    ends_at: Date43Schema.optional(),
    org_name: z.string().optional(),
    starts_at: Date44Schema.optional(),
    title: z.string().optional()
  })
  export type StickyAccomplishmentOrg = z.infer<
    typeof StickyAccomplishmentOrgSchema
  >

  export const StickyPatentSchema = z.object({
    application_number: z.string().optional(),
    description: z.string().optional(),
    issued_on: Date45Schema.optional(),
    issuer: z.string().optional(),
    patent_number: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type StickyPatent = z.infer<typeof StickyPatentSchema>

  export const StickyProjectSchema = z.object({
    description: z.string().optional(),
    ends_at: Date46Schema.optional(),
    starts_at: Date47Schema.optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type StickyProject = z.infer<typeof StickyProjectSchema>

  export const StickyPublicationSchema = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    published_on: Date48Schema.optional(),
    publisher: z.string().optional(),
    url: z.string().optional()
  })
  export type StickyPublication = z.infer<typeof StickyPublicationSchema>

  export const StickyTestScoreSchema = z.object({
    date_on: Date49Schema.optional(),
    description: z.string().optional(),
    name: z.string().optional(),
    score: z.string().optional()
  })
  export type StickyTestScore = z.infer<typeof StickyTestScoreSchema>

  export const StickyArticleSchema = z.object({
    author: z.string().optional(),
    image_url: z.string().optional(),
    link: z.string().optional(),
    published_date: Date50Schema.optional(),
    title: z.string().optional()
  })
  export type StickyArticle = z.infer<typeof StickyArticleSchema>

  export const StickyCertificationSchema = z.object({
    authority: z.string().optional(),
    display_source: z.string().optional(),
    ends_at: Date51Schema.optional(),
    license_number: z.string().optional(),
    name: z.string().optional(),
    starts_at: Date52Schema.optional(),
    url: z.string().optional()
  })
  export type StickyCertification = z.infer<typeof StickyCertificationSchema>

  export const StickyEducationSchema = z.object({
    activities_and_societies: z.string().optional(),
    degree_name: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date53Schema.optional(),
    field_of_study: z.string().optional(),
    grade: z.string().optional(),
    logo_url: z.string().optional(),
    school: z.string().optional(),
    school_facebook_profile_url: z.string().optional(),
    school_linkedin_profile_url: z.string().optional(),
    starts_at: Date54Schema.optional()
  })
  export type StickyEducation = z.infer<typeof StickyEducationSchema>

  export const StickyExperienceSchema = z.object({
    company: z.string().optional(),
    company_facebook_profile_url: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date55Schema.optional(),
    location: z.string().optional(),
    logo_url: z.string().optional(),
    starts_at: Date56Schema.optional(),
    title: z.string().optional()
  })
  export type StickyExperience = z.infer<typeof StickyExperienceSchema>

  export const StickyVolunteeringExperienceSchema = z.object({
    cause: z.string().optional(),
    company: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date57Schema.optional(),
    logo_url: z.string().optional(),
    starts_at: Date58Schema.optional(),
    title: z.string().optional()
  })
  export type StickyVolunteeringExperience = z.infer<
    typeof StickyVolunteeringExperienceSchema
  >

  export const PurpleAcquiredCompanySchema = z.object({
    announced_date: Date59Schema.optional(),
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    price: z.number().optional()
  })
  export type PurpleAcquiredCompany = z.infer<
    typeof PurpleAcquiredCompanySchema
  >

  export const PurpleAcquisitorSchema = z.object({
    announced_date: Date60Schema.optional(),
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    price: z.number().optional()
  })
  export type PurpleAcquisitor = z.infer<typeof PurpleAcquisitorSchema>

  export const PurpleCompanyDetailsSchema = z.object({
    company_type: z.string().optional(),
    contact_email: z.string().optional(),
    crunchbase_profile_url: z.string().optional(),
    crunchbase_rank: z.number().optional(),
    facebook_id: z.string().optional(),
    founding_date: Date61Schema.optional(),
    ipo_date: Date62Schema.optional(),
    ipo_status: z.string().optional(),
    number_of_acquisitions: z.number().optional(),
    number_of_exits: z.number().optional(),
    number_of_funding_rounds: z.number().optional(),
    number_of_investments: z.number().optional(),
    number_of_investors: z.number().optional(),
    number_of_lead_investments: z.number().optional(),
    number_of_lead_investors: z.number().optional(),
    operating_status: z.string().optional(),
    phone_number: z.string().optional(),
    stock_symbol: z.string().optional(),
    total_fund_raised: z.number().optional(),
    total_funding_amount: z.number().optional(),
    twitter_id: z.string().optional()
  })
  export type PurpleCompanyDetails = z.infer<typeof PurpleCompanyDetailsSchema>

  export const PurpleFundingSchema = z.object({
    announced_date: Date63Schema.optional(),
    funding_type: z.string().optional(),
    investor_list: z.array(PurpleInvestorSchema).optional(),
    money_raised: z.number().optional(),
    number_of_investor: z.number().optional()
  })
  export type PurpleFunding = z.infer<typeof PurpleFundingSchema>

  export const PurpleCompanyUpdateSchema = z.object({
    article_link: z.string().optional(),
    image: z.string().optional(),
    posted_on: Date64Schema.optional(),
    text: z.string().optional(),
    total_likes: z.number().optional()
  })
  export type PurpleCompanyUpdate = z.infer<typeof PurpleCompanyUpdateSchema>

  export const FluffyAcquiredCompanySchema = z.object({
    announced_date: Date65Schema.optional(),
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    price: z.number().optional()
  })
  export type FluffyAcquiredCompany = z.infer<
    typeof FluffyAcquiredCompanySchema
  >

  export const FluffyAcquisitorSchema = z.object({
    announced_date: Date66Schema.optional(),
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    price: z.number().optional()
  })
  export type FluffyAcquisitor = z.infer<typeof FluffyAcquisitorSchema>

  export const FluffyCompanyDetailsSchema = z.object({
    company_type: z.string().optional(),
    contact_email: z.string().optional(),
    crunchbase_profile_url: z.string().optional(),
    crunchbase_rank: z.number().optional(),
    facebook_id: z.string().optional(),
    founding_date: Date67Schema.optional(),
    ipo_date: Date68Schema.optional(),
    ipo_status: z.string().optional(),
    number_of_acquisitions: z.number().optional(),
    number_of_exits: z.number().optional(),
    number_of_funding_rounds: z.number().optional(),
    number_of_investments: z.number().optional(),
    number_of_investors: z.number().optional(),
    number_of_lead_investments: z.number().optional(),
    number_of_lead_investors: z.number().optional(),
    operating_status: z.string().optional(),
    phone_number: z.string().optional(),
    stock_symbol: z.string().optional(),
    total_fund_raised: z.number().optional(),
    total_funding_amount: z.number().optional(),
    twitter_id: z.string().optional()
  })
  export type FluffyCompanyDetails = z.infer<typeof FluffyCompanyDetailsSchema>

  export const FluffyFundingSchema = z.object({
    announced_date: Date69Schema.optional(),
    funding_type: z.string().optional(),
    investor_list: z.array(FluffyInvestorSchema).optional(),
    money_raised: z.number().optional(),
    number_of_investor: z.number().optional()
  })
  export type FluffyFunding = z.infer<typeof FluffyFundingSchema>

  export const FluffyCompanyUpdateSchema = z.object({
    article_link: z.string().optional(),
    image: z.string().optional(),
    posted_on: Date70Schema.optional(),
    text: z.string().optional(),
    total_likes: z.number().optional()
  })
  export type FluffyCompanyUpdate = z.infer<typeof FluffyCompanyUpdateSchema>

  export const PersonLookupUrlEnrichResultProfileSchema = z.object({
    accomplishment_courses: z.array(PurpleCourseSchema).optional(),
    accomplishment_honors_awards: z.array(PurpleHonourAwardSchema).optional(),
    accomplishment_organisations: z
      .array(PurpleAccomplishmentOrgSchema)
      .optional(),
    accomplishment_patents: z.array(PurplePatentSchema).optional(),
    accomplishment_projects: z.array(PurpleProjectSchema).optional(),
    accomplishment_publications: z.array(PurplePublicationSchema).optional(),
    accomplishment_test_scores: z.array(PurpleTestScoreSchema).optional(),
    activities: z.array(PurpleActivitySchema).optional(),
    articles: z.array(PurpleArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    birth_date: MagentaDateSchema.optional(),
    certifications: z.array(PurpleCertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(PurpleEducationSchema).optional(),
    experiences: z.array(PurpleExperienceSchema).optional(),
    extra: PurplePersonExtraSchema.optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    groups: z.array(PurplePersonGroupSchema).optional(),
    headline: z.string().optional(),
    industry: z.string().optional(),
    inferred_salary: PurpleInferredSalarySchema.optional(),
    interests: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(PurplePeopleAlsoViewedSchema).optional(),
    personal_emails: z.array(z.string()).optional(),
    personal_numbers: z.array(z.string()).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(PurpleSimilarProfileSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(PurpleVolunteeringExperienceSchema).optional()
  })
  export type PersonLookupUrlEnrichResultProfile = z.infer<
    typeof PersonLookupUrlEnrichResultProfileSchema
  >

  export const RoleSearchEnrichedResultProfileSchema = z.object({
    accomplishment_courses: z.array(FluffyCourseSchema).optional(),
    accomplishment_honors_awards: z.array(FluffyHonourAwardSchema).optional(),
    accomplishment_organisations: z
      .array(FluffyAccomplishmentOrgSchema)
      .optional(),
    accomplishment_patents: z.array(FluffyPatentSchema).optional(),
    accomplishment_projects: z.array(FluffyProjectSchema).optional(),
    accomplishment_publications: z.array(FluffyPublicationSchema).optional(),
    accomplishment_test_scores: z.array(FluffyTestScoreSchema).optional(),
    activities: z.array(FluffyActivitySchema).optional(),
    articles: z.array(FluffyArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    birth_date: Date15Schema.optional(),
    certifications: z.array(FluffyCertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(FluffyEducationSchema).optional(),
    experiences: z.array(FluffyExperienceSchema).optional(),
    extra: FluffyPersonExtraSchema.optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    groups: z.array(FluffyPersonGroupSchema).optional(),
    headline: z.string().optional(),
    industry: z.string().optional(),
    inferred_salary: FluffyInferredSalarySchema.optional(),
    interests: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(FluffyPeopleAlsoViewedSchema).optional(),
    personal_emails: z.array(z.string()).optional(),
    personal_numbers: z.array(z.string()).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(FluffySimilarProfileSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(FluffyVolunteeringExperienceSchema).optional()
  })
  export type RoleSearchEnrichedResultProfile = z.infer<
    typeof RoleSearchEnrichedResultProfileSchema
  >

  export const ReverseEmailUrlEnrichResultProfileSchema = z.object({
    accomplishment_courses: z.array(TentacledCourseSchema).optional(),
    accomplishment_honors_awards: z
      .array(TentacledHonourAwardSchema)
      .optional(),
    accomplishment_organisations: z
      .array(TentacledAccomplishmentOrgSchema)
      .optional(),
    accomplishment_patents: z.array(TentacledPatentSchema).optional(),
    accomplishment_projects: z.array(TentacledProjectSchema).optional(),
    accomplishment_publications: z.array(TentacledPublicationSchema).optional(),
    accomplishment_test_scores: z.array(TentacledTestScoreSchema).optional(),
    activities: z.array(TentacledActivitySchema).optional(),
    articles: z.array(TentacledArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    birth_date: Date33Schema.optional(),
    certifications: z.array(TentacledCertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(TentacledEducationSchema).optional(),
    experiences: z.array(TentacledExperienceSchema).optional(),
    extra: TentacledPersonExtraSchema.optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    groups: z.array(TentacledPersonGroupSchema).optional(),
    headline: z.string().optional(),
    industry: z.string().optional(),
    inferred_salary: TentacledInferredSalarySchema.optional(),
    interests: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(TentacledPeopleAlsoViewedSchema).optional(),
    personal_emails: z.array(z.string()).optional(),
    personal_numbers: z.array(z.string()).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(TentacledSimilarProfileSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(TentacledVolunteeringExperienceSchema).optional()
  })
  export type ReverseEmailUrlEnrichResultProfile = z.infer<
    typeof ReverseEmailUrlEnrichResultProfileSchema
  >

  export const PersonProfileSchema = z.object({
    accomplishment_courses: z.array(StickyCourseSchema).optional(),
    accomplishment_honors_awards: z.array(StickyHonourAwardSchema).optional(),
    accomplishment_organisations: z
      .array(StickyAccomplishmentOrgSchema)
      .optional(),
    accomplishment_patents: z.array(StickyPatentSchema).optional(),
    accomplishment_projects: z.array(StickyProjectSchema).optional(),
    accomplishment_publications: z.array(StickyPublicationSchema).optional(),
    accomplishment_test_scores: z.array(StickyTestScoreSchema).optional(),
    activities: z.array(StickyActivitySchema).optional(),
    articles: z.array(StickyArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    certifications: z.array(StickyCertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(StickyEducationSchema).optional(),
    experiences: z.array(StickyExperienceSchema).optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    groups: z.array(StickyPersonGroupSchema).optional(),
    headline: z.string().optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(StickyPeopleAlsoViewedSchema).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(StickySimilarProfileSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(StickyVolunteeringExperienceSchema).optional()
  })
  export type PersonProfile = z.infer<typeof PersonProfileSchema>

  export type ResolvedPersonProfile = {
    profile?: PersonProfile
    url?: string
    name_similarity_score?: number
    company_similarity_score?: number
    title_similarity_score?: number
    location_similarity_score?: number
    last_updated?: string
  }

  export const PurpleAcquisitionSchema = z.object({
    acquired: z.array(PurpleAcquiredCompanySchema).optional(),
    acquired_by: PurpleAcquisitorSchema.optional()
  })
  export type PurpleAcquisition = z.infer<typeof PurpleAcquisitionSchema>

  export const FluffyAcquisitionSchema = z.object({
    acquired: z.array(FluffyAcquiredCompanySchema).optional(),
    acquired_by: FluffyAcquisitorSchema.optional()
  })
  export type FluffyAcquisition = z.infer<typeof FluffyAcquisitionSchema>

  export const PersonLookupUrlEnrichResultSchema = z.object({
    company_similarity_score: z.number().optional(),
    last_updated: z.string().optional(),
    location_similarity_score: z.number().optional(),
    name_similarity_score: z.number().optional(),
    profile: PersonLookupUrlEnrichResultProfileSchema.optional(),
    title_similarity_score: z.number().optional(),
    url: z.string().optional()
  })
  export type PersonLookupUrlEnrichResult = z.infer<
    typeof PersonLookupUrlEnrichResultSchema
  >

  export const RoleSearchEnrichedResultSchema = z.object({
    last_updated: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    profile: RoleSearchEnrichedResultProfileSchema.optional()
  })
  export type RoleSearchEnrichedResult = z.infer<
    typeof RoleSearchEnrichedResultSchema
  >

  export const ReverseEmailUrlEnrichResultSchema = z.object({
    backwards_compatibility_notes: z.string().optional(),
    facebook_profile_url: z.string().optional(),
    last_updated: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    profile: ReverseEmailUrlEnrichResultProfileSchema.optional(),
    similarity_score: z.number().optional(),
    twitter_profile_url: z.string().optional(),
    url: z.string().optional()
  })
  export type ReverseEmailUrlEnrichResult = z.infer<
    typeof ReverseEmailUrlEnrichResultSchema
  >

  export const SearchResultSchema = z.object({
    last_updated: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    profile: PersonProfileSchema.optional()
  })
  export type SearchResult = z.infer<typeof SearchResultSchema>

  export const ResultProfileSchema = z.object({
    linkedin_url: z.string().optional(),
    acquisitions: PurpleAcquisitionSchema.optional(),
    affiliated_companies: z.array(PurpleAffiliatedCompanySchema).optional(),
    background_cover_image_url: z.string().optional(),
    categories: z.array(z.string()).optional(),
    company_size: z.array(z.number()).optional(),
    company_size_on_linkedin: z.number().optional(),
    company_type: CompanyTypeSchema.optional(),
    customer_list: z.array(z.string()).optional(),
    description: z.string().optional(),
    exit_data: z.array(PurpleExitSchema).optional(),
    extra: PurpleCompanyDetailsSchema.optional(),
    follower_count: z.number().optional(),
    founded_year: z.number().optional(),
    funding_data: z.array(PurpleFundingSchema).optional(),
    hq: PurpleCompanyLocationSchema.optional(),
    industry: z.string().optional(),
    linkedin_internal_id: z.string().optional(),
    locations: z.array(FluffyCompanyLocationSchema).optional(),
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    search_id: z.string().optional(),
    similar_companies: z.array(PurpleSimilarCompanySchema).optional(),
    specialities: z.array(z.string()).optional(),
    tagline: z.string().optional(),
    universal_name_id: z.string().optional(),
    updates: z.array(PurpleCompanyUpdateSchema).optional(),
    website: z.string().optional()
  })
  export type CompanyProfile = z.infer<typeof ResultProfileSchema>
  export type ResolvedCompanyProfile = {
    url: string
    last_updated: string
    profile: CompanyProfile
  }

  export const CompanyUrlEnrichResultProfileSchema = z.object({
    acquisitions: FluffyAcquisitionSchema.optional(),
    affiliated_companies: z.array(FluffyAffiliatedCompanySchema).optional(),
    background_cover_image_url: z.string().optional(),
    categories: z.array(z.string()).optional(),
    company_size: z.array(z.number()).optional(),
    company_size_on_linkedin: z.number().optional(),
    company_type: CompanyTypeSchema.optional(),
    customer_list: z.array(z.string()).optional(),
    description: z.string().optional(),
    exit_data: z.array(FluffyExitSchema).optional(),
    extra: FluffyCompanyDetailsSchema.optional(),
    follower_count: z.number().optional(),
    founded_year: z.number().optional(),
    funding_data: z.array(FluffyFundingSchema).optional(),
    hq: TentacledCompanyLocationSchema.optional(),
    industry: z.string().optional(),
    linkedin_internal_id: z.string().optional(),
    locations: z.array(StickyCompanyLocationSchema).optional(),
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    search_id: z.string().optional(),
    similar_companies: z.array(FluffySimilarCompanySchema).optional(),
    specialities: z.array(z.string()).optional(),
    tagline: z.string().optional(),
    universal_name_id: z.string().optional(),
    updates: z.array(FluffyCompanyUpdateSchema).optional(),
    website: z.string().optional()
  })
  export type CompanyUrlEnrichResultProfile = z.infer<
    typeof CompanyUrlEnrichResultProfileSchema
  >

  export const PersonSearchResultSchema = z.object({
    next_page: z.string().optional(),
    results: z.array(SearchResultSchema).optional(),
    total_result_count: z.number().optional()
  })
  export type PersonSearchResult = z.infer<typeof PersonSearchResultSchema>

  export const CSearchResultSchema = z.object({
    last_updated: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    profile: ResultProfileSchema.optional()
  })
  export type CSearchResult = z.infer<typeof CSearchResultSchema>

  export const CompanyUrlEnrichResultSchema = z.object({
    last_updated: z.string().optional(),
    profile: CompanyUrlEnrichResultProfileSchema.optional(),
    url: z.string().optional()
  })
  export type CompanyUrlEnrichResult = z.infer<
    typeof CompanyUrlEnrichResultSchema
  >

  export const CompanySearchResultSchema = z.object({
    next_page: z.string().optional(),
    results: z.array(CSearchResultSchema).optional(),
    total_result_count: z.number().optional()
  })
  export type CompanySearchResult = z.infer<typeof CompanySearchResultSchema>
}

/**
 * Pull rich data about people and companies.
 *
 * Essentially a wrapper around LinkedIn & Crunchbase.
 *
 * @see https://nubela.co/proxycurl/
 */
export class ProxycurlClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('PROXYCURL_API_KEY'),
    apiBaseUrl = getEnv('PROXYCURL_API_BASE_URL') ??
      'https://nubela.co/proxycurl',
    throttle = true,
    timeoutMs = 30_000,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    throttle?: boolean
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'ProxycurlClient missing required "apiKey" (defaults to "PROXYCURL_API_KEY")'
    )
    assert(
      apiBaseUrl,
      'ProxycurlClient missing required "apiBaseUrl" (defaults to "PROXYCURL_API_BASE_URL")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    const throttledKy = throttle ? throttleKy(ky, proxycurl.throttle) : ky

    this.ky = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  @aiFunction({
    name: 'get_linkedin_company',
    description:
      "Gets the LinkedIn profile for a company given it's domain `url`.",
    inputSchema: proxycurl.CompanyProfileEndpointParamsQueryClassSchema
  })
  async getLinkedInCompany(
    opts: proxycurl.CompanyProfileEndpointParamsQueryClass
  ): Promise<proxycurl.CompanyProfile> {
    const res = await this.ky
      .get('api/linkedin/company', {
        searchParams: sanitizeSearchParams({
          funding_data: 'include',
          exit_data: 'include',
          extra_data: 'include',
          ...opts
        })
      })
      .json<proxycurl.CompanyProfile>()

    return {
      linkedin_url: opts.url,
      ...res
    }
  }

  @aiFunction({
    name: 'get_linkedin_person',
    description:
      'Gets the LinkedIn profile for a person given some unique, identifying information about them.',
    inputSchema: proxycurl.PersonProfileEndpointParamsQueryClassSchema
  })
  async getLinkedInPerson(
    opts: proxycurl.PersonProfileEndpointParamsQueryClass
  ): Promise<proxycurl.PersonProfile> {
    return this.ky
      .get('api/v2/linkedin', {
        searchParams: sanitizeSearchParams(opts)
      })
      .json<proxycurl.PersonProfile>()
  }

  @aiFunction({
    name: 'resolve_linkedin_person',
    description:
      'Resolves the LinkedIn profile for a person given their `first_name` and `company_domain` URL.',
    inputSchema: proxycurl.PersonLookupEndpointParamsQueryClassSchema
  })
  async resolveLinkedInPerson(
    opts: proxycurl.PersonLookupEndpointParamsQueryClass
  ): Promise<proxycurl.ResolvedPersonProfile> {
    return this.ky
      .get('api/linkedin/profile/resolve', {
        searchParams: sanitizeSearchParams({
          similarity_checks: 'include',
          enrich_profile: 'enrich',
          ...opts
        })
      })
      .json<proxycurl.ResolvedPersonProfile>()
  }

  @aiFunction({
    name: 'resolve_linkedin_person_by_email',
    description:
      'Resolves the LinkedIn profile for a person given their `email`.',
    inputSchema: proxycurl.ReverseEmailLookupEndpointParamsQueryClassSchema
  })
  async resolveLinkedInPersonByEmail(
    opts: proxycurl.ReverseEmailLookupEndpointParamsQueryClass
  ) {
    return this.ky
      .get('api/linkedin/profile/resolve/email', {
        searchParams: sanitizeSearchParams({
          enrich_profile: 'enrich',
          ...opts
        })
      })
      .json<proxycurl.ReverseEmailUrlEnrichResult>()
  }

  @aiFunction({
    name: 'resolve_linkedin_person_at_company_by_role',
    description:
      'Resolves the LinkedIn profile for a person at a given `company_name` and `role`.',
    inputSchema: proxycurl.RoleLookupEndpointParamsQueryClassSchema
  })
  async resolveLinkedInPersonAtCompanyByRole(
    opts: proxycurl.RoleLookupEndpointParamsQueryClass
  ): Promise<proxycurl.ResolvedPersonProfile> {
    return this.ky
      .get('api/find/company/role/', {
        searchParams: sanitizeSearchParams({
          enrich_profile: 'enrich',
          ...opts
        })
      })
      .json<proxycurl.ResolvedPersonProfile>()
  }

  @aiFunction({
    name: 'resolve_linkedin_company',
    description:
      'Resolves the LinkedIn profile for a company given the `company_name` and/or `company_domain`.',
    inputSchema: proxycurl.CompanyLookupEndpointParamsQueryClassSchema
  })
  async resolveLinkedInCompany(
    opts: proxycurl.CompanyLookupEndpointParamsQueryClass
  ): Promise<proxycurl.CompanyProfile> {
    const res = await this.ky
      .get('api/linkedin/company/resolve', {
        searchParams: sanitizeSearchParams({
          enrich_profile: 'enrich',
          ...opts
        })
      })
      .json<proxycurl.ResolvedCompanyProfile>()

    return {
      linkedin_url: res.url,
      ...res.profile
    }
  }

  @aiFunction({
    name: 'search_linkedin_companies',
    description:
      'Searches LinkedIn company profiles based on a set of criteria such as `name`, `industry`, `region`, `description`, `city`, number of employees, founding date, funding raised, etc.',
    inputSchema: proxycurl.CompanySearchEndpointParamsQueryClassSchema
  })
  async searchCompanies(opts: proxycurl.CompanySearchEndpointParamsQueryClass) {
    return this.ky
      .get('api/v2/search/company', {
        searchParams: sanitizeSearchParams(opts)
      })
      .json<proxycurl.CompanySearchResult>()
  }

  @aiFunction({
    name: 'search_linkedin_people',
    description:
      'Searches LinkedIn people profiles based on a set of criteria such as `country`, `first_name`, `last_name`, `current_company_name`, `headline`, `industries`, `past_company_name`, `summary`, `city`, `education_school_name`, etc.',
    inputSchema: proxycurl.PersonSearchEndpointParamsQueryClassSchema
  })
  async searchPeople(opts: proxycurl.PersonSearchEndpointParamsQueryClass) {
    return this.ky
      .get('api/v2/search/person/', {
        searchParams: sanitizeSearchParams(opts)
      })
      .json<proxycurl.PersonSearchResult>()
  }
}
