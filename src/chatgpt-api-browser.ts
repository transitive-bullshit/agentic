import delay from 'delay'
import type { Browser, HTTPRequest, HTTPResponse, Page } from 'puppeteer'
import { v4 as uuidv4 } from 'uuid'

import * as types from './types'
import { AChatGPTAPI } from './abstract-chatgpt-api'
import { getBrowser, getOpenAIAuth } from './openai-auth'
import {
  browserPostEventStream,
  isRelevantRequest,
  markdownToText,
  maximizePage,
  minimizePage
} from './utils'

const CHAT_PAGE_URL = 'https://chat.openai.com/chat'

export class ChatGPTAPIBrowser extends AChatGPTAPI {
  protected _markdown: boolean
  protected _debug: boolean
  protected _minimize: boolean
  protected _isGoogleLogin: boolean
  protected _isMicrosoftLogin: boolean
  protected _captchaToken: string
  protected _nopechaKey: string
  protected _accessToken: string

  protected _email: string
  protected _password: string

  protected _executablePath: string
  protected _browser: Browser
  protected _page: Page
  protected _proxyServer: string
  protected _isRefreshing: boolean

  /**
   * Creates a new client for automating the ChatGPT webapp.
   */
  constructor(opts: {
    email: string
    password: string

    /** @defaultValue `true` **/
    markdown?: boolean

    /** @defaultValue `false` **/
    debug?: boolean

    /** @defaultValue `false` **/
    isGoogleLogin?: boolean

    /** @defaultValue `false` **/
    isMicrosoftLogin?: boolean

    /** @defaultValue `true` **/
    minimize?: boolean

    /** @defaultValue `undefined` **/
    captchaToken?: string

    /** @defaultValue `undefined` **/
    nopechaKey?: string

    /** @defaultValue `undefined` **/
    executablePath?: string

    /** @defaultValue `undefined` **/
    proxyServer?: string
  }) {
    super()

    const {
      email,
      password,
      markdown = true,
      debug = false,
      isGoogleLogin = false,
      isMicrosoftLogin = false,
      minimize = true,
      captchaToken,
      nopechaKey,
      executablePath,
      proxyServer
    } = opts

    this._email = email
    this._password = password

    this._markdown = !!markdown
    this._debug = !!debug
    this._isGoogleLogin = !!isGoogleLogin
    this._isMicrosoftLogin = !!isMicrosoftLogin
    this._minimize = !!minimize
    this._captchaToken = captchaToken
    this._nopechaKey = nopechaKey
    this._executablePath = executablePath
    this._proxyServer = proxyServer
    this._isRefreshing = false

    if (!this._email) {
      const error = new types.ChatGPTError('ChatGPT invalid email')
      error.statusCode = 401
      throw error
    }

    if (!this._password) {
      const error = new types.ChatGPTError('ChatGPT invalid password')
      error.statusCode = 401
      throw error
    }
  }

  override async initSession() {
    if (this._browser) {
      await this.closeSession()
    }

    try {
      this._browser = await getBrowser({
        captchaToken: this._captchaToken,
        nopechaKey: this._nopechaKey,
        executablePath: this._executablePath,
        proxyServer: this._proxyServer,
        minimize: this._minimize
      })
      this._page =
        (await this._browser.pages())[0] || (await this._browser.newPage())

      if (this._proxyServer && this._proxyServer.includes('@')) {
        try {
          const proxyUsername = this._proxyServer.split('@')[0].split(':')[0]
          const proxyPassword = this._proxyServer.split('@')[0].split(':')[1]

          await this._page.authenticate({
            username: proxyUsername,
            password: proxyPassword
          })
        } catch (err) {
          console.error(
            `Proxy "${this._proxyServer}" throws an error at authenticating`,
            err.toString()
          )
        }
      }

      // bypass annoying popup modals
      this._page.evaluateOnNewDocument(() => {
        window.localStorage.setItem('oai/apps/hasSeenOnboarding/chat', 'true')
        window.localStorage.setItem(
          'oai/apps/hasSeenReleaseAnnouncement/2022-12-15',
          'true'
        )
      })

      // await maximizePage(this._page)

      this._page.on('request', this._onRequest.bind(this))
      this._page.on('response', this._onResponse.bind(this))

      // bypass cloudflare and login
      const authInfo = await getOpenAIAuth({
        email: this._email,
        password: this._password,
        browser: this._browser,
        page: this._page,
        isGoogleLogin: this._isGoogleLogin,
        isMicrosoftLogin: this._isMicrosoftLogin
      })

      if (this._debug) {
        console.log('chatgpt', this._email, 'auth', authInfo)
      }
    } catch (err) {
      if (this._browser) {
        await this._browser.close()
      }

      this._browser = null
      this._page = null

      throw err
    }

    if (!this.isChatPage || this._isGoogleLogin || this._isMicrosoftLogin) {
      await this._page.goto(CHAT_PAGE_URL, {
        waitUntil: 'networkidle2'
      })
    }

    // dismiss welcome modal (and other modals)
    do {
      const modalSelector = '[data-headlessui-state="open"]'

      try {
        if (!(await this._page.$(modalSelector))) {
          break
        }

        await this._page.click(`${modalSelector} button:last-child`)
      } catch (err) {
        // "next" button not found in welcome modal
        break
      }

      await delay(300)
    } while (true)

    if (!(await this.getIsAuthenticated())) {
      throw new types.ChatGPTError('Failed to authenticate session')
    }

    if (this._minimize) {
      return minimizePage(this._page)
    }
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
        console.log(`ChatGPT "${this._email}" error 403...`)
        // this will be handled in the sendMessage error handler
        // await this.refreshSession()
      }
    } else if (url.endsWith('api/auth/session')) {
      if (status === 401) {
        console.log(`ChatGPT "${this._email}" error 401...`)
        // this will be handled in the sendMessage error handler
        // await this.resetSession()
      } else if (status === 403) {
        console.log(`ChatGPT "${this._email}" error 403...`)
        // this will be handled in the sendMessage error handler
        // await this.refreshSession()
      } else {
        const session: types.SessionResult = body

        if (session?.accessToken) {
          this._accessToken = session.accessToken
        }
      }
    }
  }

  /**
   * Attempts to handle 401 errors by re-authenticating.
   */
  async resetSession() {
    console.log(`ChatGPT "${this._email}" resetSession...`)
    try {
      console.log('>>> closing session', this._email)
      await this.closeSession()
      console.log('<<< closing session', this._email)
      await this.initSession()
      console.log(`ChatGPT "${this._email}" refreshSession success`)
    } catch (err) {
      console.error(
        `ChatGPT "${this._email}" resetSession error`,
        err.toString()
      )
    }
  }

  /**
   * Attempts to handle 403 errors by refreshing the page.
   */
  async refreshSession() {
    if (this._isRefreshing) {
      return
    }

    this._isRefreshing = true
    console.log(`ChatGPT "${this._email}" refreshSession...`)

    try {
      if (!this._minimize) {
        await maximizePage(this._page)
      }

      await this._page.reload()

      let response
      const timeout = 120000 // 2 minutes in milliseconds

      try {
        // Wait for a response that includes the 'cf_clearance' cookie
        response = await this._page.waitForResponse(
          (response) => {
            const cookie = response.headers()['set-cookie']
            if (cookie?.includes('cf_clearance=')) {
              const cfClearance = cookie
                .split('cf_clearance=')?.[1]
                ?.split(';')?.[0]
              // console.log('Cloudflare Cookie:', cfClearance)
              return true
            }
            return false
          },
          { timeout }
        )
      } catch (err) {
        // Useful for when cloudflare cookie is still valid, to catch TimeoutError
        response = !!(await this._getInputBox())
      }

      if (!response) {
        throw new types.ChatGPTError('Could not fetch cf_clearance cookie')
      }

      if (this._minimize && this.isChatPage) {
        await minimizePage(this._page)
      }

      console.log(`ChatGPT "${this._email}" refreshSession success`)
    } catch (err) {
      console.error(
        `ChatGPT "${this._email}" error refreshing session`,
        err.toString()
      )
    } finally {
      this._isRefreshing = false
    }
  }

  async getIsAuthenticated() {
    try {
      if (!this._accessToken) {
        return false
      }

      const inputBox = await this._getInputBox()
      return !!inputBox
    } catch (err) {
      // can happen when navigating during login
      return false
    }
  }

  // async getLastMessage(): Promise<string | null> {
  //   const messages = await this.getMessages()

  //   if (messages) {
  //     return messages[messages.length - 1]
  //   } else {
  //     return null
  //   }
  // }

  // async getPrompts(): Promise<string[]> {
  //   // Get all prompts
  //   const messages = await this._page.$$(
  //     '.text-base:has(.whitespace-pre-wrap):not(:has(button:nth-child(2))) .whitespace-pre-wrap'
  //   )

  //   // Prompts are always plaintext
  //   return Promise.all(messages.map((a) => a.evaluate((el) => el.textContent)))
  // }

  // async getMessages(): Promise<string[]> {
  //   // Get all complete messages
  //   // (in-progress messages that are being streamed back don't contain action buttons)
  //   const messages = await this._page.$$(
  //     '.text-base:has(.whitespace-pre-wrap):has(button:nth-child(2)) .whitespace-pre-wrap'
  //   )

  //   if (this._markdown) {
  //     const htmlMessages = await Promise.all(
  //       messages.map((a) => a.evaluate((el) => el.innerHTML))
  //     )

  //     const markdownMessages = htmlMessages.map((messageHtml) => {
  //       // parse markdown from message HTML
  //       messageHtml = messageHtml
  //         .replaceAll('Copy code</button>', '</button>')
  //         .replace(/Copy code\s*<\/button>/gim, '</button>')

  //       return html2md(messageHtml, {
  //         ignoreTags: [
  //           'button',
  //           'svg',
  //           'style',
  //           'form',
  //           'noscript',
  //           'script',
  //           'meta',
  //           'head'
  //         ],
  //         skipTags: ['button', 'svg']
  //       })
  //     })

  //     return markdownMessages
  //   } else {
  //     // plaintext
  //     const plaintextMessages = await Promise.all(
  //       messages.map((a) => a.evaluate((el) => el.textContent))
  //     )
  //     return plaintextMessages
  //   }
  // }

  override async sendMessage(
    message: string,
    opts: types.SendMessageOptions = {}
  ): Promise<types.ChatResponse> {
    const {
      conversationId,
      parentMessageId = uuidv4(),
      messageId = uuidv4(),
      action = 'next',
      timeoutMs
      // TODO
      // onProgress
    } = opts

    const url = `https://chat.openai.com/backend-api/conversation`
    const body: types.ConversationJSONBody = {
      action,
      messages: [
        {
          id: messageId,
          role: 'user',
          content: {
            content_type: 'text',
            parts: [message]
          }
        }
      ],
      model: 'text-davinci-002-render',
      parent_message_id: parentMessageId
    }

    if (conversationId) {
      body.conversation_id = conversationId
    }

    let result: types.ChatResponse | types.ChatError
    let numTries = 0
    let is401 = false

    do {
      if (is401 || !(await this.getIsAuthenticated())) {
        console.log(`chatgpt re-authenticating ${this._email}`)

        try {
          await this.resetSession()
        } catch (err) {
          console.warn(
            `chatgpt error re-authenticating ${this._email}`,
            err.toString()
          )
        }

        if (!(await this.getIsAuthenticated())) {
          const error = new types.ChatGPTError('Not signed in')
          error.statusCode = 401
          throw error
        }
      }

      try {
        // console.log('>>> EVALUATE', url, this._accessToken, body)
        result = await this._page.evaluate(
          browserPostEventStream,
          url,
          this._accessToken,
          body,
          timeoutMs
        )
      } catch (err) {
        // We catch all errors in `browserPostEventStream`, so this should really
        // only happen if the page is refreshed or closed during its invocation.
        // This may happen if we encounter a 401/403 and refresh the page in it's
        // response handler or if the user has closed the page manually.

        if (++numTries >= 2) {
          const error = new types.ChatGPTError(err.toString())
          error.statusCode = err.response?.statusCode
          error.statusText = err.response?.statusText
          throw error
        }

        console.warn('chatgpt sendMessage error; retrying...', err.toString())
        await delay(5000)
        continue
      }

      if ('error' in result) {
        const error = new types.ChatGPTError(result.error.message)
        error.statusCode = result.error.statusCode
        error.statusText = result.error.statusText

        ++numTries

        if (error.statusCode === 401) {
          is401 = true

          if (numTries >= 2) {
            throw error
          } else {
            continue
          }
        } else if (error.statusCode !== 403) {
          throw error
        } else if (numTries >= 2) {
          await this.refreshSession()
          throw error
        } else {
          await this.refreshSession()
          await delay(1000)
          result = null
          continue
        }
      } else {
        if (!this._markdown) {
          result.response = markdownToText(result.response)
        }

        return result
      }
    } while (!result)

    // console.log('<<< EVALUATE', result)

    // const lastMessage = await this.getLastMessage()

    // await inputBox.focus()
    // const paragraphs = message.split('\n')
    // for (let i = 0; i < paragraphs.length; i++) {
    //   await inputBox.type(paragraphs[i], { delay: 0 })
    //   if (i < paragraphs.length - 1) {
    //     await this._page.keyboard.down('Shift')
    //     await inputBox.press('Enter')
    //     await this._page.keyboard.up('Shift')
    //   } else {
    //     await inputBox.press('Enter')
    //   }
    // }

    // const responseP = new Promise<string>(async (resolve, reject) => {
    //   try {
    //     do {
    //       await delay(1000)

    //       // TODO: this logic needs some work because we can have repeat messages...
    //       const newLastMessage = await this.getLastMessage()
    //       if (
    //         newLastMessage &&
    //         lastMessage?.toLowerCase() !== newLastMessage?.toLowerCase()
    //       ) {
    //         return resolve(newLastMessage)
    //       }
    //     } while (true)
    //   } catch (err) {
    //     return reject(err)
    //   }
    // })

    // if (timeoutMs) {
    //   return pTimeout(responseP, {
    //     milliseconds: timeoutMs
    //   })
    // } else {
    //   return responseP
    // }
  }

  async resetThread() {
    try {
      await this._page.click('nav > a:nth-child(1)')
    } catch (err) {
      // ignore for now
    }
  }

  override async closeSession() {
    try {
      if (this._page) {
        this._page.off('request', this._onRequest.bind(this))
        this._page.off('response', this._onResponse.bind(this))

        await this._page.deleteCookie({
          name: 'cf_clearance',
          domain: '.chat.openai.com'
        })

        // TODO; test this
        // const client = await this._page.target().createCDPSession()
        // await client.send('Network.clearBrowserCookies')
        // await client.send('Network.clearBrowserCache')

        await this._page.close()
      }
    } catch (err) {
      console.warn('closeSession error', err)
    }

    if (this._browser) {
      const pages = await this._browser.pages()
      for (const page of pages) {
        await page.close()
      }

      await this._browser.close()

      // Rule number 1 of zombie process hunting: double-tap
      if (this._browser.process()) {
        this._browser.process().kill('SIGINT')
      }
    }

    this._page = null
    this._browser = null
    this._accessToken = null
  }

  protected async _getInputBox() {
    try {
      return await this._page.$('textarea')
    } catch (err) {
      return null
    }
  }

  get isChatPage(): boolean {
    try {
      const url = this._page?.url().replace(/\/$/, '')
      return url === CHAT_PAGE_URL
    } catch (err) {
      return false
    }
  }
}
