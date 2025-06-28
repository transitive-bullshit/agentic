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

import { slack } from './slack'

// TODO: need to expose more aiFunctions

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
