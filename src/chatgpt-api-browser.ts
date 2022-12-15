import delay from 'delay'
import html2md from 'html-to-md'
import { type Browser, type HTTPResponse, type Page } from 'puppeteer'

import * as types from './types'
import { getBrowser, getOpenAIAuth } from './openai-auth'

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

    // this._page.on('response', this._onResponse.bind(this))
    return true
  }

  // _onResponse = (response: HTTPResponse) => {
  //   const request = response.request()

  //   console.log('response', {
  //     url: response.url(),
  //     ok: response.ok(),
  //     status: response.status(),
  //     statusText: response.statusText(),
  //     headers: response.headers(),
  //     request: {
  //       method: request.method(),
  //       headers: request.headers()
  //     }
  //   })
  // }

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

  async sendMessage(message: string): Promise<string> {
    const inputBox = await this._getInputBox()
    if (!inputBox) throw new Error('not signed in')

    const lastMessage = await this.getLastMessage()

    await inputBox.click()
    await inputBox.type(message, { delay: 0 })
    await inputBox.press('Enter')

    do {
      await delay(1000)

      // TODO: this logic needs some work because we can have repeat messages...
      const newLastMessage = await this.getLastMessage()
      if (
        newLastMessage &&
        lastMessage?.toLowerCase() !== newLastMessage?.toLowerCase()
      ) {
        return newLastMessage
      }
    } while (true)
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
