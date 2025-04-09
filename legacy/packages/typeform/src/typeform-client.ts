import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace typeform {
  export const API_BASE_URL = 'https://api.typeform.com'

  export interface GetInsightsForFormResponse {
    fields: Array<{
      dropoffs: number
      id: string
      label: string
      ref: string
      title: string
      type: string
      views: number
    }>
    form: {
      platforms: Array<{
        average_time: number
        completion_rate: number
        platform: string
        responses_count: number
        total_visits: number
        unique_visits: number
      }>
      summary: {
        average_time: number
        completion_rate: number
        responses_count: number
        total_visits: number
        unique_visits: number
      }
    }
  }

  export interface GetResponsesForFormParams {
    formId: string
    pageSize?: number
    since?: string
    until?: string
    completed?: boolean
  }

  export interface GetResponsesForFormResponse {
    total_items: number
    page_count: number
    items: Array<{
      landing_id: string
      token: string
      landed_at: string
      submitted_at: string
      metadata: {
        user_agent: string
        platform: string
        referer: string
        network_id: string
        browser: string
      }
      answers: Array<{
        field: {
          id: string
          type: string
          ref: string
        }
        type: string
        [key: string]: any
      }>
      hidden: Record<string, any>
      calculated: {
        score: number
      }
      variables: Array<{
        key: string
        type: string
        [key: string]: any
      }>
    }>
  }
}

/**
 * Readonly Typeform API client for fetching form insights and responses.
 *
 * @see https://www.typeform.com/developers/get-started/
 */
export class TypeformClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('TYPEFORM_API_KEY'),
    apiBaseUrl = typeform.API_BASE_URL,
    timeoutMs = 60_000,
    ky = defaultKy
  }: {
    /** Typeform Personal Access Token */
    apiKey?: string
    apiBaseUrl?: string
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'TypeformClient missing required "apiKey" (defaults to "TYPEFORM_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    })
  }

  /**
   * Retrieves insights and analytics for a Typeform form.
   */
  @aiFunction({
    name: 'typeform_get_insights_for_form',
    description: 'Retrieve insights and analytics for a Typeform form.',
    inputSchema: z.object({
      formId: z
        .string()
        .describe('The ID of the Typeform form to get insights for.')
    })
  })
  async getInsightsForForm(
    formIdOrOptions: string | { formId: string }
  ): Promise<typeform.GetInsightsForFormResponse> {
    const { formId } =
      typeof formIdOrOptions === 'string'
        ? { formId: formIdOrOptions }
        : formIdOrOptions

    const encodedFormId = encodeURIComponent(formId)
    return this.ky
      .get(`insights/${encodedFormId}/summary`)
      .json<typeform.GetInsightsForFormResponse>()
  }

  /**
   * Retrieves responses for a Typeform form.
   */
  @aiFunction({
    name: 'typeform_get_responses_for_form',
    description: 'Retrieve responses for a Typeform form.',
    inputSchema: z.object({
      formId: z
        .string()
        .describe('The ID of the Typeform form to get responses for.'),
      pageSize: z
        .number()
        .describe('The number of responses to retrieve per page.')
        .optional(),
      since: z
        .string()
        .describe('The date to start retrieving responses from.')
        .optional(),
      until: z
        .string()
        .describe('The date to stop retrieving responses at.')
        .optional(),
      completed: z
        .boolean()
        .describe('Filter responses by completion status.')
        .optional()
    })
  })
  async getResponsesForForm(
    formIdOrOptions: string | typeform.GetResponsesForFormParams
  ): Promise<typeform.GetResponsesForFormResponse> {
    const { formId, ...params } =
      typeof formIdOrOptions === 'string'
        ? { formId: formIdOrOptions }
        : formIdOrOptions

    const encodedFormId = encodeURIComponent(formId)
    return this.ky
      .get(`forms/${encodedFormId}/responses`, {
        searchParams: sanitizeSearchParams(params)
      })
      .json<typeform.GetResponsesForFormResponse>()
  }
}
