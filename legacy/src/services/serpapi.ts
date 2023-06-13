import defaultKy from 'ky'

/**
 * All types have been exported from the `serpapi` package, which we're
 * not using directly because it is bloated and has compatibility issues.
 */

export type BaseResponse<P = Record<string | number | symbol, never>> = {
  search_metadata: {
    id: string
    status: 'Queued' | 'Processing' | 'Success'
    json_endpoint: string
    created_at: string
    processed_at: string
    raw_html_file: string
    total_time_taken: number
  }
  search_parameters: {
    engine: string
  } & Omit<BaseParameters & P, 'api_key' | 'no_cache' | 'async' | 'timeout'>
  serpapi_pagination?: {
    next: string
  }
  pagination?: {
    next: string
  }
  next?: (
    callback?: (json: BaseResponse<P>) => void
  ) => Promise<BaseResponse<P>>
  [key: string]: any
}

export type BaseParameters = {
  /**
   * Parameter defines the device to use to get the results. It can be set to
   * `desktop` (default) to use a regular browser, `tablet` to use a tablet browser
   * (currently using iPads), or `mobile` to use a mobile browser (currently
   * using iPhones).
   */
  device?: 'desktop' | 'tablet' | 'mobile'

  /**
   * Parameter will force SerpApi to fetch the Google results even if a cached
   * version is already present. A cache is served only if the query and all
   * parameters are exactly the same. Cache expires after 1h. Cached searches
   * are free, and are not counted towards your searches per month. It can be set
   * to `false` (default) to allow results from the cache, or `true` to disallow
   * results from the cache. `no_cache` and `async` parameters should not be used together.
   */
  no_cache?: boolean

  /**
   * Parameter defines the way you want to submit your search to SerpApi. It can
   * be set to `false` (default) to open an HTTP connection and keep it open until
   * you got your search results, or `true` to just submit your search to SerpApi
   * and retrieve them later. In this case, you'll need to use our
   * [Searches Archive API](https://serpapi.com/search-archive-api) to retrieve
   * your results. `async` and `no_cache` parameters should not be used together.
   * `async` should not be used on accounts with
   * [Ludicrous Speed](https://serpapi.com/plan) enabled.
   */
  async?: boolean

  /**
   * Parameter defines the SerpApi private key to use.
   */
  api_key?: string | null

  /**
   * Specify the client-side timeout of the request. In milliseconds.
   */
  timeout?: number
}

export type GoogleParameters = BaseParameters & {
  /**
   * Search Query
   * Parameter defines the query you want to search. You can use anything that you
   * would use in a regular Google search. e.g. `inurl:`, `site:`, `intitle:`. We
   * also support advanced search query parameters such as as_dt and as_eq. See the
   * [full list](https://serpapi.com/advanced-google-query-parameters) of supported
   * advanced search query parameters.
   */
  q: string

  /**
   * Location
   * Parameter defines from where you want the search to originate. If several
   * locations match the location requested, we'll pick the most popular one. Head to
   * the [/locations.json API](https://serpapi.com/locations-api) if you need more
   * precise control. location and uule parameters can't be used together. Avoid
   * utilizing location when setting the location outside the U.S. when using Google
   * Shopping and/or Google Product API.
   */
  location?: string

  /**
   * Encoded Location
   * Parameter is the Google encoded location you want to use for the search. uule
   * and location parameters can't be used together.
   */
  uule?: string

  /**
   * Google Place ID
   * Parameter defines the id (`CID`) of the Google My Business listing you want to
   * scrape. Also known as Google Place ID.
   */
  ludocid?: string

  /**
   * Additional Google Place ID
   * Parameter that you might have to use to force the knowledge graph map view to
   * show up. You can find the lsig ID by using our [Local Pack
   * API](https://serpapi.com/local-pack) or [Places Results
   * API](https://serpapi.com/places-results).
   * lsig ID is also available via a redirect Google uses within [Google My
   * Business](https://www.google.com/business/).
   */
  lsig?: string

  /**
   * Google Knowledge Graph ID
   * Parameter defines the id (`KGMID`) of the Google Knowledge Graph listing you
   * want to scrape. Also known as Google Knowledge Graph ID. Searches with kgmid
   * parameter will return results for the originally encrypted search parameters.
   * For some searches, kgmid may override all other parameters except start, and num
   * parameters.
   */
  kgmid?: string

  /**
   * Google Cached Search Parameters ID
   * Parameter defines the cached search parameters of the Google Search you want to
   * scrape. Searches with si parameter will return results for the originally
   * encrypted search parameters. For some searches, si may override all other
   * parameters except start, and num parameters. si can be used to scrape Google
   * Knowledge Graph Tabs.
   */
  si?: string

  /**
   * Domain
   * Parameter defines the Google domain to use. It defaults to `google.com`. Head to
   * the [Google domains page](https://serpapi.com/google-domains) for a full list of
   * supported Google domains.
   */
  google_domain?: string

  /**
   * Country
   * Parameter defines the country to use for the Google search. It's a two-letter
   * country code. (e.g., `us` for the United States, `uk` for United Kingdom, or
   * `fr` for France). Head to the [Google countries
   * page](https://serpapi.com/google-countries) for a full list of supported Google
   * countries.
   */
  gl?: string

  /**
   * Language
   * Parameter defines the language to use for the Google search. It's a two-letter
   * language code. (e.g., `en` for English, `es` for Spanish, or `fr` for French).
   * Head to the [Google languages page](https://serpapi.com/google-languages) for a
   * full list of supported Google languages.
   */
  hl?: string

  /**
   * Set Multiple Languages
   * Parameter defines one or multiple languages to limit the search to. It uses
   * `lang_{two-letter language code}` to specify languages and `|` as a delimiter.
   * (e.g., `lang_fr|lang_de` will only search French and German pages). Head to the
   * [Google lr languages page](https://serpapi.com/google-lr-languages) for a full
   * list of supported languages.
   */
  lr?: string

  /**
   * as_dt
   * Parameter controls whether to include or exclude results from the site named in
   * the as_sitesearch parameter.
   */
  as_dt?: string

  /**
   * as_epq
   * Parameter identifies a phrase that all documents in the search results must
   * contain. You can also use the [phrase
   * search](https://developers.google.com/custom-search/docs/xml_results#PhraseSearchqt)
   * query term to search for a phrase.
   */
  as_epq?: string

  /**
   * as_eq
   * Parameter identifies a word or phrase that should not appear in any documents in
   * the search results. You can also use the [exclude
   * query](https://developers.google.com/custom-search/docs/xml_results#Excludeqt)
   * term to ensure that a particular word or phrase will not appear in the documents
   * in a set of search results.
   */
  as_eq?: string

  /**
   * as_lq
   * Parameter specifies that all search results should contain a link to a
   * particular URL. You can also use the
   * [link:](https://developers.google.com/custom-search/docs/xml_results#BackLinksqt)
   * query term for this type of query.
   */
  as_lq?: string

  /**
   * as_nlo
   * Parameter specifies the starting value for a search range. Use as_nlo and as_nhi
   * to append an inclusive search range.
   */
  as_nlo?: string

  /**
   * as_nhi
   * Parameter specifies the ending value for a search range. Use as_nlo and as_nhi
   * to append an inclusive search range.
   */
  as_nhi?: string

  /**
   * as_oq
   * Parameter provides additional search terms to check for in a document, where
   * each document in the search results must contain at least one of the additional
   * search terms. You can also use the [Boolean
   * OR](https://developers.google.com/custom-search/docs/xml_results#BooleanOrqt)
   * query term for this type of query.
   */
  as_oq?: string

  /**
   * as_q
   * Parameter provides search terms to check for in a document. This parameter is
   * also commonly used to allow users to specify additional terms to search for
   * within a set of search results.
   */
  as_q?: string

  /**
   * as_qdr
   * Parameter requests search results from a specified time period (quick date
   * range). The following values are supported:
   * `d[number]`: requests results from the specified number of past days. Example
   * for the past 10 days: `as_qdr=d10`
   * `w[number]`: requests results from the specified number of past weeks.
   * `m[number]`: requests results from the specified number of past months.
   * `y[number]`: requests results from the specified number of past years. Example
   * for the past year: `as_qdr=y`
   */
  as_qdr?: string

  /**
   * as_rq
   * Parameter specifies that all search results should be pages that are related to
   * the specified URL. The parameter value should be a URL. You can also use the
   * [related:](https://developers.google.com/custom-search/docs/xml_results#RelatedLinksqt)
   * query term for this type of query.
   */
  as_rq?: string

  /**
   * as_sitesearch
   * Parameter allows you to specify that all search results should be pages from a
   * given site. By setting the as_dt parameter, you can also use it to exclude pages
   * from a given site from your search resutls.
   */
  as_sitesearch?: string

  /**
   * Advanced Search Parameters
   * (to be searched) parameter defines advanced search parameters that aren't
   * possible in the regular query field. (e.g., advanced search for patents, dates,
   * news, videos, images, apps, or text contents).
   */
  tbs?: string

  /**
   * Adult Content Filtering
   * Parameter defines the level of filtering for adult content. It can be set to
   * `active`, or `off` (default).
   */
  safe?: string

  /**
   * Exclude Auto-corrected Results
   * Parameter defines the exclusion of results from an auto-corrected query that is
   * spelled wrong. It can be set to `1` to exclude these results, or `0` to include
   * them (default).
   */
  nfpr?: string

  /**
   * Results Filtering
   * Parameter defines if the filters for 'Similar Results' and 'Omitted Results' are
   * on or off. It can be set to `1` (default) to enable these filters, or `0` to
   * disable these filters.
   */
  filter?: string

  /**
   * Search Type
   * (to be matched) parameter defines the type of search you want to do.
   * It can be set to:
   * `(no tbm parameter)`: regular Google Search,
   * `isch`: [Google Images API](https://serpapi.com/images-results),
   * `lcl` - [Google Local API](https://serpapi.com/local-results)
   * `vid`: [Google Videos API](https://serpapi.com/videos-results),
   * `nws`: [Google News API](https://serpapi.com/news-results),
   * `shop`: [Google Shopping API](https://serpapi.com/shopping-results),
   * or any other Google service.
   */
  tbm?: string

  /**
   * Result Offset
   * Parameter defines the result offset. It skips the given number of results. It's
   * used for pagination. (e.g., `0` (default) is the first page of results, `10` is
   * the 2nd page of results, `20` is the 3rd page of results, etc.).
   * Google Local Results only accepts multiples of `20`(e.g. `20` for the second
   * page results, `40` for the third page results, etc.) as the start value.
   */
  start?: number

  /**
   * Number of Results
   * Parameter defines the maximum number of results to return. (e.g., `10` (default)
   * returns 10 results, `40` returns 40 results, and `100` returns 100 results).
   */
  num?: string

  /**
   * Page Number (images)
   * Parameter defines the page number for [Google
   * Images](https://serpapi.com/images-results). There are 100 images per page. This
   * parameter is equivalent to start (offset) = ijn * 100. This parameter works only
   * for [Google Images](https://serpapi.com/images-results) (set tbm to `isch`).
   */
  ijn?: string
}

export type SerpAPIParams = Omit<GoogleParameters, 'q'>
export type SerpAPISearchResponse = BaseResponse<GoogleParameters>

export interface SerpAPIClientOptions extends Partial<SerpAPIParams> {
  apiKey?: string
  apiBaseUrl?: string
  ky?: typeof defaultKy
}

export const SERPAPI_BASE_URL = 'https://serpapi.com'

/**
 * Lightweight wrapper around SerpAPI for Google search.
 *
 * @see https://serpapi.com/search-api
 */
export class SerpAPIClient {
  api: typeof defaultKy

  apiKey: string
  apiBaseUrl: string
  params: Partial<SerpAPIParams>

  constructor({
    apiKey = process.env.SERPAPI_API_KEY ?? process.env.SERP_API_KEY,
    apiBaseUrl = SERPAPI_BASE_URL,
    ky = defaultKy,
    ...params
  }: SerpAPIClientOptions = {}) {
    if (!apiKey) {
      throw new Error(`Error SerpAPIClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl
    this.params = params

    this.api = ky.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  async search(queryOrOpts: string | { query: string }) {
    const query =
      typeof queryOrOpts === 'string' ? queryOrOpts : queryOrOpts.query
    const { timeout, ...rest } = this.params

    return this.api
      .get('search', {
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
