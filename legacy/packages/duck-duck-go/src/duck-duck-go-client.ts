import { aiFunction, AIFunctionsProvider } from '@agentic/core'
import { SafeSearchType, search, type SearchOptions } from 'duck-duck-scrape'
import { z } from 'zod'

import { paginate } from './paginate'

export namespace duckduckgo {
  export interface DuckDuckGoSearchToolOptions {
    search?: SearchOptions
    maxResults: number
  }

  export interface DuckDuckGoSearchToolRunOptions {
    search?: SearchOptions
  }
}
/**
 * DuckDuckGo search client.
 *
 * @see https://duckduckgo.com
 */
export class DuckDuckGoClient extends AIFunctionsProvider {
  /**
   * Searches the web using DuckDuckGo for a given query.
   */
  @aiFunction({
    name: 'duck_duck_go_search',
    description: 'Searches the web using DuckDuckGo for a given query.',
    inputSchema: z.object({
      query: z.string({ description: 'Search query' }).min(1).max(128),
      maxResults: z.number().min(1).max(100).optional()
    })
  })
  async search(
    queryOrOptions:
      | string
      | { query: string; maxResults?: number; search?: SearchOptions }
  ) {
    const options =
      typeof queryOrOptions === 'string'
        ? { query: queryOrOptions }
        : queryOrOptions

    const results = await paginate({
      size: options.maxResults ?? 10,
      handler: async ({ cursor = 0 }) => {
        const { results: data, noResults: done } = await search(
          options.query,
          {
            safeSearch: SafeSearchType.MODERATE,
            ...options.search,
            offset: cursor
          },
          {
            uri_modifier: (rawUrl: string) => {
              const url = new URL(rawUrl)
              url.searchParams.delete('ss_mkt')
              return url.toString()
            }
          }
        )

        return {
          data,
          nextCursor: done ? undefined : cursor + data.length
        }
      }
    })

    const { stripHtml } = await import('string-strip-html')

    return results.map((result) => ({
      url: result.url,
      title: stripHtml(result.title).result,
      description: stripHtml(result.description).result
    }))
  }
}
