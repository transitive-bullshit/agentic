import ky from 'ky'
import type { BaseResponse, GoogleParameters } from 'serpapi'

export type SerpAPIParams = Omit<GoogleParameters, 'q'>
export type SerpAPISearchResponse = BaseResponse<GoogleParameters>

export interface SerpAPIClientOptions extends Partial<SerpAPIParams> {
  apiKey?: string
  baseUrl?: string
}

/**
 * Lightweight wrapper around SerpAPI that only supports Google search.
 */
export class SerpAPIClient {
  apiKey: string
  baseUrl: string
  params: Partial<SerpAPIParams>

  constructor({
    apiKey = process.env.SERPAPI_API_KEY ?? process.env.SERP_API_KEY,
    baseUrl = 'https://serpapi.com',
    ...params
  }: SerpAPIClientOptions = {}) {
    if (!apiKey) {
      throw new Error(`Error SerpAPIClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.params = params
  }

  async search(queryOrOpts: string | { query: string }) {
    const query =
      typeof queryOrOpts === 'string' ? queryOrOpts : queryOrOpts.query
    const { timeout, ...rest } = this.params

    return ky
      .get(`${this.baseUrl}/search`, {
        searchParams: {
          ...rest,
          engine: 'google',
          api_key: this.apiKey,
          q: query
        },
        timeout
      })
      .json<SerpAPISearchResponse>()
  }
}
