import { aiFunction, AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace novu {
  export const API_BASE_URL = 'https://api.novu.co/v1'

  /**
   * Novu subscriber object.
   */
  export type Subscriber = {
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
   *
   * @see {@link https://docs.novu.co/api/client-libraries#trigger-event}
   */
  export type TriggerEventResponse = {
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
  export type TriggerOptions = {
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
    to: Subscriber[]
  }
}

/**
 * The Novu API provides a router for sending notifications across different
 * channels like Email, SMS, Chat, In-App, and Push.
 *
 * @see https://novu.co
 */
export class NovuClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('NOVU_API_KEY'),
    apiBaseUrl = novu.API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'NovuClient missing required "apiKey" (defaults to "NOVU_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl,
      headers: {
        Authorization: `ApiKey ${this.apiKey}`
      }
    })
  }

  /**
   * Triggers an event in Novu.
   *
   * @see https://docs.novu.co/api-reference/events/trigger-event
   */
  @aiFunction({
    name: 'novu_trigger_event',
    description:
      'Sends a notification to a person given their novu `subscriberId` and an `email` or `phone` number. Useful for sending emails or SMS text messages to people.',
    inputSchema: z.object({
      name: z.string(),
      // TODO: make this more
      payload: z.record(z.any()),
      to: z.array(
        z.object({
          subscriberId: z.string(),
          email: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          phone: z.string().optional()
        })
      )
    })
  })
  async triggerEvent(options: novu.TriggerOptions) {
    return this.ky
      .post('events/trigger', {
        json: options
      })
      .json<novu.TriggerEventResponse>()
  }
}
