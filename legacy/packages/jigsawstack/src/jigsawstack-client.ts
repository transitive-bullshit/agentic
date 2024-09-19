import { AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import ky, { type KyInstance } from 'ky'

export namespace jigsawstack {
  export interface BaseResponse {
    success: boolean
  }

  export const API_BASE_URL = 'https://api.jigsawstack.com/v1/'

  export interface SearchParams {
    query: string
    ai_overview?: boolean
    safe_search?: 'moderate' | 'strict' | 'off'
    spell_check?: boolean
  }

  export interface SearchResponse extends BaseResponse {
    query: string
    spell_fixed: string
    is_safe: boolean
    ai_overview: string
    results: {
      title: string
      url: string
      description: string
      content: string
      is_safe: boolean
      site_name: string
      site_long_name: string
      age: string
      language: string
      favicon: string
      snippets: string[]
      related_index: []
    }[]
  }

  export interface CookieParameter {
    name: string
    value: string
    url?: string
    domain?: string
    path?: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: 'Strict' | 'Lax' | 'None'
    expires?: boolean
    priority?: string
    sameParty?: boolean
  }

  export interface ScrapeParams {
    url: string
    element_prompts: string[]
    http_headers?: object
    reject_request_pattern?: string[]
    goto_options?: {
      timeout: number
      wait_until: string
    }
    wait_for?: {
      mode: string
      value: string | number
    }
    advance_config?: {
      console: boolean
      network: boolean
      cookies: boolean
    }
    size_preset?: string
    is_mobile?: boolean
    scale?: number
    width?: number
    height?: number
    cookies?: Array<CookieParameter>
  }

  export interface ScrapeResponse extends BaseResponse {
    data: any
  }

  export interface VOCRParams {
    prompt: string | string[]
    url?: string
    file_store_key?: string
  }

  export interface VOCRResponse extends BaseResponse {
    context: string
    width: number
    height: number
    tags: string[]
    has_text: boolean
    sections: Array<any>
  }

  export interface TextToSqlParams {
    prompt: string
    sql_schema?: string
    file_store_key?: string
  }

  export interface TextToSqlResponse extends BaseResponse {
    sql: string
  }

  export interface SpeechToTextParams {
    url?: string
    file_store_key?: string
    language?: string
    translate?: boolean
    by_speaker?: boolean
    webhook_url?: string
  }

  export interface SpeechToTextResponse extends BaseResponse {
    text: string
    chunks: Array<{
      timestamp: number[]
      text: string
    }>
    status?: 'processing' | 'error'
    id?: string
  }
}

/**
 * Basic JigsawStack API wrapper.
 */
export class JigsawStackClient extends AIFunctionsProvider {
  protected readonly apiKey: string
  protected readonly ky: KyInstance
  constructor({
    apiKey = getEnv('JIGSAWSTACK_API_KEY'),
    timeoutMs = 60_000
  }: {
    apiKey?: string
    throttle?: boolean
    timeoutMs?: number
  } = {}) {
    assert(
      apiKey,
      'Please set the JIGSAWSTACK_API_KEY environment variable or pass it to the constructor as the apiKey field.'
    )
    super()
    this.apiKey = apiKey
    this.ky = ky.extend({
      prefixUrl: jigsawstack.API_BASE_URL,
      timeout: timeoutMs,
      headers: {
        'x-api-key': this.apiKey
      }
    })
  }

  async aiSearch(params: jigsawstack.SearchParams) {
    return this.ky
      .get('web/search', {
        searchParams: {
          ...params
        }
      })
      .json<jigsawstack.SearchResponse>()
  }

  async aiScrape(params: jigsawstack.ScrapeParams) {
    return this.ky
      .post('ai/scrape', {
        json: {
          ...params
        }
      })
      .json<jigsawstack.ScrapeResponse>()
  }

  async vocr(params: jigsawstack.VOCRParams) {
    return this.ky
      .post('vocr', {
        json: {
          ...params
        }
      })
      .json<jigsawstack.VOCRResponse>()
  }

  async textToSql(
    params: jigsawstack.TextToSqlParams
  ): Promise<jigsawstack.TextToSqlResponse> {
    return this.ky
      .post('ai/sql', {
        json: {
          ...params
        }
      })
      .json<jigsawstack.TextToSqlResponse>()
  }

  async speechToText(
    params: jigsawstack.SpeechToTextParams
  ): Promise<jigsawstack.SpeechToTextResponse> {
    return this.ky
      .post('ai/transcribe', {
        json: {
          ...params
        }
      })
      .json<jigsawstack.SpeechToTextResponse>()
  }
}
