import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  delay,
  getEnv,
  TimeoutError
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace twilio {
  export const CONVERSATION_API_BASE_URL = 'https://conversations.twilio.com/v1'

  export const DEFAULT_TIMEOUT_MS = 1_800_000
  export const DEFAULT_INTERVAL_MS = 5000
  export const DEFAULT_BOT_NAME = 'agentic'

  /**
   * Twilio recommends keeping SMS messages to a length of 320 characters or less, so we'll use that as the maximum.
   *
   * @see {@link https://support.twilio.com/hc/en-us/articles/360033806753-Maximum-Message-Length-with-Twilio-Programmable-Messaging}
   */
  export const SMS_LENGTH_SOFT_LIMIT = 320
  export const SMS_LENGTH_HARD_LIMIT = 1600

  export interface Conversation {
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
    links: ConversationLinks
  }

  export interface ConversationLinks {
    participants: string
    messages: string
    webhooks: string
  }

  export interface ConversationMessage {
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

  export interface ConversationParticipant {
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
    messaging_binding: ConversationMessagingBinding
  }

  export interface ConversationMessagingBinding {
    proxy_address: string
    type: string
    address: string
  }

  export interface ConversationMessages {
    messages: ConversationMessage[]
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

  /**
   * Participant Conversation Resource.
   *
   * This interface represents a participant in a conversation, along with the conversation details.
   */
  export interface ParticipantConversation {
    /** The unique ID of the Account responsible for this conversation. */
    account_sid: string

    /** The unique ID of the Conversation Service this conversation belongs to. */
    chat_service_sid: string

    /** The unique ID of the Participant. */
    participant_sid: string

    /** The unique string that identifies the conversation participant as Conversation User. */
    participant_user_sid: string

    /**
     * A unique string identifier for the conversation participant as Conversation User.
     * This parameter is non-null if (and only if) the participant is using the Conversations SDK to communicate.
     */
    participant_identity: string

    /**
     * Information about how this participant exchanges messages with the conversation.
     * A JSON parameter consisting of type and address fields of the participant.
     */
    participant_messaging_binding: object

    /** The unique ID of the Conversation this Participant belongs to. */
    conversation_sid: string

    /** An application-defined string that uniquely identifies the Conversation resource. */
    conversation_unique_name: string

    /** The human-readable name of this conversation, limited to 256 characters. */
    conversation_friendly_name: string

    /**
     * An optional string metadata field you can use to store any data you wish.
     * The string value must contain structurally valid JSON if specified.
     */
    conversation_attributes: string

    /** The date that this conversation was created, given in ISO 8601 format. */
    conversation_date_created: string

    /** The date that this conversation was last updated, given in ISO 8601 format. */
    conversation_date_updated: string

    /** Identity of the creator of this Conversation. */
    conversation_created_by: string

    /** The current state of this User Conversation. One of inactive, active or closed. */
    conversation_state: 'inactive' | 'active' | 'closed'

    /** Timer date values representing state update for this conversation. */
    conversation_timers: object

    /** Contains absolute URLs to access the participant and conversation of this conversation. */
    links: { participant: string; conversation: string }
  }

  export type SendAndWaitOptions = {
    /**
     * The recipient's phone number in E.164 format (e.g. +14565551234).
     */
    recipientPhoneNumber?: string

    /**
     * The text of the message to send (or an array of strings to send as separate messages).
     */
    text: string | string[]

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
    validate?: (message: ConversationMessage) => boolean

    /**
     * A stop signal from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), which can be used to abort retrying. More specifically, when `AbortController.abort(reason)` is called, the function will throw an error with the `reason` argument as the error message.
     */
    stopSignal?: AbortSignal
  }

  /**
   * Chunks a string into an array of chunks.
   *
   * @param text - string to chunk
   * @param maxLength - maximum length of each chunk
   *
   * @returns array of chunks
   */
  export function chunkString(text: string, maxLength: number): string[] {
    const words = text.split(' ')
    const chunks: string[] = []
    let chunk = ''

    for (const word of words) {
      if (word.length > maxLength) {
        // Truncate the word if it's too long and indicate that it was truncated:
        chunks.push(word.slice(0, Math.max(0, maxLength - 3)) + '...')
      } else if ((chunk + ' ' + word).length > maxLength) {
        chunks.push(chunk.trim())
        chunk = word
      } else {
        chunk += (chunk ? ' ' : '') + word
      }
    }

    if (chunk) {
      chunks.push(chunk.trim())
    }

    return chunks
  }

  /**
   * Chunks an array of strings into an array of chunks while preserving
   * existing sections.
   *
   * @param textSections - array of strings to chunk
   * @param maxLength - maximum length of each chunk
   *
   * @returns array of chunks
   */
  export function chunkMultipleStrings(
    textSections: string[],
    maxLength: number
  ): string[] {
    return textSections.flatMap((section) => chunkString(section, maxLength))
  }
}

/**
 * A client for interacting with the Twilio Conversations API to send automated
 * messages and wait for replies.
 *
 * @see {@link https://www.twilio.com/docs/conversations/api}
 */
export class TwilioClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly phoneNumber: string
  protected readonly botName: string
  protected readonly defaultRecipientPhoneNumber?: string

  constructor({
    accountSid = getEnv('TWILIO_ACCOUNT_SID'),
    authToken = getEnv('TWILIO_AUTH_TOKEN'),
    phoneNumber = getEnv('TWILIO_PHONE_NUMBER'),
    defaultRecipientPhoneNumber = getEnv(
      'TWILIO_DEFAULT_RECIPIENT_PHONE_NUMBER'
    ),
    apiBaseUrl = twilio.CONVERSATION_API_BASE_URL,
    botName = twilio.DEFAULT_BOT_NAME,
    ky = defaultKy
  }: {
    accountSid?: string
    authToken?: string
    phoneNumber?: string
    defaultRecipientPhoneNumber?: string
    apiBaseUrl?: string
    botName?: string
    ky?: KyInstance
  } = {}) {
    assert(
      accountSid,
      'TwilioClient missing required "accountSid" (defaults to "TWILIO_ACCOUNT_SID")'
    )
    assert(
      authToken,
      'TwilioClient missing required "authToken" (defaults to "TWILIO_AUTH_TOKEN")'
    )
    assert(
      phoneNumber,
      'TwilioClient missing required "phoneNumber" (defaults to "TWILIO_PHONE_NUMBER")'
    )
    super()

    if (defaultRecipientPhoneNumber) {
      this.defaultRecipientPhoneNumber = defaultRecipientPhoneNumber
    }

    this.botName = botName
    this.phoneNumber = phoneNumber

    this.ky = ky.extend({
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
    return this.ky.delete(`Conversations/${conversationSid}`)
  }

  /**
   * Removes a participant from a conversation.
   */
  async removeParticipant({
    conversationSid,
    participantSid
  }: {
    conversationSid: string
    participantSid: string
  }) {
    return this.ky.delete(
      `Conversations/${conversationSid}/Participants/${participantSid}`
    )
  }

  /**
   * Fetches all conversations a participant as identified by their phone number is a part of.
   */
  async findParticipantConversations(participantPhoneNumber: string) {
    const encodedPhoneNumber = encodeURIComponent(participantPhoneNumber)
    return this.ky
      .get(`ParticipantConversations?Address=${encodedPhoneNumber}`)
      .json<{ conversations: twilio.ParticipantConversation[] }>()
  }

  /**
   * Creates a new conversation.
   */
  async createConversation(friendlyName: string) {
    const params = new URLSearchParams()
    params.set('FriendlyName', friendlyName)
    return this.ky
      .post('Conversations', {
        body: params
      })
      .json<twilio.Conversation>()
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
    return this.ky
      .post(`Conversations/${conversationSid}/Participants`, {
        body: params
      })
      .json<twilio.ConversationParticipant>()
  }

  /**
   * Chunks a long text message into smaller parts and sends them as separate messages.
   */
  async sendTextWithChunking({
    conversationSid,
    text
  }: {
    conversationSid: string
    text: string | string[]
    maxChunkLength?: number
  }) {
    let chunks
    if (Array.isArray(text)) {
      chunks = twilio.chunkMultipleStrings(text, twilio.SMS_LENGTH_SOFT_LIMIT)
    } else {
      chunks = twilio.chunkString(text, twilio.SMS_LENGTH_SOFT_LIMIT)
    }

    const out: twilio.ConversationMessage[] = []
    for (const chunk of chunks) {
      const sent = await this.sendMessage({
        conversationSid,
        text: chunk
      })
      out.push(sent)
    }

    return out
  }

  /**
   * Posts a message to a conversation.
   */
  @aiFunction({
    name: 'twilio_send_message',
    description:
      'Sends an text SMS message via the Twilio Conversation API to a specific conversation.',
    inputSchema: z.object({
      text: z
        .string()
        .describe(
          'Text of the SMS content to sent. Must be brief as SMS has strict character limits.'
        ),
      conversationSid: z
        .string()
        .describe('ID of the Twilio Conversation to the send the emssage to.')
    })
  })
  async sendMessage({
    conversationSid,
    text
  }: {
    conversationSid: string
    text: string
  }) {
    // Truncate the text if it exceeds the hard limit and add an ellipsis:
    if (text.length > twilio.SMS_LENGTH_HARD_LIMIT) {
      text =
        text.slice(0, Math.max(0, twilio.SMS_LENGTH_HARD_LIMIT - 3)) + '...'
    }

    const params = new URLSearchParams()
    params.set('Body', text)
    params.set('Author', this.botName)
    return this.ky
      .post(`Conversations/${conversationSid}/Messages`, {
        body: params
      })
      .json<twilio.ConversationMessage>()
  }

  /**
   * Fetches all messages in a conversation.
   */
  @aiFunction({
    name: 'twilio_get_messages',
    description:
      'Retrieves all SMS messages contained within a specific Twilio Conversation.',
    inputSchema: z.object({
      conversationSid: z
        .string()
        .describe(
          'ID of the Twilio Conversation to the retrieve the messages for.'
        )
    })
  })
  async fetchMessages(
    conversationSidOrOptions: string | { conversationSid: string }
  ) {
    const conversationSid =
      typeof conversationSidOrOptions === 'string'
        ? conversationSidOrOptions
        : conversationSidOrOptions.conversationSid

    return this.ky
      .get(`Conversations/${conversationSid}/Messages`)
      .json<twilio.ConversationMessages>()
  }

  /**
   * Sends a SMS to a recipient and waits for a reply to the message, which is returned if it passes validation.
   */
  public async sendAndWaitForReply({
    text,
    name,
    recipientPhoneNumber = this.defaultRecipientPhoneNumber,
    timeoutMs = twilio.DEFAULT_TIMEOUT_MS,
    intervalMs = twilio.DEFAULT_INTERVAL_MS,
    validate = () => true,
    stopSignal
  }: twilio.SendAndWaitOptions) {
    if (!recipientPhoneNumber) {
      throw new Error(
        'TwilioClient error missing required "recipientPhoneNumber"'
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

    // Find and remove participant from conversation they are currently in, if any:
    const { conversations } =
      await this.findParticipantConversations(recipientPhoneNumber)

    for (const conversation of conversations) {
      await this.removeParticipant({
        conversationSid: conversation.conversation_sid,
        participantSid: conversation.participant_sid
      })
    }

    const { sid: participantSid } = await this.addParticipant({
      conversationSid,
      recipientPhoneNumber
    })
    await this.sendTextWithChunking({ conversationSid, text })

    const start = Date.now()
    let nUserMessages = 0

    do {
      if (aborted) {
        await this.removeParticipant({ conversationSid, participantSid })
        const reason = stopSignal?.reason || 'Aborted waiting for reply'

        if (reason instanceof Error) {
          throw reason
        } else {
          throw new TypeError(reason)
        }
      }

      const response = await this.fetchMessages(conversationSid)
      const candidates = response.messages.filter(
        (message) => message.author !== this.botName
      )

      if (candidates.length > 0) {
        const candidate = candidates.at(-1)!

        if (candidate && validate(candidate)) {
          await this.removeParticipant({ conversationSid, participantSid })
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

      await delay(intervalMs)
    } while (Date.now() - start < timeoutMs)

    await this.removeParticipant({ conversationSid, participantSid })
    throw new TimeoutError('Twilio timeout waiting for reply')
  }
}
