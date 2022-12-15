import * as fs from 'node:fs'
import * as os from 'node:os'

import delay from 'delay'
import type {
  Browser,
  ElementHandle,
  Page,
  Protocol,
  PuppeteerLaunchOptions
} from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import * as types from './types'

puppeteer.use(StealthPlugin())

let hasRecaptchaPlugin = false

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
  page,
  timeoutMs = 2 * 60 * 1000,
  // TODO: temporary for testing...
  // timeoutMs = 60 * 60 * 1000,
  isGoogleLogin = false,
  captchaToken = process.env.CAPTCHA_TOKEN
}: {
  email?: string
  password?: string
  browser?: Browser
  page?: Page
  timeoutMs?: number
  isGoogleLogin?: boolean
  captchaToken?: string
}): Promise<OpenAIAuth> {
  const origBrowser = browser
  const origPage = page

  try {
    if (!browser) {
      browser = await getBrowser({ captchaToken })
    }

    const userAgent = await browser.userAgent()
    if (!page) {
      page = (await browser.pages())[0] || (await browser.newPage())
      page.setDefaultTimeout(timeoutMs)
    }

    await page.goto('https://chat.openai.com/auth/login', {
      waitUntil: 'networkidle0'
    })

    // NOTE: this is where you may encounter a CAPTCHA
    if (hasRecaptchaPlugin) {
      await page.solveRecaptchas()
    }

    await checkForChatGPTAtCapacity(page)

    // once we get to this point, the Cloudflare cookies should be available

    // login as well (optional)
    if (email && password) {
      await page.waitForSelector('#__next .btn-primary', { timeout: timeoutMs })
      await delay(500)

      await Promise.all([
        // click login button
        page.click('#__next .btn-primary'),
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        })
      ])

      await checkForChatGPTAtCapacity(page)

      let submitP: () => Promise<void>

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
        submitP = () => page.keyboard.press('Enter')
      } else {
        await page.waitForSelector('#username')
        await page.type('#username', email, { delay: 20 })
        await delay(100)

        if (hasRecaptchaPlugin) {
          console.log('solveRecaptchas()')
          const res = await page.solveRecaptchas()
          console.log('solveRecaptchas result', res)
        }

        await page.click('button[type="submit"]')
        await page.waitForSelector('#password')
        await page.type('#password', password, { delay: 10 })
        submitP = () => page.click('button[type="submit"]')
      }

      await Promise.all([
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
        }),

        submitP()
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
    throw err
  } finally {
    if (origBrowser) {
      if (page && page !== origPage) {
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
export async function getBrowser(
  opts: PuppeteerLaunchOptions & {
    captchaToken?: string
  } = {}
) {
  const { captchaToken = process.env.CAPTCHA_TOKEN, ...launchOptions } = opts

  if (captchaToken && !hasRecaptchaPlugin) {
    hasRecaptchaPlugin = true
    console.log('use captcha', captchaToken)

    puppeteer.use(
      RecaptchaPlugin({
        provider: {
          id: '2captcha',
          token: captchaToken
        },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
      })
    )
  }

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

    default: {
      /**
       * Since two (2) separate chrome releases exist on linux, we first do a
       * check to ensure we're executing the right one.
       */
      const chromeExists = fs.existsSync('/usr/bin/google-chrome')

      return chromeExists
        ? '/usr/bin/google-chrome'
        : '/usr/bin/google-chrome-stable'
    }
  }
}

async function checkForChatGPTAtCapacity(page: Page) {
  let res: ElementHandle<Node>[]

  try {
    // res = await page.$('[role="alert"]')
    res = await page.$x("//div[contains(., 'ChatGPT is at capacity')]")
    console.log('capacity', res)

    if (!res?.length) {
      res = await page.$x("//div[contains(., 'at capacity right now')]")
      console.log('capacity2', res)
    }
  } catch (err) {
    // ignore errors likely due to navigation
  }

  if (res?.length) {
    const error = new types.ChatGPTError('ChatGPT is at capacity')
    error.statusCode = 503
    throw error
  }
}
