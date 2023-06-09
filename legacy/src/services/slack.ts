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

export interface SlackBotMessage {
  bot_id: string
  type: string
  text: string
  user: string
  ts: string
  app_id: string
  blocks: Record<string, unknown>[]
  team: string
  bot_profile: SlackBotProfile
}

export interface SlackReplies {
  messages: SlackMessage[]
  has_more: boolean
  ok: boolean
  response_metadata: SlackResponseMetadata
}

export interface SlackMessage {
  client_msg_id?: string
  type: string
  text: string
  user: string
  ts: string
  blocks?: Record<string, unknown>[]
  reply_count?: number
  subscribed?: boolean
  last_read?: string
  unread_count?: number
  team?: string
  thread_ts: string
  parent_user_id?: string
}

export interface SlackResponseMetadata {
  next_cursor: string
}

export type SlackSendMessageOptions = {
  /**
   * The text of the message to send.
   */
  text: string

  /**
   * The channel ID to send the message to.
   */
  channelId: string
}

export type SlackSendAndWaitOptions = {
  /**
   * The text of the message to send.
   */
  text: string

  /**
   * The channel ID to send the message to.
   */
  channelId: string

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
}

export class SlackClient {
  private api: typeof ky

  constructor({
    apiKey = process.env.SLACK_API_KEY,
    baseUrl = SLACK_API_BASE_URL
  }: {
    apiKey?: string
    baseUrl?: string
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
  }

  /**
   * Sends a message to a channel.
   */
  public async sendMessage({ text, channelId }: SlackSendMessageOptions) {
    const res = await this.api.post('chat.postMessage', {
      json: {
        channel: channelId,
        text: text
      }
    })
    return res.json<SlackBotMessage>()
  }

  /**
   * Fetches replies to a message in a channel.
   */
  protected async fetchReplies(channelId: string, messageTs: string) {
    const response = await this.api.get('conversations.replies', {
      searchParams: {
        channel: channelId,
        ts: messageTs
      }
    })
    return response.json<SlackReplies>()
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
    channelId,
    timeoutMs = DEFAULT_SLACK_TIMEOUT_MS,
    intervalMs = DEFAULT_SLACK_INTERVAL_MS,
    validate = () => true
  }: SlackSendAndWaitOptions) {
    const res = await this.sendMessage({ text, channelId })
    if (!res.ts) {
      throw new Error('Missing ts in response')
    }
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const response = await this.fetchReplies(channelId, res.ts)
      if (response.ok && response.messages.length > 1) {
        // first message is the original message
        const candidate = response.messages[response.messages.length - 1]
        if (validate(candidate)) {
          return candidate
        } else {
          await this.sendMessage({
            text: `Invalid response: ${candidate.text}. Please try again with a valid response format.`,
            channelId
          })
        }
      }
      await sleep(intervalMs)
    }
    throw new Error('Reached timeout waiting for reply')
  }
}
