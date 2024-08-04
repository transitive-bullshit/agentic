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

// TODO: need to expose more aiFunctions

export namespace slack {
  export const API_BASE_URL = 'https://slack.com/api'

  export const DEFAULT_TIMEOUT_MS = 120_000
  export const DEFAULT_INTERVAL_MS = 5000

  export interface BotProfile {
    id: string
    app_id: string
    name: string
    icons: Record<string, unknown>
    deleted: boolean
    updated: number
    team_id: string
  }

  export interface Replies {
    messages: Message[]
    has_more: boolean
    ok: boolean
    response_metadata: ResponseMetadata
  }

  export interface Message {
    bot_id?: string
    client_msg_id?: string
    type: string
    text: string
    user: string
    ts: string
    app_id?: string
    blocks?: Record<string, unknown>[]
    reply_count?: number
    subscribed?: boolean
    last_read?: string
    unread_count?: number
    team?: string
    thread_ts: string
    parent_user_id?: string
    bot_profile?: BotProfile
  }

  export interface ResponseMetadata {
    next_cursor: string
  }

  export type Attachment = {
    [key: string]: any
  }

  export type Block = {
    [key: string]: any
  }

  /**
   * Parameters for the Slack API's `chat.postMessage` method.
   *
   * @see {@link https://api.slack.com/methods/chat.postMessage}
   */
  export type PostMessageParams = {
    /**
     * The formatted text of the message to be published.
     */
    text: string

    /**
     * Channel, private group, or IM channel to send the message to. Can be an encoded ID, or a name.
     */
    channel?: string

    /**
     * Provide another message's ts value to make this message a reply. Avoid using a reply's ts value; use its parent instead.
     */
    thread_ts?: string

    /**
     * A JSON-based array of structured attachments, presented as a URL-encoded string.
     */
    attachments?: Attachment[]

    /**
     * A JSON-based array of structured blocks, presented as a URL-encoded string.
     */
    blocks?: Block[]

    /**
     * Emoji to use as the icon for this message. Overrides icon_url.
     */
    icon_emoji?: string

    /**
     * URL to an image to use as the icon for this message.
     */
    icon_url?: string

    /**
     * If set to true, user group handles (to name just one example) will be linked in the message text.
     */
    link_names?: boolean

    /**
     * Change how messages are treated (default: 'none').
     */
    parse?: 'full' | 'none'

    /**
     * Used in conjunction with thread_ts and indicates whether reply should be made visible to everyone in the channel or conversation.
     */
    reply_broadcast?: boolean

    /**
     * Pass true to enable unfurling of primarily text-based content.
     */
    unfurl_links?: boolean

    /**
     * Pass false to disable unfurling of media content.
     */
    unfurl_media?: boolean

    /**
     * Set your bot's user name.
     */
    username?: string
  }

  /**
   * Parameters for the Slack API's `conversations.history` method.
   *
   * @see {@link https://api.slack.com/methods/conversations.history}
   */
  export type ConversationHistoryParams = {
    /**
     * The conversation ID to fetch history for.
     */
    channel: string

    /**
     * Only messages after this Unix timestamp will be included in results (default: `0`).
     */
    oldest?: string

    /**
     * The cursor value used for pagination of results (default: first page).
     */
    cursor?: string

    /**
     * Only messages before this Unix timestamp will be included in results (default: now).
     */
    latest?: string

    /**
     * The maximum number of items to return (default: `100`).
     */
    limit?: number

    /**
     * Include messages with the oldest or latest timestamps in results. Ignored unless either timestamp is specified (default: `false`).
     */
    inclusive?: boolean

    /**
     * Return all metadata associated with the messages (default: `false`).
     */
    include_all_metadata?: boolean
  }

  /**
   * Parameters for the Slack API's `conversations.replies` method.
   *
   * @see {@link https://api.slack.com/methods/conversations.replies}
   */
  export type ConversationRepliesParams = {
    /**
     * The conversation ID to fetch the thread from.
     */
    channel: string

    /**
     * Unique identifier of either a thread’s parent message or a message in the thread.
     *
     * ### Notes
     *
     * -   ts must be the timestamp of an existing message with 0 or more replies.
     * -   If there are no replies then just the single message referenced by ts will return - it is just an ordinary, unthreaded message.
     */
    ts: string

    /**
     * The cursor value used for pagination of results.
     * Set this to the `next_cursor` attribute returned by a previous request's response_metadata.
     */
    cursor?: string

    /**
     * Only messages before this Unix timestamp will be included in results.
     */
    latest?: string

    /**
     * Only messages after this Unix timestamp will be included in results.
     */
    oddest?: string

    /**
     * The maximum number of items to return.
     * Fewer than the requested number of items may be returned, even if the end of the users list hasn't been reached.
     */
    limit?: number

    /**
     * Include messages with the oldest or latest timestamps in results. Ignored unless either timestamp is specified.
     */
    inclusive?: boolean

    /**
     * Return all metadata associated with this message.
     */
    include_thread_metadata?: boolean
  }

  export type SendAndWaitOptions = {
    /**
     * The text of the message to send.
     */
    text: string

    /**
     * The ID of the channel to send the message to.
     */
    channel?: string

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
    validate?: (message: Message) => boolean

    /**
     * A stop signal from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), which can be used to abort retrying. More specifically, when `AbortController.abort(reason)` is called, the function will throw an error with the `reason` argument as the error message.
     */
    stopSignal?: AbortSignal
  }
}

/**
 * Minimal Slack API client for sending and receiving Slack messages.
 *
 * @see https://api.slack.com/docs
 */
export class SlackClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly defaultChannel?: string

  constructor({
    apiKey = getEnv('SLACK_API_KEY'),
    apiBaseUrl = slack.API_BASE_URL,
    defaultChannel = getEnv('SLACK_DEFAULT_CHANNEL'),
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    defaultChannel?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'SlackClient missing required "apiKey" (defaults to "SLACK_API_KEY")'
    )

    super()

    this.defaultChannel = defaultChannel

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  /**
   * Sends a message to a channel.
   */
  @aiFunction({
    name: 'slack_send_message',
    description: 'Sends a slack message to a slack channel',
    inputSchema: z.object({
      text: z
        .string()
        .describe('Formatted text of the message to be published.'),
      channel: z
        .string()
        .describe(
          'Channel, private group, or IM channel to send the message to. Can be an encoded ID, or a name.'
        )
    })
  })
  public async sendMessage(options: slack.PostMessageParams) {
    if (!options.channel && !this.defaultChannel) {
      throw new Error('Error no channel specified')
    }

    return this.ky
      .post('chat.postMessage', {
        json: {
          channel: this.defaultChannel,
          ...options
        }
      })
      .json<slack.Message>()
  }

  /**
   * Fetches a conversation's history of messages and events.
   */
  public async fetchConversationHistory(
    options: slack.ConversationHistoryParams
  ) {
    return this.ky
      .get('conversations.history', {
        searchParams: options
      })
      .json<slack.Replies>()
  }

  /**
   * Fetches replies to a message in a channel.
   */
  protected async fetchReplies(options: slack.ConversationRepliesParams) {
    return this.ky
      .get('conversations.replies', {
        searchParams: options
      })
      .json<slack.Replies>()
  }

  /**
   * Returns a list of messages that were sent in a channel after a given
   * timestamp both directly and in threads.
   */
  private async fetchCandidates(channel: string, ts: string) {
    const history = await this.fetchConversationHistory({ channel })
    const directReplies = await this.fetchReplies({ channel, ts })

    let candidates: slack.Message[] = []

    if (directReplies.ok) {
      candidates = candidates.concat(directReplies.messages)
    }

    if (history.ok) {
      candidates = candidates.concat(history.messages)
    }

    // Filter out older messages before the message was sent and drop bot messages:
    candidates = candidates.filter(
      (message) => message.ts > ts && !message.bot_id
    )

    // Sort by timestamp so that the most recent messages come first:
    candidates.sort((a, b) => {
      return Number.parseFloat(b.ts) - Number.parseFloat(a.ts)
    })

    return candidates
  }

  /**
   * Sends a message to a channel and waits for a reply to the message, which
   * is returned if it passes validation.
   */
  public async sendMessageAndWaitForReply({
    text,
    channel = this.defaultChannel,
    timeoutMs = slack.DEFAULT_TIMEOUT_MS,
    intervalMs = slack.DEFAULT_INTERVAL_MS,
    validate = () => true,
    stopSignal
  }: slack.SendAndWaitOptions) {
    if (!channel) {
      throw new Error('SlackClient missing required "channel"')
    }

    let aborted = false
    stopSignal?.addEventListener(
      'abort',
      () => {
        aborted = true
      },
      { once: true }
    )

    const res = await this.sendMessage({ text, channel })

    if (!res.ts) {
      throw new Error('Missing ts in response')
    }

    const start = Date.now()
    let nUserMessages = 0

    do {
      if (aborted) {
        const reason = stopSignal?.reason || 'Aborted waiting for reply'

        if (reason instanceof Error) {
          throw reason
        } else {
          throw new TypeError(reason)
        }
      }

      const candidates = await this.fetchCandidates(channel, res.ts)

      if (candidates.length > 0) {
        const candidate = candidates[0]!

        if (validate(candidate)) {
          return candidate
        }

        if (nUserMessages !== candidates.length) {
          await this.sendMessage({
            text: `Invalid response: ${candidate.text}. Please try again following the instructions.`,
            channel,
            thread_ts: candidate.ts
          })
        }

        nUserMessages = candidates.length
      }

      await delay(intervalMs)
    } while (Date.now() - start < timeoutMs)

    throw new TimeoutError('SlackClient timed out waiting for reply')
  }
}
