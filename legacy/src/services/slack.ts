import ky from 'ky'

import { sleep } from '@/utils'

export const SLACK_API_BASE_URL = 'https://slack.com/api'

export const DEFAULT_SLACK_TIMEOUT_MS = 120_000
export const DEFAULT_SLACK_INTERVAL_MS = 5_000

export interface SlackBotProfile {
  id: string
  app_id: string
  name: string
  icons: Record<string, unknown>
  deleted: boolean
  updated: number
  team_id: string
}

export interface SlackReplies {
  messages: SlackMessage[]
  has_more: boolean
  ok: boolean
  response_metadata: SlackResponseMetadata
}

export interface SlackMessage {
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
  bot_profile?: SlackBotProfile
}

export interface SlackResponseMetadata {
  next_cursor: string
}

export type SlackAttachment = {
  [key: string]: any
}

export type SlackBlock = {
  [key: string]: any
}

export type SlackPostMessageParams = {
  /**
   * The ID of the channel to send the message to.
   */
  channel: string

  /**
   * The text of the message to send.
   */
  text: string

  /**
   * The timestamp of a parent message to send the message as a reply to.
   */
  thread_ts?: string
  attachments?: SlackAttachment[]
  blocks?: SlackBlock[]
  icon_emoji?: string
  icon_url?: string
  link_names?: boolean
  parse?: 'full' | 'none'
  reply_broadcast?: boolean
  unfurl_links?: boolean
  unfurl_media?: boolean
  username?: string
}

export type SlackConversationHistoryParams = {
  channel: string
  oldest?: string
  cursor?: string
  latest?: string
  limit?: number
  inclusive?: boolean
  include_all_metadata?: boolean
}

export type SlackConversationRepliesParams = {
  channel: string
  ts: string
  cursor?: string
  latest?: string
  oddest?: string
  limit?: number
  inclusive?: boolean
  include_thread_metadata?: boolean
}

export type SlackSendAndWaitOptions = {
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
  validate?: (message: SlackMessage) => boolean

  /**
   * A stop signal from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), which can be used to abort retrying. More specifically, when `AbortController.abort(reason)` is called, the function will throw an error with the `reason` argument as the error message.
   */
  stopSignal?: AbortSignal
}

export class SlackClient {
  private api: typeof ky

  protected defaultChannel?: string

  constructor({
    apiKey = process.env.SLACK_API_KEY,
    baseUrl = SLACK_API_BASE_URL,
    defaultChannel = process.env.SLACK_DEFAULT_CHANNEL
  }: {
    apiKey?: string
    baseUrl?: string
    defaultChannel?: string
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error SlackClient missing required "apiKey"`)
    }
    this.api = ky.create({
      prefixUrl: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
    this.defaultChannel = defaultChannel
  }

  /**
   * Sends a message to a channel.
   */
  public async sendMessage(options: SlackPostMessageParams) {
    const res = await this.api.post('chat.postMessage', {
      json: options
    })
    return res.json<SlackMessage>()
  }

  /**
   * Fetches a conversation's history of messages and events.
   */
  public async fetchConversationHistory(
    options: SlackConversationHistoryParams
  ) {
    const response = await this.api.get('conversations.history', {
      searchParams: options
    })
    return response.json<SlackReplies>()
  }

  /**
   * Fetches replies to a message in a channel.
   */
  protected async fetchReplies(options: SlackConversationRepliesParams) {
    const response = await this.api.get('conversations.replies', {
      searchParams: options
    })
    return response.json<SlackReplies>()
  }

  /**
   * Returns a list of messages that were sent in a channel after a given timestamp both directly and in threads.
   */
  private async fetchCandidates(channel: string, ts: string) {
    let candidates: SlackMessage[] = []
    const history = await this.fetchConversationHistory({ channel })
    const directReplies = await this.fetchReplies({ channel, ts })
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
      return parseFloat(b.ts) - parseFloat(a.ts)
    })
    return candidates
  }

  /**
   * Sends a message to a channel and waits for a reply to the message, which is returned if it passes validation.
   *
   * ### Notes
   *
   * -   The implementation will poll for replies to the message until the timeout is reached. This is not ideal, but it is the only way to retrieve replies to a message in Slack without spinning up a local server to receive webhook events.
   */
  public async sendAndWaitForReply({
    text,
    channel = this.defaultChannel,
    timeoutMs = DEFAULT_SLACK_TIMEOUT_MS,
    intervalMs = DEFAULT_SLACK_INTERVAL_MS,
    validate = () => true,
    stopSignal
  }: SlackSendAndWaitOptions) {
    if (!channel) {
      throw new Error(`Error SlackClient missing required "channel"`)
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
          throw new Error(reason)
        }
      }
      const candidates = await this.fetchCandidates(channel, res.ts)
      if (candidates.length > 0) {
        const candidate = candidates[0]
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
      await sleep(intervalMs)
    } while (Date.now() - start < timeoutMs)
    throw new Error('Reached timeout waiting for reply')
  }
}
