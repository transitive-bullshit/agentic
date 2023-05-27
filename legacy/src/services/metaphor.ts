import ky from 'ky'

export type MetaphorSearchResult = {
  author: string | null
  dateCreated: string | null
  title: string | null
  score: number
  url: string
}

export type MetaphorSearchResponse = {
  results: MetaphorSearchResult[]
}

export class MetaphorClient {
  apiKey: string
  baseUrl: string

  constructor({
    apiKey = process.env.METAPHOR_API_KEY,
    baseUrl = 'https://api.metaphor.systems'
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

  async search({
    query,
    numResults = 10
  }: {
    query: string
    numResults?: number
  }) {
    return ky
      .post(`${this.baseUrl}/search`, {
        headers: {
          'x-api-key': this.apiKey
        },
        json: {
          query,
          numResults
        }
      })
      .json<MetaphorSearchResponse>()
  }
}
