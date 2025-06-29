import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'

import { bravesearch } from './brave-search'

/**
 * Agentic client for the Brave search engine.
 *
 * @see https://brave.com/search/api
 */
export class BraveSearchClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('BRAVE_SEARCH_API_KEY'),
    apiBaseUrl = bravesearch.apiBaseUrl,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'BraveSearchClient missing required "apiKey" (defaults to "BRAVE_SEARCH_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        'X-Subscription-Token': apiKey
      }
    })
  }

  /**
   * Brave web search.
   */
  @aiFunction({
    name: 'brave_search',
    description:
      'Performs a web search using the Brave Search API, ideal for general queries, news, articles, and online content. ' +
      'Use this for broad information gathering, recent events, or when you need diverse web sources. ' +
      'Supports pagination, content filtering, and freshness controls. ' +
      'Maximum 20 results per request, with offset for pagination. ',
    inputSchema: bravesearch.SearchParamsSchema
  })
  async search(
    queryOrParams: string | bravesearch.SearchParams
  ): Promise<bravesearch.SearchResponse> {
    const { query: q, ...params } =
      typeof queryOrParams === 'string'
        ? { query: queryOrParams }
        : queryOrParams

    return this.ky
      .get('res/v1/web/search', {
        searchParams: sanitizeSearchParams({
          ...params,
          q
        })
      })
      .json<bravesearch.SearchResponse>()
  }

  /**
   * Brave local search for businesses and places.
   */
  @aiFunction({
    name: 'brave_local_search',
    description:
      "Searches for local businesses and places using Brave's Local Search API. " +
      'Best for queries related to physical locations, businesses, restaurants, services, etc. ' +
      'Returns detailed information including:\n' +
      '- Business names and addresses\n' +
      '- Ratings and review counts\n' +
      '- Phone numbers and opening hours\n' +
      "Use this when the query implies 'near me' or mentions specific locations. " +
      'Automatically falls back to web search if no local results are found.',
    inputSchema: bravesearch.LocalSearchParamsSchema
  })
  async localSearch(
    queryOrParams: string | bravesearch.LocalSearchParams
  ): Promise<bravesearch.LocalSearchResponse | bravesearch.SearchResponse> {
    const { query: q, ...params } =
      typeof queryOrParams === 'string'
        ? { query: queryOrParams }
        : queryOrParams

    const webData = await this.ky
      .get('res/v1/web/search', {
        searchParams: sanitizeSearchParams({
          search_lang: 'en',
          result_filter: 'locations',
          ...params,
          q
        })
      })
      .json<bravesearch.SearchResponse>()

    const locationIds = webData.locations?.results
      ?.filter((r) => !!r.id)
      .map((r) => r.id)

    if (!locationIds?.length) {
      return this.search(queryOrParams)
    }

    // Get POI details and descriptions in parallel
    const [pois, descriptions] = await Promise.all([
      this.getPoisData(locationIds),
      this.getDescriptionsData(locationIds)
    ])

    const desc = descriptions.descriptions

    return Object.entries(desc).map(([id, description]) => ({
      description,
      ...pois.results.find((r) => r.id === id)!
    }))
  }

  async getPoisData(ids: string[]): Promise<bravesearch.PoiResponse> {
    return this.ky
      .get('res/v1/local/pois', {
        searchParams: sanitizeSearchParams({
          ids: ids.filter(Boolean)
        })
      })
      .json<bravesearch.PoiResponse>()
  }

  async getDescriptionsData(ids: string[]): Promise<bravesearch.Description> {
    return this.ky
      .get('res/v1/local/descriptions', {
        searchParams: sanitizeSearchParams({
          ids: ids.filter(Boolean)
        })
      })
      .json<bravesearch.Description>()
  }
}
