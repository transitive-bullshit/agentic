import { AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'

// TODO: add aiFunction decorator to select methods

export namespace polygon {
  export const API_BASE_URL = 'https://api.polygon.io'

  /**
   * Asset classes available on Polygon.
   */
  export type ASSET_CLASS = 'stocks' | 'options' | 'crypto' | 'fx'

  /**
   * Supported time spans for Polygon's indicator APIs.
   */
  export type TIMESPAN =
    | 'minute'
    | 'hour'
    | 'day'
    | 'week'
    | 'month'
    | 'quarter'
    | 'year'

  /**
   * Supported series types for Polygon's indicator APIs.
   */
  export type SERIES_TYPE = 'close' | 'open' | 'high' | 'low'

  /**
   * Order types available on Polygon.
   */
  export type ORDER_TYPE = 'asc' | 'desc'

  /**
   * Input parameters for the aggregates API.
   */
  export interface AggregatesInput {
    /** The ticker symbol of the stock/equity. */
    ticker: string

    /** The size of the timespan multiplier. */
    multiplier: number

    /** The size of the time window. */
    timespan: TIMESPAN

    /** The start of the aggregate time window. Either a date with the format YYYY-MM-DD or a millisecond timestamp. */
    from: string | number

    /** The end of the aggregate time window. Either a date with the format YYYY-MM-DD or a millisecond timestamp. */
    to: string | number

    /** Whether or not the results are adjusted for splits. By default, results are adjusted. Set this to false to get results that are NOT adjusted for splits. */
    adjusted?: boolean

    /** Sort the results by timestamp. "asc" will return results in ascending order (oldest at the top), "desc" will return results in descending order (newest at the top). */
    sort?: ORDER_TYPE

    /** Limits the number of base aggregates queried to create the aggregate results. Max 50000 and Default 5000. */
    limit?: number
  }

  /**
   * Output parameters for the aggregates API.
   */
  export interface AggregatesOutput {
    /** The exchange symbol that this item is traded under. */
    ticker: string

    /** Whether or not this response was adjusted for splits. */
    adjusted: boolean

    /** The number of aggregates (minute or day) used to generate the response. */
    queryCount: number

    /** A request id assigned by the server. */
    request_id: string

    /** The total number of results for this request. */
    resultsCount: number

    /** The status of this request's response. */
    status: string

    /** The results of the query. */
    results: Aggregate[]

    /** If present, this value can be used to fetch the next page of data. */
    next_url?: string
  }

  /**
   * Input parameters for the grouped daily API.
   */
  export type GroupedDailyInput = {
    /** The beginning date for the aggregate window. */
    date: string

    /** Whether or not the results are adjusted for splits. By default, results are adjusted. Set this to false to get results that are NOT adjusted for splits. */
    adjusted?: boolean
  }

  /**
   * Input parameters for the grouped daily API for stocks.
   */
  export interface GroupedDailyInputStocks extends GroupedDailyInput {
    /** Include OTC securities in the response. Default is false (don't include OTC securities). */
    include_otc?: boolean
  }

  /**
   * Output parameters for the grouped daily API.
   */
  export interface GroupedDailyOutput {
    /** Whether or not this response was adjusted for splits. */
    adjusted: boolean

    /** The number of aggregates (minute or day) used to generate the response. */
    queryCount: number

    /** A request id assigned by the server. */
    request_id: string

    /** The total number of results for this request. */
    resultsCount: number

    /** The status of this request's response. */
    status: string

    /** The results of the query. */
    results: AggregateDaily[]
  }

  /**
   * AggregateDaily parameters.
   */
  export interface AggregateDaily extends Aggregate {
    /** The exchange symbol that this item is traded under. */
    T: string
  }

  /**
   * Ticker Details v3 input parameters.
   */
  export type TickerDetailsInput = {
    /** The ticker symbol of the asset. */
    ticker: string

    /** Specify a point in time to get information about the ticker available on that date (formatted as YYYY-MM-DD). */
    date?: string
  }

  /**
   * Daily Open/Close input parameters.
   */
  export type DailyOpenCloseInput = {
    /** The ticker symbol */
    ticker: string

    /** The date of the requested open/close in the format YYYY-MM-DD. */
    date: string

    /** Whether or not the results are adjusted for splits. By default, results are adjusted. */
    adjusted?: boolean
  }

  /**
   * Result returned by the Daily Open/Close API.
   */
  export interface DailyOpenCloseOutput {
    /** The close price of the ticker symbol in after-hours trading. */
    afterHours: number

    /** The close price for the symbol in the given time period. */
    close: number

    /** The requested date. */
    from: string

    /** The highest price for the symbol in the given time period. */
    high: number

    /** The lowest price for the symbol in the given time period. */
    low: number

    /** The open price for the symbol in the given time period. */
    open: number

    /** The open price of the ticker symbol in pre-market trading. */
    preMarket: number

    /** The status of this request's response. */
    status: string

    /** The exchange symbol that this item is traded under. */
    symbol: string

    /** The trading volume of the symbol in the given time period. */
    volume: number
  }

  /**
   * Result returned by the Previous Close API.
   */
  export interface PreviousCloseOutput {
    /** Whether or not this response was adjusted for splits. */
    adjusted: boolean

    /** The number of aggregates (minute or day) used to generate the response. */
    queryCount: number

    /** A request id assigned by the server. */
    requestId: string

    /** Array of results, each containing details for the symbol in the given time period. */
    results: {
      /** The exchange symbol that this item is traded under. */
      T: string

      /** The close price for the symbol in the given time period. */
      c: number

      /** The highest price for the symbol in the given time period. */
      h: number

      /** The lowest price for the symbol in the given time period. */
      l: number

      /** The open price for the symbol in the given time period. */
      o: number

      /** The Unix Msec timestamp for the start of the aggregate window. */
      t: number

      /** The trading volume of the symbol in the given time period. */
      v: number

      /** The volume weighted average price. */
      vw: number
    }[]

    /** The total number of results for this request. */
    resultsCount: number

    /** The status of this request's response. */
    status: string

    /** The exchange symbol that this item is traded under. */
    ticker: string
  }

  /**
   * Result returned by the Ticker Details v3 API.
   */
  export interface TickerDetailsOutput {
    /** A request id assigned by the server. */
    requestId: string

    /** Detailed results for the specific ticker. */
    results: {
      /** Whether the ticker is actively traded. */
      active: boolean

      /** Address of the company. */
      address: {
        /** The first line of the company's headquarters address. */
        address1: string

        /** The city of the company's headquarters address. */
        city: string

        /** The postal code of the company's headquarters address. */
        postalCode: string

        /** The state of the company's headquarters address. */
        state: string
      }

      /** Branding details of the company. */
      branding: {
        /** A link to this ticker's company's icon. Icon's are generally smaller, square images that represent the company at a glance. */
        iconUrl: string

        /** A link to this ticker's company's logo. Note that you must provide an API key when accessing this URL. See the "Authentication" section at the top of this page for more details. */
        logoUrl: string
      }

      /** Central Index Key (CIK) of the company. */
      cik: string

      /** Composite Financial Instrument Global Identifier (FIGI). */
      compositeFigi: string

      /** Name of the currency in which the company trades. */
      currencyName: string

      /** Date and time the company was delisted, if applicable. */
      delistedUtc?: string

      /** Description of the company. */
      description: string

      /** The company's homepage URL. */
      homepageUrl: string

      /** The date when the company was listed. */
      listDate: string

      /** Locale of the company. */
      locale: string

      /** Market in which the company trades. */
      market: string

      /** Market capitalization of the company. */
      marketCap: number

      /** Name of the company. */
      name: string

      /** Phone number of the company. */
      phoneNumber: string

      /** The primary exchange on which the company trades. */
      primaryExchange: string

      /** Round lot size for the company's stock. */
      roundLot: number

      /** Share class FIGI. */
      shareClassFigi: string

      /** The number of outstanding shares for the share class. */
      shareClassSharesOutstanding: number

      /** The Standard Industrial Classification (SIC) code of the company. */
      sicCode: string

      /** Description of the SIC code. */
      sicDescription: string

      /** The ticker symbol of the company. */
      ticker: string

      /** The root of the ticker symbol. */
      tickerRoot: string

      /** The suffix of the ticker symbol, if applicable. */
      tickerSuffix?: string

      /** The total number of employees in the company. */
      totalEmployees: number

      /** The type of the ticker (e.g., common stock, preferred stock, etc.). */
      type: string

      /** The number of weighted outstanding shares. */
      weightedSharesOutstanding: number
    }

    /** The status of this request's response. */
    status: string
  }

  /**
   * Input parameters for technical indicators.
   */
  export type IndicatorInput = {
    /** The ticker symbol for which to get data. */
    ticker: string

    /** Query by timestamp. Either a date with the format YYYY-MM-DD or a millisecond timestamp. */
    timestamp?: string

    /** The size of the aggregate time window. */
    timespan?: TIMESPAN

    /** Whether or not the aggregates are adjusted for splits. By default, aggregates are adjusted. Set this to false to get results that are NOT adjusted for splits. */
    adjusted?: boolean

    /** The window size used to calculate the indicator. i.e. a window size of 10 with daily aggregates would result in a 10 day moving average. */
    window?: number

    /** The price in the aggregate which will be used to calculate the indicator. */
    series_type?: SERIES_TYPE

    /** Whether or not to include the aggregates used to calculate this indicator in the response. */
    expand_underlying?: boolean

    /** The order in which to return the results, ordered by timestamp. */
    order?: ORDER_TYPE

    /** Limit the number of results returned, default is 10 and max is 5000 */
    limit?: number
  }

  /**
   * Represents an aggregate, which includes data for a given time period.
   */
  export interface Aggregate {
    /** The close price for the symbol in the given time period. */
    c: number

    /** The highest price for the symbol in the given time period. */
    h: number

    /** The lowest price for the symbol in the given time period. */
    l: number

    /** The number of transactions in the aggregate window. */
    n: number

    /** The open price for the symbol in the given time period. */
    o: number

    /** Whether or not this aggregate is for an OTC ticker. This field will be left off if false. */
    otc?: boolean

    /** The Unix Msec timestamp for the start of the aggregate window. */
    t: number

    /** The trading volume of the symbol in the given time period. */
    v: number

    /** The volume weighted average price. */
    vw?: number
  }

  /**
   * Represents a value of the indicator, which includes timestamp and value itself.
   */
  export interface IndicatorValue {
    /** The Unix Msec timestamp from the last aggregate used in this calculation. */
    timestamp: number

    /** The indicator value for this period. */
    value: number
  }

  /**
   * The output response from the technical indicator API.
   */
  export interface IndicatorOutput {
    /** If present, this value can be used to fetch the next page of data. */
    next_url: string

    /** A request id assigned by the server. */
    request_id: string

    /** Results object containing underlying aggregates and values array. */
    results: {
      /** Underlying object containing aggregates and a URL to fetch underlying data. */
      underlying: {
        /** Array of aggregates used for calculation. */
        aggregates: Aggregate[]

        /** The URL which can be used to request the underlying aggregates used in this request. */
        url: string
      }

      /** Array of calculated indicator values. */
      values: IndicatorValue[]
    }

    /** The status of this request's response. */
    status: string
  }

  /**
   * Input parameters for the /v3/reference/tickers API.
   */
  export type TickerInput = {
    /** Specify a ticker symbol. Defaults to empty string which queries all tickers. */
    ticker?: string

    /** Specify the type of the tickers. */
    type?: string

    /** Filter by market type. */
    market?: 'crypto'

    /** Specify the primary exchange of the asset in the ISO code format. */
    exchange?: string

    /** Specify the CUSIP code of the asset you want to search for. */
    cusip?: string

    /** Specify the CIK of the asset you want to search for. */
    cik?: string

    /** Specify a point in time to retrieve tickers available on that date. */
    date?: string

    /** Search for terms within the ticker and/or company name. */
    search?: string

    /** Specify if the tickers returned should be actively traded on the queried date. */
    active?: boolean

    /** Order results based on the sort field. */
    order?: ORDER_TYPE

    /** Limit the number of results returned. */
    limit?: number

    /** Sort field used for ordering. */
    sort?: string
  }

  /**
   * Represents a ticker that matches the query.
   */
  export interface Ticker {
    /** Whether or not the asset is actively traded. */
    active: boolean

    /** The CIK number for this ticker. */
    cik: string

    /** The composite OpenFIGI number for this ticker. */
    composite_figi: string

    /** The name of the currency that this asset is traded with. */
    currency_name: string

    /** The last date that the asset was traded. */
    delisted_utc: string

    /** The information is accurate up to this time. */
    last_updated_utc: string

    /** The locale of the asset. */
    locale: 'us' | 'global'

    /** The market type of the asset. */
    market: 'stocks' | 'crypto' | 'fx' | 'otc' | 'indices'

    /** The name of the asset. */
    name: string

    /** The ISO code of the primary listing exchange for this asset. */
    primary_exchange: string

    /** The share Class OpenFIGI number for this ticker. */
    share_class_figi: string

    /** The exchange symbol that this item is traded under. */
    ticker: string

    /** The type of the asset. */
    type: string
  }

  /**
   * The output response from the /v3/reference/tickers API.
   */
  export interface TickerOutput {
    /** The total number of results for this request. */
    count: number

    /** If present, this value can be used to fetch the next page of data. */
    next_url: string

    /** A request id assigned by the server. */
    request_id: string

    /** An array of tickers that match your query. */
    results: Ticker[]

    /** The status of this request's response. */
    status: string
  }

  /**
   * Output parameters for the market status API.
   */
  export interface MarketStatusOutput {
    /** Whether or not the market is in post-market hours. */
    afterHours: boolean

    /** The status of the crypto and forex markets. */
    currencies: {
      /** The status of the crypto market. */
      crypto: string
      /** The status of the forex market. */
      fx: string
    }

    /** Whether or not the market is in pre-market hours. */
    earlyHours: boolean

    /** The status of the Nasdaq, NYSE and OTC markets. */
    exchanges: {
      /** The status of the Nasdaq market. */
      nasdaq: string
      /** The status of the NYSE market. */
      nyse: string
      /** The status of the OTC market. */
      otc: string
    }

    /** The status of the market as a whole. */
    market: string

    /** The current time of the server. */
    serverTime: string
  }

  /**
   * Output parameters for the market holidays API.
   */
  export interface MarketHolidayOutput {
    /** The market close time on the holiday (if it's not closed). */
    close?: string

    /** The date of the holiday. */
    date: string

    /** Which market the record is for. */
    exchange: string

    /** The name of the holiday. */
    name: string

    /** The market open time on the holiday (if it's not closed). */
    open?: string

    /** The status of the market on the holiday. */
    status: string
  }

  /**
   * Input parameters for the ticker types API.
   */
  export type TickerTypesInput = {
    /** Filter by asset class. */
    asset_class?: ASSET_CLASS

    /** Filter by locale. */
    locale?: string
  }

  /**
   * Output parameters for the ticker types API.
   */
  export interface TickerTypesOutput {
    /** The total number of results for this request. */
    count: number

    /** A request ID assigned by the server. */
    request_id: string

    /** The results of the query. */
    results: TickerType[]

    /** The status of this request's response. */
    status: string
  }

  /**
   * Ticker type parameters.
   */
  export interface TickerType {
    /** An identifier for a group of similar financial instruments. */
    asset_class: ASSET_CLASS

    /** A code used by Polygon.io to refer to this ticker type. */
    code: string

    /** A short description of this ticker type. */
    description: string

    /** An identifier for a geographical location. */
    locale: string
  }

  /**
   * Input parameters for the ticker news API.
   */
  export type TickerNewsInput = {
    /** Ticker symbol to return results for. */
    ticker: string

    /** Date to return results published on, before, or after. */
    published_utc?: string

    /** Order results based on the sort field. */
    order?: ORDER_TYPE

    /** Limit the number of results returned, default is 10 and max is 1000. */
    limit?: number

    /** Sort field used for ordering. */
    sort?: string
  }

  /**
   * Output parameters for the ticker news API.
   */
  export interface TickerNewsOutput {
    /** The total number of results for this request. */
    count: number

    /** If present, this value can be used to fetch the next page of data. */
    next_url: string

    /** A request id assigned by the server. */
    request_id: string

    /** The results of the query. */
    results: TickerNews[]

    /** The status of this request's response. */
    status: string
  }

  /**
   * Ticker news parameters.
   */
  export interface TickerNews {
    /** The mobile friendly Accelerated Mobile Page (AMP) URL. */
    amp_url?: string

    /** A link to the news article. */
    article_url: string

    /** The article's author. */
    author: string

    /** A description of the article. */
    description?: string

    /** Unique identifier for the article. */
    id: string

    /** The article's image URL. */
    image_url?: string

    /** The keywords associated with the article (which will vary depending on the publishing source). */
    keywords?: string[]

    /** The date the article was published on. */
    published_utc: string

    /** The publisher's details. */
    publisher: Publisher

    /** The ticker symbols associated with the article. */
    tickers: string[]

    /** The title of the news article. */
    title: string
  }

  /**
   * Publisher parameters.
   */
  export interface Publisher {
    /** The publisher's homepage favicon URL. */
    favicon_url?: string

    /** The publisher's homepage URL. */
    homepage_url: string

    /** The publisher's logo URL. */
    logo_url: string

    /** The publisher's name. */
    name: string
  }

  /**
   * Input parameters for the exchanges API.
   */
  export type ExchangesInput = {
    /** Filter by asset class. */
    asset_class?: ASSET_CLASS

    /** Filter by locale. */
    locale?: string
  }

  /**
   * Output parameters for the exchanges API.
   */
  export interface ExchangesOutput {
    /** The total number of results for this request. */
    count: number

    /** A request ID assigned by the server. */
    request_id: string

    /** The results of the query. */
    results: Exchange[]

    /** The status of this request's response. */
    status: string
  }

  /**
   * Exchange parameters.
   */
  export interface Exchange {
    /** A commonly used abbreviation for this exchange. */
    acronym?: string

    /** An identifier for a group of similar financial instruments. */
    asset_class: ASSET_CLASS

    /** A unique identifier used by Polygon.io for this exchange. */
    id: number

    /** An identifier for a geographical location. */
    locale: 'us' | 'global'

    /** The Market Identifer Code of this exchange (see ISO 10383). */
    mic: string

    /** Name of this exchange. */
    name: string

    /** The MIC of the entity that operates this exchange. */
    operating_mic: string

    /** The ID used by SIP's to represent this exchange. */
    participant_id?: string

    /** Represents the type of exchange. */
    type: 'exchange' | 'TRF' | 'SIP'

    /** A link to this exchange's website, if one exists. */
    url?: string
  }
}

/**
 * Client for the Polygon.io API that lets you query the latest market data
 * from all US stock exchanges. You can also find data on company financials,
 * stock market holidays, corporate actions, and more.
 *
 * @see {@link https://polygon.io/docs}
 */
export class PolygonClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('POLYGON_API_KEY'),
    apiBaseUrl = polygon.API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'PolygonClient missing required "apiKey" (defaults to "POLYGON_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    })
  }

  /**
   * Returns detailed information about a single ticker.
   *
   * @param params - input parameters (`ticker` symbol and optional `date`)
   * @returns promise that resolves to detailed information about a single ticker
   */
  async tickerDetails(params: polygon.TickerDetailsInput) {
    let searchParams
    if (params.date) {
      searchParams = {
        date: params.date
      }
    }

    return this.ky
      .get(`v3/reference/tickers/${params.ticker}`, {
        searchParams
      })
      .json<polygon.TickerDetailsOutput>()
  }

  /**
   * Returns the open, close and after hours prices of a stock symbol on a certain date.
   *
   * @param params - input parameters (`ticker` symbol and `date`)
   * @returns promise that resolves to the open, close and after hours prices of a stock symbol on a certain date
   */
  async dailyOpenClose(params: polygon.DailyOpenCloseInput) {
    return this.ky
      .get(`v1/open-close/${params.ticker}/${params.date}`, {
        searchParams: {
          adjusted: params.adjusted ?? true
        }
      })
      .json<polygon.DailyOpenCloseOutput>()
  }

  /**
   * Returns the previous day's open, high, low, and close (OHLC) for the specified stock ticker.
   *
   * @param ticker - ticker symbol of the stock/equity
   * @param adjusted - whether or not the results are adjusted for splits
   * @returns promise that resolves to the previous day's open, high, low, and close (OHLC) for the specified stock ticker
   */
  async previousClose(ticker: string, adjusted = true) {
    return this.ky
      .get(`v2/aggs/ticker/${ticker}/prev`, {
        searchParams: {
          adjusted
        }
      })
      .json<polygon.PreviousCloseOutput>()
  }

  /**
   * Get the simple moving average (SMA) for a ticker symbol over a given time range.
   *
   * @param params - input parameters
   * @returns promise that resolves to the simple moving average (SMA) for a ticker symbol over a given time range
   */
  async sma(params: polygon.IndicatorInput) {
    return this.ky
      .get(`v1/indicators/sma/${params.ticker}`, {
        searchParams: params
      })
      .json<polygon.IndicatorOutput>()
  }

  /**
   * Get the exponential moving average (EMA) for a ticker symbol over a given time range.
   *
   * @param params - input parameters
   * @returns promise that resolves to the exponential moving average (EMA) for a ticker symbol over a given time range
   */
  async ema(params: polygon.IndicatorInput) {
    return this.ky
      .get(`v1/indicators/ema/${params.ticker}`, {
        searchParams: params
      })
      .json<polygon.IndicatorOutput>()
  }

  /**
   * Get moving average convergence/divergence (MACD) for a ticker symbol over a given time range.
   *
   * @param params - input parameters
   * @returns promise that resolves to the moving average convergence/divergence (MACD) for a ticker symbol over a given time range
   */
  async macd(params: polygon.IndicatorInput) {
    return this.ky
      .get(`v1/indicators/ema/${params.ticker}`, {
        searchParams: params
      })
      .json<polygon.IndicatorOutput>()
  }

  /**
   * Get the relative strength index (RSI) for a ticker symbol over a given time range.
   *
   * @param params - input parameters
   * @returns promise that resolves to the relative strength index (RSI) for a ticker symbol over a given time range
   */
  async rsi(params: polygon.IndicatorInput) {
    return this.ky
      .get(`v1/indicators/rsi/${params.ticker}`, {
        searchParams: params
      })
      .json<polygon.IndicatorOutput>()
  }

  /**
   * Query all ticker symbols which are supported by Polygon.io. Currently includes Stocks/Equities, Indices, Forex, and Crypto.
   *
   * @param params - input parameters to filter the list of ticker symbols
   * @returns promise that resolves to a list of ticker symbols and their details
   */
  async tickers(params: polygon.TickerInput): Promise<polygon.TickerOutput> {
    return this.ky
      .get('v3/reference/tickers', { searchParams: params })
      .json<polygon.TickerOutput>()
  }

  /**
   * List all ticker types that Polygon.io has.
   *
   * @param params - input parameters (`asset_class` and `locale`)
   * @returns promise that resolves to ticker types
   */
  async tickerTypes(params: polygon.TickerTypesInput = {}) {
    return this.ky
      .get('v3/reference/tickers/types', { searchParams: params })
      .json<polygon.TickerTypesOutput>()
  }

  /**
   * Get the most recent news articles relating to a stock ticker symbol.
   *
   * @param params - input parameters (`ticker`, `published_utc`, `order`, `limit`, `sort`)
   * @returns promise that resolves to ticker news
   */
  async tickerNews(params: polygon.TickerNewsInput) {
    return this.ky
      .get('v2/reference/news', { searchParams: params })
      .json<polygon.TickerNewsOutput>()
  }

  /**
   * Returns the current trading status of the exchanges and overall financial markets.
   *
   * @returns promise that resolves to the market status
   */
  async marketStatus() {
    return this.ky.get('v1/marketstatus/now').json<polygon.MarketStatusOutput>()
  }

  /**
   * Gets upcoming market holidays and their open/close times.
   *
   * @returns promise that resolves to an array of market holidays
   */
  async marketHolidays(): Promise<polygon.MarketHolidayOutput[]> {
    return this.ky
      .get('v1/marketstatus/upcoming')
      .json<polygon.MarketHolidayOutput[]>()
  }

  /**
   * List all exchanges that Polygon.io knows about.
   *
   * @param params - input parameters (`asset_class`, `locale`)
   * @returns promise that resolves to list of exchanges
   */
  async exchanges(params: polygon.ExchangesInput = {}) {
    return this.ky
      .get('v3/reference/exchanges', { searchParams: params })
      .json<polygon.ExchangesOutput>()
  }

  /**
   * Get aggregate bars for a stock over a given date range in custom time window sizes.
   *
   * @param params - input parameters
   * @returns promise that resolves to list of aggregates
   */
  async aggregates(params: polygon.AggregatesInput) {
    const { ticker, multiplier, timespan, from, to, ...otherParams } = params
    const endpoint = `v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`
    return this.ky
      .get(endpoint, { searchParams: otherParams })
      .json<polygon.AggregatesOutput>()
  }

  /**
   * Get the daily open, high, low, and close (OHLC) for the entire markets.
   *
   * @param assetClass - the asset class to get data for
   * @param params - input parameters (`date`, `adjusted`, `include_otc`)
   * @returns promise that resolves to list of aggregates
   */
  async groupedDaily(
    assetClass: 'stocks',
    params: polygon.GroupedDailyInputStocks
  ): Promise<polygon.GroupedDailyOutput>

  /**
   * Get the daily open, high, low, and close (OHLC) for the entire markets.
   *
   * @param assetClass - the asset class to get data for
   * @param params - input parameters (`date`, `adjusted`)
   * @returns promise that resolves to list of aggregates
   */
  async groupedDaily(
    assetClass: polygon.ASSET_CLASS,
    params: polygon.GroupedDailyInput
  ) {
    const { date, ...otherParams } = params
    const endpoint = `v2/aggs/grouped/locale/us/market/${assetClass}/${date}`
    return this.ky
      .get(endpoint, { searchParams: otherParams })
      .json<polygon.GroupedDailyOutput>()
  }
}
