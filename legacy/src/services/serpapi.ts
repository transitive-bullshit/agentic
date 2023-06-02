import ky from 'ky'
// TODO: will these types be transpiled correctly, or will we need `serpapi` defined?
// TODO: pretty sure this won't work, and we really don't want `serpapi` as a dep
import type { BaseResponse, GoogleParameters } from 'serpapi'

export type SerpAPIParams = Omit<GoogleParameters, 'q'>
export type SerpAPISearchResponse = BaseResponse<GoogleParameters>

export interface SerpAPIClientOptions extends Partial<SerpAPIParams> {
  apiKey?: string
  baseUrl?: string
}

/**
 * Lightweight wrapper around SerpAPI that only supports Google search.
 *
 * @see https://serpapi.com/search-api
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
