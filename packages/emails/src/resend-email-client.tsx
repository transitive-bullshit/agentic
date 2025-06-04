import { assert } from '@agentic/platform-core'
import React from 'react'
import { Resend as ResendClient } from 'resend'

import SendVerifyCodeEmail from './emails/send-verify-code-email'

export class ResendEmailClient {
  protected readonly resend: ResendClient
  protected readonly from: string

  constructor({
    apiKey,
    from = 'Agentic <no-reply@notifications.agentic.so>'
  }: {
    apiKey: string
    from?: string
  }) {
    assert(apiKey, 'ResendEmailClient missing required "apiKey"')
    this.resend = new ResendClient(apiKey)
    this.from = from
  }

  async sendVerifyCodeEmail({
    code,
    to
  }: {
    code: string
    to: string
  }): Promise<string> {
    const result = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Verify your email address',
      text: 'Verify your email address',
      react: <SendVerifyCodeEmail code={code} />
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    assert(result.data?.id, 'Failed to send verify code email')
    return result.data.id
  }
}
