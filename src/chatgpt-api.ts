import delay from 'delay'
import html2md from 'html-to-md'
import { type ChromiumBrowserContext, type Page, chromium } from 'playwright'

export class ChatGPTAPI {
  protected _userDataDir: string
  protected _headless: boolean
  protected _markdown: boolean
  protected _chatUrl: string

  protected _browser: ChromiumBrowserContext
  protected _page: Page

  /**
   * @param opts.userDataDir — Path to a directory for storing persistent chromium session data
   * @param opts.chatUrl — OpenAI chat URL
   * @param opts.headless - Whether or not to use headless mode
   * @param opts.markdown — Whether or not to parse chat messages as markdown
   */
  constructor(
    opts: {
      /** @defaultValue `'/tmp/chatgpt'` **/
      userDataDir?: string

      /** @defaultValue `'https://chat.openai.com/'` **/
      chatUrl?: string

      /** @defaultValue `false` **/
      headless?: boolean

      /** @defaultValue `true` **/
      markdown?: boolean
    } = {}
  ) {
    const {
      userDataDir = '/tmp/chatgpt',
      chatUrl = 'https://chat.openai.com/',
      headless = false,
      markdown = true
    } = opts

    this._userDataDir = userDataDir
    this._headless = !!headless
    this._chatUrl = chatUrl
    this._markdown = !!markdown
  }

  async init(opts: { auth?: 'blocking' | 'eager' } = {}) {
    const { auth = 'eager' } = opts

    if (this._browser) {
      await this.close()
    }

    this._browser = await chromium.launchPersistentContext(this._userDataDir, {
      headless: this._headless
    })

    this._page = await this._browser.newPage()
    await this._page.goto(this._chatUrl)

    // dismiss welcome modal
    do {
      const modalSelector = '[data-headlessui-state="open"]'

      if (!(await this._page.$(modalSelector))) {
        break
      }

      try {
        await this._page.click(`${modalSelector} button:last-child`, {
          timeout: 1000
        })
      } catch (err) {
        // "next" button not found in welcome modal
        break
      }
    } while (true)

    if (auth === 'blocking') {
      do {
        const isSignedIn = await this.getIsSignedIn()
        if (isSignedIn) {
          break
        }

        console.log(
          'Please sign in to ChatGPT using the Chromium browser window and dismiss the welcome modal...'
        )

        await delay(1000)
      } while (true)
    }

    return this._page
  }

  async getIsSignedIn() {
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
      '[class*="ConversationItem__Message"]:has([class*="ConversationItem__ActionButtons"]):has([class*="ConversationItem__Role"] [class*="Avatar__Wrapper"])'
    )

    // prompts are always plaintext
    return Promise.all(messages.map((a) => a.innerText()))
  }

  async getMessages(): Promise<string[]> {
    // Get all complete messages
    // (in-progress messages that are being streamed back don't contain action buttons)
    const messages = await this._page.$$(
      '[class*="ConversationItem__Message"]:has([class*="ConversationItem__ActionButtons"]):not(:has([class*="ConversationItem__Role"] [class*="Avatar__Wrapper"]))'
    )

    if (this._markdown) {
      const htmlMessages = await Promise.all(messages.map((a) => a.innerHTML()))

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
        messages.map((a) => a.innerText())
      )
      return plaintextMessages
    }
  }

  async sendMessage(message: string): Promise<string> {
    const inputBox = await this._getInputBox()
    if (!inputBox) throw new Error('not signed in')

    const lastMessage = await this.getLastMessage()

    await inputBox.click({ force: true })
    await inputBox.fill(message, { force: true })
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

  protected async _getInputBox(): Promise<any> {
    return this._page.$(
      'div[class*="PromptTextarea__TextareaWrapper"] textarea'
    )
  }
}
