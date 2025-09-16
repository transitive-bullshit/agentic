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
    similarity_checks: z
      .union([z.literal('include'), z.literal('skip')])
      .optional(),
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

  export const CourseSchema = z.object({
    name: z.string().optional(),
    number: z.string().optional()
  })
  export type Course = z.infer<typeof CourseSchema>

  export const Date0Schema = z.object({
    day: z.number().optional(),
    month: z.number().optional(),
    year: z.number().optional()
  })
  export type Date0 = z.infer<typeof Date0Schema>

  export const PersonExtraSchema = z.object({
    facebook_profile_id: z.string().optional(),
    github_profile_id: z.string().optional(),
    twitter_profile_id: z.string().optional(),
    website: z.string().optional()
  })
  export type PersonExtra = z.infer<typeof PersonExtraSchema>

  export const PeopleAlsoViewedSchema = z.object({
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional(),
    summary: z.string().optional()
  })
  export type PeopleAlsoViewed = z.infer<typeof PeopleAlsoViewedSchema>

  export const ActivitySchema = z.object({
    activity_status: z.string().optional(),
    link: z.string().optional(),
    title: z.string().optional()
  })
  export type Activity = z.infer<typeof ActivitySchema>

  export const PersonGroupSchema = z.object({
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    url: z.string().optional()
  })
  export type PersonGroup = z.infer<typeof PersonGroupSchema>

  export const InferredSalarySchema = z.object({
    max: z.number().optional(),
    min: z.number().optional()
  })
  export type InferredSalary = z.infer<typeof InferredSalarySchema>

  export const AffiliatedCompanySchema = z.object({
    industry: z.string().optional(),
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional()
  })
  export type AffiliatedCompany = z.infer<typeof AffiliatedCompanySchema>

  export const ExitSchema = z.object({
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    name: z.string().optional()
  })
  export type Exit = z.infer<typeof ExitSchema>

  export const InvestorSchema = z.object({
    linkedin_profile_url: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional()
  })
  export type Investor = z.infer<typeof InvestorSchema>

  export const CompanyLocationSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    is_hq: z.boolean().optional(),
    line_1: z.string().optional(),
    postal_code: z.string().optional(),
    state: z.string().optional()
  })
  export type CompanyLocation = z.infer<typeof CompanyLocationSchema>

  export const SimilarCompanySchema = z.object({
    industry: z.string().optional(),
    link: z.string().optional(),
    location: z.string().optional(),
    name: z.string().optional()
  })
  export type SimilarCompany = z.infer<typeof SimilarCompanySchema>

  export const HonourAwardSchema = z.object({
    description: z.string().optional(),
    issued_on: Date0Schema.optional(),
    issuer: z.string().optional(),
    title: z.string().optional()
  })
  export type HonourAward = z.infer<typeof HonourAwardSchema>

  export const AccomplishmentOrgSchema = z.object({
    description: z.string().optional(),
    ends_at: Date0Schema.optional(),
    org_name: z.string().optional(),
    starts_at: Date0Schema.optional(),
    title: z.string().optional()
  })
  export type AccomplishmentOrg = z.infer<typeof AccomplishmentOrgSchema>

  export const PatentSchema = z.object({
    application_number: z.string().optional(),
    description: z.string().optional(),
    issued_on: Date0Schema.optional(),
    issuer: z.string().optional(),
    patent_number: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type Patent = z.infer<typeof PatentSchema>

  export const ProjectSchema = z.object({
    description: z.string().optional(),
    ends_at: Date0Schema.optional(),
    starts_at: Date0Schema.optional(),
    title: z.string().optional(),
    url: z.string().optional()
  })
  export type Project = z.infer<typeof ProjectSchema>

  export const PublicationSchema = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    published_on: Date0Schema.optional(),
    publisher: z.string().optional(),
    url: z.string().optional()
  })
  export type Publication = z.infer<typeof PublicationSchema>

  export const TestScoreSchema = z.object({
    date_on: Date0Schema.optional(),
    description: z.string().optional(),
    name: z.string().optional(),
    score: z.string().optional()
  })
  export type TestScore = z.infer<typeof TestScoreSchema>

  export const ArticleSchema = z.object({
    author: z.string().optional(),
    image_url: z.string().optional(),
    link: z.string().optional(),
    published_date: Date0Schema.optional(),
    title: z.string().optional()
  })
  export type Article = z.infer<typeof ArticleSchema>

  export const CertificationSchema = z.object({
    authority: z.string().optional(),
    display_source: z.string().optional(),
    ends_at: Date0Schema.optional(),
    license_number: z.string().optional(),
    name: z.string().optional(),
    starts_at: Date0Schema.optional(),
    url: z.string().optional()
  })
  export type Certification = z.infer<typeof CertificationSchema>

  export const EducationSchema = z.object({
    activities_and_societies: z.string().optional(),
    degree_name: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date0Schema.optional(),
    field_of_study: z.string().optional(),
    grade: z.string().optional(),
    logo_url: z.string().optional(),
    school: z.string().optional(),
    school_facebook_profile_url: z.string().optional(),
    school_linkedin_profile_url: z.string().optional(),
    starts_at: Date0Schema.optional()
  })
  export type Education = z.infer<typeof EducationSchema>

  export const ExperienceSchema = z.object({
    company: z.string().optional(),
    company_facebook_profile_url: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date0Schema.optional(),
    location: z.string().optional(),
    logo_url: z.string().optional(),
    starts_at: Date0Schema.optional(),
    title: z.string().optional()
  })
  export type Experience = z.infer<typeof ExperienceSchema>

  export const VolunteeringExperienceSchema = z.object({
    cause: z.string().optional(),
    company: z.string().optional(),
    company_linkedin_profile_url: z.string().optional(),
    description: z.string().optional(),
    ends_at: Date0Schema.optional(),
    logo_url: z.string().optional(),
    starts_at: Date0Schema.optional(),
    title: z.string().optional()
  })
  export type VolunteeringExperience = z.infer<
    typeof VolunteeringExperienceSchema
  >

  export const AcquiredCompanySchema = z.object({
    announced_date: Date0Schema.optional(),
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    price: z.number().optional()
  })
  export type AcquiredCompany = z.infer<typeof AcquiredCompanySchema>

  export const AcquisitorSchema = z.object({
    announced_date: Date0Schema.optional(),
    crunchbase_profile_url: z.string().optional(),
    linkedin_profile_url: z.string().optional(),
    price: z.number().optional()
  })
  export type Acquisitor = z.infer<typeof AcquisitorSchema>

  export const CompanyDetailsSchema = z.object({
    company_type: z.string().optional(),
    contact_email: z.string().optional(),
    crunchbase_profile_url: z.string().optional(),
    crunchbase_rank: z.number().optional(),
    facebook_id: z.string().optional(),
    founding_date: Date0Schema.optional(),
    ipo_date: Date0Schema.optional(),
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
  export type CompanyDetails = z.infer<typeof CompanyDetailsSchema>

  export const FundingSchema = z.object({
    announced_date: Date0Schema.optional(),
    funding_type: z.string().optional(),
    investor_list: z.array(InvestorSchema).optional(),
    money_raised: z.number().optional(),
    number_of_investor: z.number().optional()
  })
  export type Funding = z.infer<typeof FundingSchema>

  export const CompanyUpdateSchema = z.object({
    article_link: z.string().optional(),
    image: z.string().optional(),
    posted_on: Date0Schema.optional(),
    text: z.string().optional(),
    total_likes: z.number().optional()
  })
  export type CompanyUpdate = z.infer<typeof CompanyUpdateSchema>

  export const PersonLookupUrlEnrichResultProfileSchema = z.object({
    accomplishment_courses: z.array(CourseSchema).optional(),
    accomplishment_honors_awards: z.array(HonourAwardSchema).optional(),
    accomplishment_organisations: z.array(AccomplishmentOrgSchema).optional(),
    accomplishment_patents: z.array(PatentSchema).optional(),
    accomplishment_projects: z.array(ProjectSchema).optional(),
    accomplishment_publications: z.array(PublicationSchema).optional(),
    accomplishment_test_scores: z.array(TestScoreSchema).optional(),
    activities: z.array(ActivitySchema).optional(),
    articles: z.array(ArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    birth_date: Date0Schema.optional(),
    certifications: z.array(CertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(EducationSchema).optional(),
    experiences: z.array(ExperienceSchema).optional(),
    extra: PersonExtraSchema.optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    groups: z.array(PersonGroupSchema).optional(),
    headline: z.string().optional(),
    industry: z.string().optional(),
    inferred_salary: InferredSalarySchema.optional(),
    interests: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(PeopleAlsoViewedSchema).optional(),
    personal_emails: z.array(z.string()).optional(),
    personal_numbers: z.array(z.string()).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(PeopleAlsoViewedSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(VolunteeringExperienceSchema).optional()
  })
  export type PersonLookupUrlEnrichResultProfile = z.infer<
    typeof PersonLookupUrlEnrichResultProfileSchema
  >

  export const RoleSearchEnrichedResultProfileSchema = z.object({
    accomplishment_courses: z.array(CourseSchema).optional(),
    accomplishment_honors_awards: z.array(HonourAwardSchema).optional(),
    accomplishment_organisations: z.array(AccomplishmentOrgSchema).optional(),
    accomplishment_patents: z.array(PatentSchema).optional(),
    accomplishment_projects: z.array(ProjectSchema).optional(),
    accomplishment_publications: z.array(PublicationSchema).optional(),
    accomplishment_test_scores: z.array(TestScoreSchema).optional(),
    activities: z.array(ActivitySchema).optional(),
    articles: z.array(ArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    birth_date: Date0Schema.optional(),
    certifications: z.array(CertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(EducationSchema).optional(),
    experiences: z.array(ExperienceSchema).optional(),
    extra: PersonExtraSchema.optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    groups: z.array(PersonGroupSchema).optional(),
    headline: z.string().optional(),
    industry: z.string().optional(),
    inferred_salary: InferredSalarySchema.optional(),
    interests: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(PeopleAlsoViewedSchema).optional(),
    personal_emails: z.array(z.string()).optional(),
    personal_numbers: z.array(z.string()).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(PeopleAlsoViewedSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(VolunteeringExperienceSchema).optional()
  })
  export type RoleSearchEnrichedResultProfile = z.infer<
    typeof RoleSearchEnrichedResultProfileSchema
  >

  export const ReverseEmailUrlEnrichResultProfileSchema = z.object({
    accomplishment_courses: z.array(CourseSchema).optional(),
    accomplishment_honors_awards: z.array(HonourAwardSchema).optional(),
    accomplishment_organisations: z.array(AccomplishmentOrgSchema).optional(),
    accomplishment_patents: z.array(PatentSchema).optional(),
    accomplishment_projects: z.array(ProjectSchema).optional(),
    accomplishment_publications: z.array(PublicationSchema).optional(),
    accomplishment_test_scores: z.array(TestScoreSchema).optional(),
    activities: z.array(ActivitySchema).optional(),
    articles: z.array(ArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    birth_date: Date0Schema.optional(),
    certifications: z.array(CertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(EducationSchema).optional(),
    experiences: z.array(ExperienceSchema).optional(),
    extra: PersonExtraSchema.optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    groups: z.array(PersonGroupSchema).optional(),
    headline: z.string().optional(),
    industry: z.string().optional(),
    inferred_salary: InferredSalarySchema.optional(),
    interests: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(PeopleAlsoViewedSchema).optional(),
    personal_emails: z.array(z.string()).optional(),
    personal_numbers: z.array(z.string()).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(PeopleAlsoViewedSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(VolunteeringExperienceSchema).optional()
  })
  export type ReverseEmailUrlEnrichResultProfile = z.infer<
    typeof ReverseEmailUrlEnrichResultProfileSchema
  >

  export const PersonProfileSchema = z.object({
    accomplishment_courses: z.array(CourseSchema).optional(),
    accomplishment_honors_awards: z.array(HonourAwardSchema).optional(),
    accomplishment_organisations: z.array(AccomplishmentOrgSchema).optional(),
    accomplishment_patents: z.array(PatentSchema).optional(),
    accomplishment_projects: z.array(ProjectSchema).optional(),
    accomplishment_publications: z.array(PublicationSchema).optional(),
    accomplishment_test_scores: z.array(TestScoreSchema).optional(),
    activities: z.array(ActivitySchema).optional(),
    articles: z.array(ArticleSchema).optional(),
    background_cover_image_url: z.string().optional(),
    birth_date: Date0Schema.optional(),
    certifications: z.array(CertificationSchema).optional(),
    city: z.string().optional(),
    connections: z.number().optional(),
    country: z.string().optional(),
    country_full_name: z.string().optional(),
    education: z.array(EducationSchema).optional(),
    experiences: z.array(ExperienceSchema).optional(),
    first_name: z.string().optional(),
    follower_count: z.number().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    groups: z.array(PersonGroupSchema).optional(),
    headline: z.string().optional(),
    industry: z.string().optional(),
    inferred_salary: InferredSalarySchema.optional(),
    languages: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    occupation: z.string().optional(),
    people_also_viewed: z.array(PeopleAlsoViewedSchema).optional(),
    personal_emails: z.array(z.string()).optional(),
    personal_numbers: z.array(z.string()).optional(),
    profile_pic_url: z.string().optional(),
    public_identifier: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    similarly_named_profiles: z.array(PeopleAlsoViewedSchema).optional(),
    skills: z.array(z.string()).optional(),
    state: z.string().optional(),
    summary: z.string().optional(),
    volunteer_work: z.array(VolunteeringExperienceSchema).optional()
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

  export const AcquisitionSchema = z.object({
    acquired: z.array(AcquiredCompanySchema).optional(),
    acquired_by: AcquisitorSchema.optional()
  })
  export type Acquisition = z.infer<typeof AcquisitionSchema>

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
    acquisitions: AcquisitionSchema.optional(),
    affiliated_companies: z.array(AffiliatedCompanySchema).optional(),
    background_cover_image_url: z.string().optional(),
    categories: z.array(z.string()).optional(),
    company_size: z.array(z.number()).optional(),
    company_size_on_linkedin: z.number().optional(),
    company_type: CompanyTypeSchema.optional(),
    customer_list: z.array(z.string()).optional(),
    description: z.string().optional(),
    exit_data: z.array(ExitSchema).optional(),
    extra: CompanyDetailsSchema.optional(),
    follower_count: z.number().optional(),
    founded_year: z.number().optional(),
    funding_data: z.array(FundingSchema).optional(),
    hq: CompanyLocationSchema.optional(),
    industry: z.string().optional(),
    linkedin_internal_id: z.string().optional(),
    locations: z.array(CompanyLocationSchema).optional(),
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    search_id: z.string().optional(),
    similar_companies: z.array(SimilarCompanySchema).optional(),
    specialities: z.array(z.string()).optional(),
    tagline: z.string().optional(),
    universal_name_id: z.string().optional(),
    updates: z.array(CompanyUpdateSchema).optional(),
    website: z.string().optional()
  })
  export type CompanyProfile = z.infer<typeof ResultProfileSchema>
  export type ResolvedCompanyProfile = {
    url: string
    last_updated: string
    profile: CompanyProfile
  }

  export const CompanyUrlEnrichResultProfileSchema = z.object({
    acquisitions: AcquisitionSchema.optional(),
    affiliated_companies: z.array(AffiliatedCompanySchema).optional(),
    background_cover_image_url: z.string().optional(),
    categories: z.array(z.string()).optional(),
    company_size: z.array(z.number()).optional(),
    company_size_on_linkedin: z.number().optional(),
    company_type: CompanyTypeSchema.optional(),
    customer_list: z.array(z.string()).optional(),
    description: z.string().optional(),
    exit_data: z.array(ExitSchema).optional(),
    extra: CompanyDetailsSchema.optional(),
    follower_count: z.number().optional(),
    founded_year: z.number().optional(),
    funding_data: z.array(FundingSchema).optional(),
    hq: CompanyLocationSchema.optional(),
    industry: z.string().optional(),
    linkedin_internal_id: z.string().optional(),
    locations: z.array(CompanyLocationSchema).optional(),
    name: z.string().optional(),
    profile_pic_url: z.string().optional(),
    search_id: z.string().optional(),
    similar_companies: z.array(SimilarCompanySchema).optional(),
    specialities: z.array(z.string()).optional(),
    tagline: z.string().optional(),
    universal_name_id: z.string().optional(),
    updates: z.array(CompanyUpdateSchema).optional(),
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
    timeoutMs = 60_000,
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

  /** Gets the LinkedIn profile for a company given it's domain `url`. */
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

  /** Gets the LinkedIn profile for a person given some unique, identifying information about them. */
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

  /** Resolves the LinkedIn profile for a person given their `first_name` and `company_domain` URL. */
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

  /** Resolves the LinkedIn profile for a person given their `email`. */
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

  /** Resolves the LinkedIn profile for a person at a given `company_name` and `role`. */
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

  /** Resolves the LinkedIn profile for a company given the `company_name` and/or `company_domain`. */
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

  /** Searches LinkedIn company profiles based on a set of criteria such as `name`, `industry`, `region`, `description`, `city`, number of employees, founding date, funding raised, etc. */
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

  /** Searches LinkedIn people profiles based on a set of criteria such as `country`, `first_name`, `last_name`, `current_company_name`, `headline`, `industries`, `past_company_name`, `summary`, `city`, `education_school_name`, etc. */
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
