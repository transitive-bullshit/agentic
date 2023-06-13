import defaultKy from 'ky'

import { DEFAULT_BOT_NAME } from '@/constants'
import { sleep } from '@/utils'

export const TWILIO_CONVERSATION_API_BASE_URL =
  'https://conversations.twilio.com/v1'

export const DEFAULT_TWILIO_TIMEOUT_MS = 120_000
export const DEFAULT_TWILIO_INTERVAL_MS = 5_000

export interface TwilioConversation {
  unique_name?: string
  date_updated: Date
  friendly_name: string
  timers: null
  account_sid: string
  url: string
  state: string
  date_created: Date
  messaging_service_sid: string
  sid: string
  attributes: string
  bindings: null
  chat_service_sid: string
  links: TwilioConversationLinks
}

export interface TwilioConversationLinks {
  participants: string
  messages: string
  webhooks: string
}

export interface TwilioConversationMessage {
  body: string
  index: number
  author: string
  date_updated: Date
  media: null
  participant_sid: string | null
  conversation_sid: string
  account_sid: string
  delivery: null
  url: string
  date_created: Date
  content_sid: string | null
  sid: string
  attributes: string
  links: {
    delivery_receipts: string
  }
}

export interface TwilioConversationParticipant {
  last_read_message_index: null
  date_updated: Date
  last_read_timestamp: null
  conversation_sid: string
  account_sid: string
  url: string
  date_created: Date
  role_sid: string
  sid: string
  attributes: string
  identity?: string
  messaging_binding: TwilioConversationMessagingBinding
}

export interface TwilioConversationMessagingBinding {
  proxy_address: string
  type: string
  address: string
}

export interface TwilioConversationMessages {
  messages: TwilioConversationMessage[]
  meta: {
    page: number
    page_size: number
    first_page_url: string
    previous_page_url: string | null
    url: string
    next_page_url: string | null
    key: string
  }
}

export type TwilioSendAndWaitOptions = {
  /**
   * The recipient's phone number in E.164 format (e.g. +14565551234).
   */
  recipientPhoneNumber?: string

  /**
   * The text of the message to send.
   */
  text: string

  /**
   * Friendly name of the conversation.
   */
  name: string

  /**
   * The timeout in milliseconds to wait for a reply before throwing an error.
   */
  timeoutMs?: number

  /**
   * The interval in milliseconds to poll for replies.
   */
  intervalMs?: number

  /**
   * A function to validate the reply message. If the function returns `true`, the reply is considered valid and the function will return the message. If the function returns `false`, the reply is considered invalid and the function will continue to wait for a reply until the timeout is reached.
   */
  validate?: (message: TwilioConversationMessage) => boolean

  /**
   * A stop signal from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), which can be used to abort retrying. More specifically, when `AbortController.abort(reason)` is called, the function will throw an error with the `reason` argument as the error message.
   */
  stopSignal?: AbortSignal
}

/**
 * A client for interacting with the Twilio Conversations API to send automated messages and wait for replies.
 *
 * @see {@link https://www.twilio.com/docs/conversations/api}
 */
export class TwilioConversationClient {
  api: typeof defaultKy

  phoneNumber: string
  botName: string
  defaultRecipientPhoneNumber?: string

  constructor({
    accountSid = process.env.TWILIO_ACCOUNT_SID,
    authToken = process.env.TWILIO_AUTH_TOKEN,
    phoneNumber = process.env.TWILIO_PHONE_NUMBER,
    defaultRecipientPhoneNumber = process.env
      .TWILIO_DEFAULT_RECIPIENT_PHONE_NUMBER,
    apiBaseUrl = TWILIO_CONVERSATION_API_BASE_URL,
    botName = DEFAULT_BOT_NAME,
    ky = defaultKy
  }: {
    accountSid?: string
    authToken?: string
    phoneNumber?: string
    defaultRecipientPhoneNumber?: string
    apiBaseUrl?: string
    botName?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!accountSid) {
      throw new Error(
        `Error TwilioConversationClient missing required "accountSid"`
      )
    }

    if (!authToken) {
      throw new Error(
        `Error TwilioConversationClient missing required "authToken"`
      )
    }

    if (!phoneNumber) {
      throw new Error(
        `Error TwilioConversationClient missing required "phoneNumber"`
      )
    }

    if (defaultRecipientPhoneNumber) {
      this.defaultRecipientPhoneNumber = defaultRecipientPhoneNumber
    }

    this.botName = botName
    this.phoneNumber = phoneNumber

    this.api = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  /**
   * Deletes a conversation and all its messages.
   */
  async deleteConversation(conversationSid: string) {
    return this.api.delete(`Conversations/${conversationSid}`)
  }

  /**
   * Creates a new conversation.
   */
  async createConversation(friendlyName: string) {
    const params = new URLSearchParams()
    params.set('FriendlyName', friendlyName)
    return this.api
      .post('Conversations', {
        body: params
      })
      .json<TwilioConversation>()
  }

  /**
   * Adds a participant to a conversation.
   */
  async addParticipant({
    conversationSid,
    recipientPhoneNumber
  }: {
    conversationSid: string
    recipientPhoneNumber: string
  }) {
    const params = new URLSearchParams()
    params.set('MessagingBinding.Address', recipientPhoneNumber)
    params.set('MessagingBinding.ProxyAddress', this.phoneNumber)
    return this.api
      .post(`Conversations/${conversationSid}/Participants`, {
        body: params
      })
      .json<TwilioConversationParticipant>()
  }

  /**
   * Posts a message to a conversation.
   */
  async sendMessage({
    conversationSid,
    text
  }: {
    conversationSid: string
    text: string
  }) {
    const params = new URLSearchParams()
    params.set('Body', text)
    params.set('Author', this.botName)
    return this.api
      .post(`Conversations/${conversationSid}/Messages`, {
        body: params
      })
      .json<TwilioConversationMessage>()
  }

  /**
   * Fetches all messages in a conversation.
   */
  async fetchMessages(conversationSid: string) {
    return this.api
      .get(`Conversations/${conversationSid}/Messages`)
      .json<TwilioConversationMessages>()
  }

  /**
   * Sends a SMS to a recipient and waits for a reply to the message, which is returned if it passes validation.
   *
   * ### Notes
   *
   * - The implementation will poll for replies to the message until the timeout is reached. This is not ideal, but it is the only way to retrieve replies without spinning up a local server to receive webhook events.
   */
  public async sendAndWaitForReply({
    text,
    name,
    recipientPhoneNumber = this.defaultRecipientPhoneNumber,
    timeoutMs = DEFAULT_TWILIO_TIMEOUT_MS,
    intervalMs = DEFAULT_TWILIO_INTERVAL_MS,
    validate = () => true,
    stopSignal
  }: TwilioSendAndWaitOptions) {
    if (!recipientPhoneNumber) {
      throw new Error(
        `Error TwilioConversationClient missing required "recipientPhoneNumber"`
      )
    }

    let aborted = false
    stopSignal?.addEventListener(
      'abort',
      () => {
        aborted = true
      },
      { once: true }
    )

    const { sid: conversationSid } = await this.createConversation(name)
    await this.addParticipant({ conversationSid, recipientPhoneNumber })
    await this.sendMessage({ conversationSid, text })

    const start = Date.now()
    let nUserMessages = 0

    do {
      if (aborted) {
        await this.deleteConversation(conversationSid)
        const reason = stopSignal?.reason || 'Aborted waiting for reply'

        if (reason instanceof Error) {
          throw reason
        } else {
          throw new Error(reason)
        }
      }

      const response = await this.fetchMessages(conversationSid)

      if (response.messages.length > 1) {
        const candidates = response.messages.filter(
          (message) => message.author !== this.botName
        )
        const candidate = candidates[candidates.length - 1]

        if (validate(candidate)) {
          await this.deleteConversation(conversationSid)
          return candidate
        }

        if (nUserMessages !== candidates.length) {
          await this.sendMessage({
            text: `Invalid response: ${candidate.body}. Please try again with a valid response format.`,
            conversationSid
          })
        }

        nUserMessages = candidates.length
      }

      await sleep(intervalMs)
    } while (Date.now() - start < timeoutMs)

    await this.deleteConversation(conversationSid)
    throw new Error('Twilio timeout waiting for reply')
  }
}
