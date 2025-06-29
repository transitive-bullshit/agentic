import { aiFunction, AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import { customsearch_v1 as GoogleSearchAPI } from '@googleapis/customsearch'
import { z } from 'zod'

import { paginate } from './paginate'

export namespace googleCustomSearch {
  export const SearchParamsSchema = z.object({
    query: z.string().min(1).max(2048).describe('Search query'),
    maxResults: z.number().optional(),
    safeSearch: z
      .union([z.literal('active'), z.literal('off')])
      .optional()
      .describe('Search safety level. Defaults to "active".')
  })
  export type SearchParams = z.infer<typeof SearchParamsSchema>
}

/**
 * Agentic client for the official Google Custom Search API.
 *
 * @see https://developers.google.com/custom-search/v1/overview
 */
export class GoogleCustomSearchClient extends AIFunctionsProvider {
  protected readonly apiKey: string

  readonly cseId: string
  readonly client: GoogleSearchAPI.Customsearch

  constructor({
    apiKey = getEnv('GOOGLE_API_KEY'),
    cseId = getEnv('GOOGLE_CSE_ID')
  }: {
    /** Google API key */
    apiKey?: string

    /** Google Custom Search Engine ID */
    cseId?: string
  } = {}) {
    assert(
      apiKey,
      'GoogleCustomSearchClient missing required "apiKey" (defaults to "GOOGLE_API_KEY")'
    )
    assert(
      cseId,
      'GoogleCustomSearchClient missing required "cseId" (defaults to "GOOGLE_CSE_ID")'
    )
    super()

    this.apiKey = apiKey
    this.cseId = cseId

    this.client = new GoogleSearchAPI.Customsearch({
      auth: this.apiKey
    })
  }

  /**
   * Google Custom Search for online trends, news, current events, real-time information, or research topics.
   */
  @aiFunction({
    name: 'google_custom_search',
    description: `Google Custom Search for online trends, news, current events, real-time information, or research topics.`,
    inputSchema: googleCustomSearch.SearchParamsSchema
  })
  async search(
    queryOrParams: string | googleCustomSearch.SearchParams
  ): Promise<any> {
    const params =
      typeof queryOrParams === 'string'
        ? { query: queryOrParams }
        : queryOrParams

    const results = await paginate({
      size: params.maxResults ?? 10,
      handler: async ({ cursor = 0, limit }) => {
        const maxChunkSize = 10

        const {
          data: { items = [] }
        } = await this.client.cse.list({
          cx: this.cseId,
          q: params.query,
          start: cursor,
          num: Math.min(limit, maxChunkSize),
          safe: params.safeSearch ?? 'active'
        })

        return {
          data: items,
          nextCursor:
            items.length < maxChunkSize ? undefined : cursor + items.length
        }
      }
    })

    return results
  }
}
