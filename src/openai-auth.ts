import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as url from 'node:url'

import delay from 'delay'
import { TimeoutError } from 'p-timeout'
import type { Browser, Page, Protocol, PuppeteerLaunchOptions } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import random from 'random'

import * as types from './types'

puppeteer.use(StealthPlugin())

let hasRecaptchaPlugin = false
let hasNopechaExtension = false

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

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
  isGoogleLogin = false,
  isMicrosoftLogin = false,
  captchaToken = process.env.CAPTCHA_TOKEN,
  nopechaKey = process.env.NOPECHA_KEY,
  executablePath
}: {
  email?: string
  password?: string
  browser?: Browser
  page?: Page
  timeoutMs?: number
  isGoogleLogin?: boolean
  isMicrosoftLogin?: boolean
  captchaToken?: string
  nopechaKey?: string
  executablePath?: string
}): Promise<OpenAIAuth> {
  const origBrowser = browser
  const origPage = page

  try {
    if (!browser) {
      browser = await getBrowser({ captchaToken, nopechaKey, executablePath })
    }

    const userAgent = await browser.userAgent()
    if (!page) {
      page = (await browser.pages())[0] || (await browser.newPage())
      page.setDefaultTimeout(timeoutMs)
    }

    await page.goto('https://chat.openai.com/auth/login', {
      waitUntil: 'networkidle2'
    })

    // NOTE: this is where you may encounter a CAPTCHA
    await checkForChatGPTAtCapacity(page, { timeoutMs })

    if (hasRecaptchaPlugin) {
      const captchas = await page.findRecaptchas()

      if (captchas?.filtered?.length) {
        console.log('solving captchas using 2captcha...')
        const res = await page.solveRecaptchas()
        console.log('captcha result', res)
      }
    }

    // once we get to this point, the Cloudflare cookies should be available

    // login as well (optional)
    if (email && password) {
      await waitForConditionOrAtCapacity(page, () =>
        page.waitForSelector('#__next .btn-primary', { timeout: timeoutMs })
      )
      await delay(500)

      // click login button and wait for navigation to finish
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: timeoutMs
        }),

        page.click('#__next .btn-primary')
      ])

      await checkForChatGPTAtCapacity(page, { timeoutMs })

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
      } else if (isMicrosoftLogin) {
        await page.click('button[data-provider="windowslive"]')
        await page.waitForSelector('input[type="email"]')
        await page.type('input[type="email"]', email, { delay: 10 })
        await Promise.all([
          page.waitForNavigation(),
          await page.keyboard.press('Enter')
        ])
        await delay(1500)
        await page.waitForSelector('input[type="password"]', { visible: true })
        await page.type('input[type="password"]', password, { delay: 10 })
        submitP = () => page.keyboard.press('Enter')
        // await Promise.all([
        //   page.waitForNavigation(),
        //   await page.keyboard.press('Enter')
        // ])
        await delay(1000)
      } else {
        await page.waitForSelector('#username')
        await page.type('#username', email, { delay: 20 })
        await delay(100)

        // NOTE: this is where you may encounter a CAPTCHA
        if (hasNopechaExtension) {
          await waitForRecaptcha(page, { timeoutMs })
        } else if (hasRecaptchaPlugin) {
          console.log('solving captchas using 2captcha...')
          const res = await page.solveRecaptchas()
          if (res.captchas?.length) {
            console.log('captchas result', res)
          } else {
            console.log('no captchas found')
          }
        }

        await delay(1200)
        const frame = page.mainFrame()
        const submit = await page.waitForSelector('button[type="submit"]', {
          timeout: timeoutMs
        })
        frame.focus('button[type="submit"]')
        await submit.focus()
        await submit.click()
        await page.waitForSelector('#password', { timeout: timeoutMs })
        await page.type('#password', password, { delay: 10 })
        submitP = () => page.click('button[type="submit"]')
      }

      await Promise.all([
        waitForConditionOrAtCapacity(page, () =>
          page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: timeoutMs
          })
        ),
        submitP()
      ])
    } else {
      await delay(2000)
      await checkForChatGPTAtCapacity(page, { timeoutMs })
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
    nopechaKey?: string
  } = {}
) {
  const {
    captchaToken = process.env.CAPTCHA_TOKEN,
    nopechaKey = process.env.NOPECHA_KEY,
    executablePath = defaultChromeExecutablePath(),
    ...launchOptions
  } = opts

  if (captchaToken && !hasRecaptchaPlugin) {
    hasRecaptchaPlugin = true
    // console.log('use captcha', captchaToken)

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

  const puppeteerArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--ignore-certificate-errors',
    '--no-first-run',
    '--no-service-autorun',
    '--password-store=basic',
    '--system-developer-mode',
    // the following flags all try to reduce memory
    // '--single-process',
    '--mute-audio',
    '--disable-default-apps',
    '--no-zygote',
    '--disable-accelerated-2d-canvas',
    '--disable-web-security',
    '--disable-gpu'
    // '--js-flags="--max-old-space-size=1024"'
  ]

  if (nopechaKey) {
    const nopechaPath = path.join(
      __dirname,
      '..',
      'third-party',
      'nopecha-chrome-extension'
    )
    puppeteerArgs.push(`--disable-extensions-except=${nopechaPath}`)
    puppeteerArgs.push(`--load-extension=${nopechaPath}`)
    hasNopechaExtension = true
  }

  const browser = await puppeteer.launch({
    headless: false,
    // https://peter.sh/experiments/chromium-command-line-switches/
    args: puppeteerArgs,
    ignoreDefaultArgs: [
      '--disable-extensions',
      '--enable-automation',
      '--disable-component-extensions-with-background-pages'
    ],
    ignoreHTTPSErrors: true,
    executablePath,
    ...launchOptions
  })

  // TOdO: this is a really hackity hack way of setting the API key...
  if (hasNopechaExtension) {
    const page = (await browser.pages())[0] || (await browser.newPage())
    await page.goto(`https://nopecha.com/setup#${nopechaKey}`)
    await delay(1000)
    try {
      const page3 = await browser.newPage()
      await page.close()

      // find the nopecha extension ID
      const targets = browser.targets()
      const extensionIds = (
        await Promise.all(
          targets.map(async (target) => {
            if (target.type() !== 'service_worker') {
              return
            }

            // const titleL = title?.toLowerCase()
            // if (titleL?.includes('nopecha'))
            const url = new URL(target.url())
            return url.hostname
          })
        )
      ).filter(Boolean)
      const extensionId = extensionIds[0]

      if (extensionId) {
        const extensionUrl = `chrome-extension://${extensionId}/popup.html`
        await page3.goto(extensionUrl, { waitUntil: 'networkidle2' })
        await delay(500)

        const editKey = await page3.waitForSelector('#edit_key .clickable')
        await editKey.click()

        const settingsInput = await page3.waitForSelector('input.settings_text')
        // console.log('value1', await settingsInput.evaluate((el) => el.value))

        await settingsInput.evaluate((el) => {
          el.value = ''
        })
        await settingsInput.type(nopechaKey)

        // console.log('value2', await settingsInput.evaluate((el) => el.value))
        await settingsInput.evaluate((el, value) => {
          el.value = value
        }, nopechaKey)

        // console.log('value3', await settingsInput.evaluate((el) => el.value))
        await settingsInput.press('Enter')
        await delay(500)
        await editKey.click()
        await delay(2000)
        console.log('initialized nopecha extension with key', nopechaKey)
      } else {
        console.error(
          "error initializing nopecha extension; couldn't determine extension ID"
        )
      }
    } catch (err) {
      console.error('error initializing nopecha extension', err)
    }
  }

  return browser
}

/**
 * Gets the default path to chrome's executable for the current platform.
 */
export const defaultChromeExecutablePath = (): string => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }

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

async function checkForChatGPTAtCapacity(
  page: Page,
  opts: {
    timeoutMs?: number
    pollingIntervalMs?: number
    retries?: number
  } = {}
) {
  const {
    timeoutMs = 2 * 60 * 1000, // 2 minutes
    pollingIntervalMs = 3000,
    retries = 10
  } = opts

  // console.log('checkForChatGPTAtCapacity', page.url())
  let isAtCapacity = false
  let numTries = 0

  do {
    try {
      await solveSimpleCaptchas(page)

      const res = await page.$x("//div[contains(., 'ChatGPT is at capacity')]")
      isAtCapacity = !!res?.length

      if (isAtCapacity) {
        if (++numTries >= retries) {
          break
        }

        // try refreshing the page if chatgpt is at capacity
        await page.reload({
          waitUntil: 'networkidle2',
          timeout: timeoutMs
        })

        await delay(pollingIntervalMs)
      }
    } catch (err) {
      // ignore errors likely due to navigation
      ++numTries
      break
    }
  } while (isAtCapacity)

  if (isAtCapacity) {
    const error = new types.ChatGPTError('ChatGPT is at capacity')
    error.statusCode = 503
    throw error
  }
}

async function waitForConditionOrAtCapacity(
  page: Page,
  condition: () => Promise<any>,
  opts: {
    pollingIntervalMs?: number
  } = {}
) {
  const { pollingIntervalMs = 500 } = opts

  return new Promise<void>((resolve, reject) => {
    let resolved = false

    async function waitForCapacityText() {
      if (resolved) {
        return
      }

      try {
        await checkForChatGPTAtCapacity(page)

        if (!resolved) {
          setTimeout(waitForCapacityText, pollingIntervalMs)
        }
      } catch (err) {
        if (!resolved) {
          resolved = true
          return reject(err)
        }
      }
    }

    condition()
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

    setTimeout(waitForCapacityText, pollingIntervalMs)
  })
}

async function solveSimpleCaptchas(page: Page) {
  try {
    const verifyYouAreHuman = await page.$('text=Verify you are human')
    if (verifyYouAreHuman) {
      await delay(2000)
      await verifyYouAreHuman.click({
        delay: random.int(5, 25)
      })
      await delay(1000)
    }

    const cloudflareButton = await page.$('.hcaptcha-box')
    if (cloudflareButton) {
      await delay(2000)
      await cloudflareButton.click({
        delay: random.int(5, 25)
      })
      await delay(1000)
    }
  } catch (err) {
    // ignore errors
  }
}

async function waitForRecaptcha(
  page: Page,
  opts: {
    pollingIntervalMs?: number
    timeoutMs?: number
  } = {}
) {
  await solveSimpleCaptchas(page)

  if (!hasNopechaExtension) {
    return
  }

  const { pollingIntervalMs = 100, timeoutMs } = opts
  const captcha = await page.$('textarea#g-recaptcha-response')
  const startTime = Date.now()

  if (captcha) {
    console.log('waiting to solve recaptcha...')

    do {
      const value = (await captcha.evaluate((el) => el.value))?.trim()
      if (value?.length) {
        // recaptcha has been solved!
        break
      }

      if (timeoutMs) {
        const now = Date.now()
        if (now - startTime >= timeoutMs) {
          throw new TimeoutError('Timed out waiting to solve Recaptcha')
        }
      }

      await delay(pollingIntervalMs)
    } while (true)
  }
}
