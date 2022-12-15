import delay from 'delay'
import html2md from 'html-to-md'
import pTimeout from 'p-timeout'
import type { Browser, HTTPRequest, HTTPResponse, Page } from 'puppeteer'

import { getBrowser, getOpenAIAuth } from './openai-auth'
import { isRelevantRequest, maximizePage, minimizePage } from './utils'

export class ChatGPTAPIBrowser {
  protected _markdown: boolean
  protected _debug: boolean
  protected _isGoogleLogin: boolean
  protected _captchaToken: string

  protected _email: string
  protected _password: string

  protected _browser: Browser
  protected _page: Page

  /**
   * Creates a new client wrapper for automating the ChatGPT webapp.
   */
  constructor(opts: {
    email: string
    password: string

    /** @defaultValue `true` **/
    markdown?: boolean

    /** @defaultValue `false` **/
    debug?: boolean

    isGoogleLogin?: boolean
    captchaToken?: string
  }) {
    const {
      email,
      password,
      markdown = true,
      debug = false,
      isGoogleLogin = false,
      captchaToken
    } = opts

    this._email = email
    this._password = password

    this._markdown = !!markdown
    this._debug = !!debug
    this._isGoogleLogin = !!isGoogleLogin
    this._captchaToken = captchaToken
  }

  async init() {
    if (this._browser) {
      await this._browser.close()
      this._page = null
      this._browser = null
    }

    try {
      this._browser = await getBrowser({ captchaToken: this._captchaToken })
      this._page =
        (await this._browser.pages())[0] || (await this._browser.newPage())

      // bypass cloudflare and login
      await getOpenAIAuth({
        email: this._email,
        password: this._password,
        browser: this._browser,
        page: this._page,
        isGoogleLogin: this._isGoogleLogin
      })
    } catch (err) {
      if (this._browser) {
        await this._browser.close()
      }

      this._browser = null
      this._page = null

      throw err
    }

    const chatUrl = 'https://chat.openai.com/chat'
    const url = this._page.url().replace(/\/$/, '')

    if (url !== chatUrl) {
      await this._page.goto(chatUrl, {
        waitUntil: 'networkidle0'
      })
    }

    // dismiss welcome modal
    do {
      const modalSelector = '[data-headlessui-state="open"]'

      if (!(await this._page.$(modalSelector))) {
        break
      }

      try {
        await this._page.click(`${modalSelector} button:last-child`)
      } catch (err) {
        // "next" button not found in welcome modal
        break
      }

      await delay(500)
    } while (true)

    if (!this.getIsAuthenticated()) {
      return false
    }

    await minimizePage(this._page)

    this._page.on('request', this._onRequest.bind(this))
    this._page.on('response', this._onResponse.bind(this))

    return true
  }

  _onRequest = (request: HTTPRequest) => {
    const url = request.url()
    if (!isRelevantRequest(url)) {
      return
    }

    const method = request.method()
    let body: any

    if (method === 'POST') {
      body = request.postData()

      try {
        body = JSON.parse(body)
      } catch (_) {}

      // if (url.endsWith('/conversation') && typeof body === 'object') {
      //   const conversationBody: types.ConversationJSONBody = body
      //   const conversationId = conversationBody.conversation_id
      //   const parentMessageId = conversationBody.parent_message_id
      //   const messageId = conversationBody.messages?.[0]?.id
      //   const prompt = conversationBody.messages?.[0]?.content?.parts?.[0]

      //   // TODO: store this info for the current sendMessage request
      // }
    }

    if (this._debug) {
      console.log('\nrequest', {
        url,
        method,
        headers: request.headers(),
        body
      })
    }
  }

  _onResponse = async (response: HTTPResponse) => {
    const request = response.request()

    const url = response.url()
    if (!isRelevantRequest(url)) {
      return
    }

    const status = response.status()

    let body: any
    try {
      body = await response.json()
    } catch (_) {}

    if (this._debug) {
      console.log('\nresponse', {
        url,
        ok: response.ok(),
        status,
        statusText: response.statusText(),
        headers: response.headers(),
        body,
        request: {
          method: request.method(),
          headers: request.headers(),
          body: request.postData()
        }
      })
    }

    if (url.endsWith('/conversation')) {
      if (status === 403) {
        await this.handle403Error()
      }
    } else if (url.endsWith('api/auth/session')) {
      if (status === 403) {
        await this.handle403Error()
      }
    }
  }

  async handle403Error() {
    console.log(`ChatGPT "${this._email}" session expired; refreshing...`)
    try {
      await maximizePage(this._page)
      await this._page.reload({
        waitUntil: 'networkidle0',
        timeout: 2 * 60 * 1000 // 2 minutes
      })
      await minimizePage(this._page)
    } catch (err) {
      console.error(
        `ChatGPT "${this._email}" error refreshing session`,
        err.toString()
      )
    }
  }

  async getIsAuthenticated() {
    try {
      const inputBox = await this._getInputBox()
      return !!inputBox
    } catch (err) {
      // can happen when navigating during login
      return false
    }
  }

  async getLastMessage(): Promise<string | null> {
    const messages = await this.getMessages()

    if (messages) {
      return messages[messages.length - 1]
    } else {
      return null
    }
  }

  async getPrompts(): Promise<string[]> {
    // Get all prompts
    const messages = await this._page.$$(
      '.text-base:has(.whitespace-pre-wrap):not(:has(button:nth-child(2))) .whitespace-pre-wrap'
    )

    // Prompts are always plaintext
    return Promise.all(messages.map((a) => a.evaluate((el) => el.textContent)))
  }

  async getMessages(): Promise<string[]> {
    // Get all complete messages
    // (in-progress messages that are being streamed back don't contain action buttons)
    const messages = await this._page.$$(
      '.text-base:has(.whitespace-pre-wrap):has(button:nth-child(2)) .whitespace-pre-wrap'
    )

    if (this._markdown) {
      const htmlMessages = await Promise.all(
        messages.map((a) => a.evaluate((el) => el.innerHTML))
      )

      const markdownMessages = htmlMessages.map((messageHtml) => {
        // parse markdown from message HTML
        messageHtml = messageHtml.replace('Copy code</button>', '</button>')
        return html2md(messageHtml, {
          ignoreTags: [
            'button',
            'svg',
            'style',
            'form',
            'noscript',
            'script',
            'meta',
            'head'
          ],
          skipTags: ['button', 'svg']
        })
      })

      return markdownMessages
    } else {
      // plaintext
      const plaintextMessages = await Promise.all(
        messages.map((a) => a.evaluate((el) => el.textContent))
      )
      return plaintextMessages
    }
  }

  async sendMessage(
    message: string,
    opts: {
      timeoutMs?: number
    } = {}
  ): Promise<string> {
    const { timeoutMs } = opts

    const inputBox = await this._getInputBox()
    if (!inputBox) throw new Error('not signed in')

    const lastMessage = await this.getLastMessage()

    await inputBox.focus()
    const paragraphs = message.split('\n')
    for (let i = 0; i < paragraphs.length; i++) {
      await inputBox.type(paragraphs[i], { delay: 0 })
      if (i < paragraphs.length - 1) {
        await this._page.keyboard.down('Shift')
        await inputBox.press('Enter')
        await this._page.keyboard.up('Shift')
      } else {
        await inputBox.press('Enter')
      }
    }

    const responseP = new Promise<string>(async (resolve, reject) => {
      try {
        do {
          await delay(1000)

          // TODO: this logic needs some work because we can have repeat messages...
          const newLastMessage = await this.getLastMessage()
          if (
            newLastMessage &&
            lastMessage?.toLowerCase() !== newLastMessage?.toLowerCase()
          ) {
            return resolve(newLastMessage)
          }
        } while (true)
      } catch (err) {
        return reject(err)
      }
    })

    if (timeoutMs) {
      return pTimeout(responseP, {
        milliseconds: timeoutMs
      })
    } else {
      return responseP
    }
  }

  async resetThread() {
    const resetButton = await this._page.$('nav > a:nth-child(1)')
    if (!resetButton) throw new Error('not signed in')

    await resetButton.click()
  }

  async close() {
    await this._browser.close()
    this._page = null
    this._browser = null
  }

  protected async _getInputBox() {
    // [data-id="root"]
    return this._page.$('textarea')
  }
}
