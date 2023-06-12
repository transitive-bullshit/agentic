import ky from 'ky'
import { z } from 'zod'

export const METAPHOR_BASE_URL = 'https://api.metaphor.systems'

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
  apiKey: string
  baseUrl: string

  constructor({
    apiKey = process.env.METAPHOR_API_KEY,
    baseUrl = METAPHOR_BASE_URL
  }: {
    apiKey?: string
    baseUrl?: string
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error MetaphorClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async search(params: MetaphorSearchInput) {
    return ky
      .post(`${this.baseUrl}/search`, {
        headers: {
          'x-api-key': this.apiKey
        },
        json: params
      })
      .json<MetaphorSearchOutput>()
  }
}
