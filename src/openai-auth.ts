import * as fs from 'node:fs'
import * as os from 'node:os'

import delay from 'delay'
import {
  type Browser,
  type ElementHandle,
  type Page,
  type Protocol,
  type PuppeteerLaunchOptions
} from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import * as types from './types'

puppeteer.use(StealthPlugin())

/**
 * Represents everything that's required to pass into `ChatGPTAPI` in order
 * to authenticate with the unofficial ChatGPT API.
 */
export type OpenAIAuth = {
  userAgent: string
  clearanceToken: string
  sessionToken: string
  cookies?: Record<string, Protocol.Network.Cookie>
}

/**
 * Bypasses OpenAI's use of Cloudflare to get the cookies required to use
 * ChatGPT. Uses Puppeteer with a stealth plugin under the hood.
 *
 * If you pass `email` and `password`, then it will log into the account and
 * include a `sessionToken` in the response.
 *
 * If you don't pass `email` and `password`, then it will just return a valid
 * `clearanceToken`.
 *
 * This can be useful because `clearanceToken` expires after ~2 hours, whereas
 * `sessionToken` generally lasts much longer. We recommend renewing your
 * `clearanceToken` every hour or so and creating a new instance of `ChatGPTAPI`
 * with your updated credentials.
 */
export async function getOpenAIAuth({
  email,
  password,
  browser,
  timeoutMs = 2 * 60 * 1000,
  isGoogleLogin = false
}: {
  email?: string
  password?: string
  browser?: Browser
  timeoutMs?: number
  isGoogleLogin?: boolean
}): Promise<OpenAIAuth> {
  let page: Page
  let origBrowser = browser

  try {
    if (!browser) {
      browser = await getBrowser()
    }

    const userAgent = await browser.userAgent()
    page = (await browser.pages())[0] || (await browser.newPage())
    page.setDefaultTimeout(timeoutMs)

    await page.goto('https://chat.openai.com/auth/login')

    await checkForChatGPTAtCapacity(page)

    // NOTE: this is where you may encounter a CAPTCHA
    var capacityLimit = await page.$('[role="alert"]')
    if (capacityLimit) {
      throw `ChatGPT is at capacity right now`
    }

    await page.waitForSelector('#__next .btn-primary', { timeout: timeoutMs })

    // once we get to this point, the Cloudflare cookies are available
    await delay(1000)

    // login as well (optional)
    if (email && password) {
      await Promise.all([
        page.click('#__next .btn-primary'),
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        })
      ])

      let submitP: Promise<void>

      if (isGoogleLogin) {
        await page.click('button[data-provider="google"]')
        await page.waitForSelector('input[type="email"]')
        await page.type('input[type="email"]', email, { delay: 10 })
        await Promise.all([
          page.waitForNavigation(),
          await page.keyboard.press('Enter')
        ])
        await page.waitForSelector('input[type="password"]', { visible: true })
        await page.type('input[type="password"]', password, { delay: 10 })
        submitP = page.keyboard.press('Enter')
      } else {
        await page.waitForSelector('#username')
        await page.type('#username', email, { delay: 10 })
        await page.click('button[type="submit"]')
        await page.waitForSelector('#password')
        await page.type('#password', password, { delay: 10 })
        submitP = page.click('button[type="submit"]')
      }

      await Promise.all([
        submitP,

        new Promise<void>((resolve, reject) => {
          let resolved = false

          async function waitForCapacityText() {
            if (resolved) {
              return
            }

            try {
              await checkForChatGPTAtCapacity(page)

              if (!resolved) {
                setTimeout(waitForCapacityText, 500)
              }
            } catch (err) {
              if (!resolved) {
                resolved = true
                return reject(err)
              }
            }
          }

          page
            .waitForNavigation({
              waitUntil: 'networkidle0'
            })
            .then(() => {
              if (!resolved) {
                resolved = true
                resolve()
              }
            })
            .catch((err) => {
              if (!resolved) {
                resolved = true
                reject(err)
              }
            })

          setTimeout(waitForCapacityText, 500)
        })
      ])
    }

    const pageCookies = await page.cookies()
    const cookies = pageCookies.reduce(
      (map, cookie) => ({ ...map, [cookie.name]: cookie }),
      {}
    )

    const authInfo: OpenAIAuth = {
      userAgent,
      clearanceToken: cookies['cf_clearance']?.value,
      sessionToken: cookies['__Secure-next-auth.session-token']?.value,
      cookies
    }

    return authInfo
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    if (origBrowser) {
      if (page) {
        await page.close()
      }
    } else if (browser) {
      await browser.close()
    }

    page = null
    browser = null
  }
}

/**
 * Launches a non-puppeteer instance of Chrome. Note that in my testing, I wasn't
 * able to use the built-in `puppeteer` version of Chromium because Cloudflare
 * recognizes it and blocks access.
 */
export async function getBrowser(launchOptions?: PuppeteerLaunchOptions) {
  return puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--exclude-switches', 'enable-automation'],
    ignoreHTTPSErrors: true,
    executablePath: defaultChromeExecutablePath(),
    ...launchOptions
  })
}

/**
 * Gets the default path to chrome's executable for the current platform.
 */
export const defaultChromeExecutablePath = (): string => {
  switch (os.platform()) {
    case 'win32':
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

    case 'darwin':
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

    default:
      /**
       * Since two (2) separate chrome releases exists on linux
       * we first do a check to ensure we're executing the right one.
       */
      const chromeExists = fs.existsSync('/usr/bin/google-chrome')

      return chromeExists
        ? '/usr/bin/google-chrome'
        : '/usr/bin/google-chrome-stable'
  }
}

async function checkForChatGPTAtCapacity(page: Page) {
  let res: ElementHandle<Element> | null

  try {
    res = await page.$('[role="alert"]')
  } catch (err) {
    // ignore errors likely due to navigation
  }

  if (res) {
    const error = new types.ChatGPTError(`ChatGPT is at capacity: ${res}`)
    error.statusCode = 503
    throw error
  }
}
