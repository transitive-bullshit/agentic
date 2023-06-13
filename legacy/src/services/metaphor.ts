import defaultKy from 'ky'
import { z } from 'zod'

export const METAPHOR_API_BASE_URL = 'https://api.metaphor.systems'

// https://metaphorapi.readme.io/reference/search
export const MetaphorSearchInputSchema = z.object({
  query: z.string(),
  numResults: z.number().optional(),
  useQueryExpansion: z.boolean().optional(),
  includeDomains: z.array(z.string()).optional(),
  excludeDomains: z.array(z.string()).optional(),
  startCrawlDate: z.string().optional(),
  endCrawlDate: z.string().optional(),
  startPublishedDate: z.string().optional(),
  endPublishedDate: z.string().optional()
})

export type MetaphorSearchInput = z.infer<typeof MetaphorSearchInputSchema>

export const MetaphorSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      author: z.string().nullable(),
      publishedDate: z.string().nullable(),
      title: z.string().nullable(),
      score: z.number(),
      url: z.string()
    })
  )
})

export type MetaphorSearchOutput = z.infer<typeof MetaphorSearchOutputSchema>

export class MetaphorClient {
  api: typeof defaultKy

  apiKey: string
  apiBaseUrl: string

  constructor({
    apiKey = process.env.METAPHOR_API_KEY,
    apiBaseUrl = METAPHOR_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error MetaphorClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.api = ky.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  async search(params: MetaphorSearchInput) {
    return this.api
      .post('search', {
        headers: {
          'x-api-key': this.apiKey
        },
        json: params
      })
      .json<MetaphorSearchOutput>()
  }
}
