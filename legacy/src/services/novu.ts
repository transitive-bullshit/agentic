import defaultKy from 'ky'

export const NOVU_API_BASE_URL = 'https://api.novu.co/v1'

export type NovuSubscriber = {
  subscriberId: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
}

export type NovuTriggerEventResponse = {
  data: {
    acknowledged?: boolean
    status?: string
    transactionId?: string
  }
}

export class NovuClient {
  api: typeof defaultKy

  apiKey: string
  apiBaseUrl: string

  constructor({
    apiKey = process.env.NOVU_API_KEY,
    apiBaseUrl = NOVU_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error NovuClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.api = ky.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  async triggerEvent({
    name,
    payload,
    to
  }: {
    name: string
    payload: Record<string, unknown>
    to: NovuSubscriber[]
  }) {
    return this.api
      .post('events/trigger', {
        headers: {
          Authorization: `ApiKey ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        json: {
          name,
          payload,
          to
        }
      })
      .json<NovuTriggerEventResponse>()
  }
}
