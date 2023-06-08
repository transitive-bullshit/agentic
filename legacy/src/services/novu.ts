import ky from 'ky'

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
  apiKey: string
  baseUrl: string

  constructor({
    apiKey = process.env.NOVU_API_KEY,
    baseUrl = 'https://api.novu.co/v1'
  }: {
    apiKey?: string
    baseUrl?: string
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error NovuClient missing required "apiKey"`)
    }
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async triggerEvent(
    name: string,
    payload: Record<string, unknown>,
    to: NovuSubscriber[]
  ) {
    const url = `${this.baseUrl}/events/trigger`
    const headers = {
      Authorization: `ApiKey ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
    const body = JSON.stringify({
      name,
      payload,
      to
    })
    const response = await ky.post(url, {
      headers,
      body
    })
    return response.json<NovuTriggerEventResponse>()
  }
}
