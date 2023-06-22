import defaultKy from 'ky'

export const POLYGON_API_BASE_URL = 'https://api.polygon.io'

/**
 * Ticker Details v3 input parameters.
 *
 * @see {@link https://polygon.io/docs/stocks/get_v3_reference_tickers__ticker}
 */
export type TickerDetailsInput = {
  /**
   * The ticker symbol of the asset.
   */
  ticker: string

  /**
   * Specify a point in time to get information about the ticker available on that date (formatted as YYYY-MM-DD).
   */
  date?: string
}

/**
 * Daily Open/Close input parameters.
 *
 * @see {@link https://polygon.io/docs/stocks/get_v1_open-close__stocksticker___date}
 */
export type DailyOpenCloseInput = {
  /**
   * The ticker symbol of the stock/equity.
   */
  ticker: string

  /**
   * The date of the requested open/close in the format YYYY-MM-DD.
   */
  date: string

  /**
   * Whether or not the results are adjusted for splits. By default, results are adjusted.
   */
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

export class PolygonClient {
  /**
   * HTTP client for the Polygon API.
   */
  readonly api: typeof defaultKy

  /**
   * Polygon API key.
   */
  readonly apiKey: string

  /**
   * Polygon API base URL.
   */
  readonly apiBaseUrl: string

  constructor({
    apiKey = process.env.POLYGON_API_KEY,
    apiBaseUrl = POLYGON_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error PolygonClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.api = ky.extend({
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
  async getTickerDetails(params: TickerDetailsInput) {
    let searchParams
    if (params.date) {
      searchParams = {
        date: params.date
      }
    }

    return this.api
      .get(`v3/reference/tickers/${params.ticker}`, {
        searchParams
      })
      .json<TickerDetailsOutput>()
  }

  /**
   * Returns the open, close and after hours prices of a stock symbol on a certain date.
   *
   * @param params - input parameters (`ticker` symbol and `date`)
   * @returns promise that resolves to the open, close and after hours prices of a stock symbol on a certain date
   */
  async getDailyOpenClose(params: DailyOpenCloseInput) {
    return this.api
      .get(`v1/open-close/${params.ticker}/${params.date}`, {
        searchParams: {
          adjusted: params.adjusted ?? true
        }
      })
      .json<DailyOpenCloseOutput>()
  }

  /**
   * Returns the previous day's open, high, low, and close (OHLC) for the specified stock ticker.
   *
   * @see {@link https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__prev}
   *
   * @param ticker - ticker symbol of the stock/equity
   * @param adjusted - whether or not the results are adjusted for splits
   * @returns promise that resolves to the previous day's open, high, low, and close (OHLC) for the specified stock ticker
   */
  async getPreviousClose(ticker: string, adjusted = true) {
    return this.api
      .get(`v2/aggs/ticker/${ticker}/prev`, {
        searchParams: {
          adjusted
        }
      })
      .json<PreviousCloseOutput>()
  }
}
