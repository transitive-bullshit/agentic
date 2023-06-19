import defaultKy from 'ky'

/**
 * Base URL endpoint for the Novu API.
 */
export const NOVU_API_BASE_URL = 'https://api.novu.co/v1'

export type NovuSubscriber = {
  /**
   * Unique identifier for the subscriber. This can be any value that is meaningful to your application such as a user ID stored in your database or a unique email address.
   */
  subscriberId: string

  /**
   * Email address of the subscriber.
   */
  email?: string

  /**
   * First name of the subscriber.
   */
  firstName?: string

  /**
   * Last name of the subscriber.
   */
  lastName?: string

  /**
   * Phone number of the subscriber.
   */
  phone?: string
}

/**
 * Response from the Novu API when triggering an event.
 */
export type NovuTriggerEventResponse = {
  /**
   * Data about the triggered event.
   */
  data: {
    /**
     * Whether the trigger was acknowledged or not.
     */
    acknowledged?: boolean

    /**
     * Status for trigger.
     */
    status?: string

    /**
     * Transaction id for trigger.
     */
    transactionId?: string

    /**
     * In case of an error, this field will contain the error message.
     */
    error?: Array<any>
  }
}

/**
 * Options for triggering an event in Novu.
 */
export type NovuTriggerOptions = {
  /**
   * Name of the event to trigger. This should match the name of an existing notification template in Novu.
   */
  name: string

  /**
   * Payload to use for the event. This will be used to populate any handlebars placeholders in the notification template.
   */
  payload: Record<string, unknown>

  /**
   * List of subscribers to send the notification to. Each subscriber must at least have a unique `subscriberId` to identify them in Novu and, if not already known to Novu, an `email` address or `phone` number depending on the notification template being used.
   */
  to: NovuSubscriber[]
}

/**
 * Client for interacting with the Novu API.
 */
export class NovuClient {
  /**
   * Instance of ky for making requests to the Novu API.
   */
  api: typeof defaultKy

  /**
   * API key to use for authenticating requests to the Novu API.
   */
  apiKey: string

  /**
   * Base URL endpoint for the Novu API.
   */
  apiBaseUrl: string

  /**
   * Novu API client constructor.
   */
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

  /**
   * Triggers an event in Novu.
   *
   * @returns response from the Novu API containing details about the triggered event.
   */
  async triggerEvent({ name, payload, to }: NovuTriggerOptions) {
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
