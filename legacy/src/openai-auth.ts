import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as url from 'node:url'

import delay from 'delay'
import { TimeoutError } from 'p-timeout'
import { Browser, Page, Protocol, PuppeteerLaunchOptions } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import random from 'random'

import * as types from './types'
import { minimizePage } from './utils'

puppeteer.use(StealthPlugin())

let hasRecaptchaPlugin = false
let hasNopechaExtension = false

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const DEFAULT_TIMEOUT_MS = 3 * 60 * 1000 // 3 minutes

/**
 * Represents everything that's required to pass into `ChatGPTAPI` in order
 * to authenticate with the unofficial ChatGPT API.
 */
export type OpenAIAuth = {
  userAgent: string
  clearanceToken: string
  sessionToken: string
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
  timeoutMs = DEFAULT_TIMEOUT_MS,
  isGoogleLogin = false,
  isMicrosoftLogin = false,
  captchaToken = process.env.CAPTCHA_TOKEN,
  nopechaKey = process.env.NOPECHA_KEY,
  executablePath,
  proxyServer = process.env.PROXY_SERVER,
  minimize = false
}: {
  email?: string
  password?: string
  browser?: Browser
  page?: Page
  timeoutMs?: number
  isGoogleLogin?: boolean
  isMicrosoftLogin?: boolean
  minimize?: boolean
  captchaToken?: string
  nopechaKey?: string
  executablePath?: string
  proxyServer?: string
}): Promise<OpenAIAuth> {
  const origBrowser = browser
  const origPage = page

  try {
    if (!browser) {
      browser = await getBrowser({
        captchaToken,
        nopechaKey,
        executablePath,
        proxyServer,
        timeoutMs
      })
    }

    const userAgent = await browser.userAgent()
    if (!page) {
      page = await getPage(browser, { proxyServer })
      page.setDefaultTimeout(timeoutMs)

      if (minimize) {
        await minimizePage(page)
      }
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
      do {
        await Promise.all([
          page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: timeoutMs
          }),
          page.click('#__next .btn-primary')
        ])
        await delay(500)
      } while (page.url().endsWith('/auth/login'))

      await checkForChatGPTAtCapacity(page, { timeoutMs })

      let submitP: () => Promise<void>

      if (isGoogleLogin) {
        await page.waitForSelector('button[data-provider="google"]', {
          timeout: timeoutMs
        })
        await page.click('button[data-provider="google"]')
        await page.waitForSelector('input[type="email"]')
        await page.type('input[type="email"]', email)
        await Promise.all([
          page.waitForNavigation(),
          await page.keyboard.press('Enter')
        ])
        await page.waitForSelector('input[type="password"]', { visible: true })
        await page.type('input[type="password"]', password)
        await delay(50)
        submitP = () => page.keyboard.press('Enter')
      } else if (isMicrosoftLogin) {
        await page.click('button[data-provider="windowslive"]')
        await page.waitForSelector('input[type="email"]')
        await page.type('input[type="email"]', email)
        await Promise.all([
          page.waitForNavigation(),
          await page.keyboard.press('Enter')
        ])
        await delay(1500)
        await page.waitForSelector('input[type="password"]', { visible: true })
        await page.type('input[type="password"]', password)
        await delay(50)
        submitP = () => page.keyboard.press('Enter')
        await Promise.all([
          page.waitForNavigation(),
          await page.keyboard.press('Enter')
        ])
        await delay(1000)
      } else {
        await page.waitForSelector('#username')
        await page.type('#username', email)
        await delay(100)

        // NOTE: this is where you may encounter a CAPTCHA
        if (hasNopechaExtension) {
          await waitForRecaptcha(page, { timeoutMs })
        } else if (hasRecaptchaPlugin) {
          console.log('solving captchas using 2captcha...')

          // Add retries in case network is unstable
          const retries = 3
          for (let i = 0; i < retries; i++) {
            try {
              const res = await page.solveRecaptchas()
              if (res.captchas?.length) {
                console.log('captchas result', res)
                break
              } else {
                console.log('no captchas found')
                await delay(500)
              }
            } catch (e) {
              console.log('captcha error', e)
            }
          }
        }

        await delay(2000)
        const frame = page.mainFrame()
        const submit = await page.waitForSelector('button[type="submit"]', {
          timeout: timeoutMs
        })
        await frame.focus('button[type="submit"]')
        await submit.focus()
        await submit.click()
        await page.waitForSelector('#password', { timeout: timeoutMs })
        await page.type('#password', password)
        await delay(200)
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
      sessionToken: cookies['__Secure-next-auth.session-token']?.value
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

export async function getPage(
  browser: Browser,
  opts: {
    proxyServer?: string
  }
) {
  const { proxyServer = process.env.PROXY_SERVER } = opts
  const page = (await browser.pages())[0] || (await browser.newPage())

  if (proxyServer && proxyServer.includes('@')) {
    const proxyAuth = proxyServer.split('@')[0].split(':')
    const proxyUsername = proxyAuth[0]
    const proxyPassword = proxyAuth[1]

    try {
      await page.authenticate({
        username: proxyUsername,
        password: proxyPassword
      })
    } catch (err) {
      console.error(
        `ChatGPT "${this._email}" error authenticating proxy "${this._proxyServer}"`,
        err.toString()
      )

      throw err
    }
  }

  return page
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
    proxyServer?: string
    minimize?: boolean
    debug?: boolean
    timeoutMs?: number
  } = {}
) {
  const {
    captchaToken = process.env.CAPTCHA_TOKEN,
    nopechaKey = process.env.NOPECHA_KEY,
    executablePath = defaultChromeExecutablePath(),
    proxyServer = process.env.PROXY_SERVER,
    minimize = false,
    debug = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
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

  // https://peter.sh/experiments/chromium-command-line-switches/
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
    '--disable-web-security'
    // '--disable-gpu'
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

  if (proxyServer) {
    const ipPort = proxyServer.includes('@')
      ? proxyServer.split('@')[1]
      : proxyServer
    puppeteerArgs.push(`--proxy-server=${ipPort}`)
  }

  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
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

  if (process.env.PROXY_VALIDATE_IP) {
    const page = await getPage(browser, { proxyServer })
    if (minimize) {
      await minimizePage(page)
    }

    // Send a fetch request to https://ifconfig.co using page.evaluate() and
    // verify that the IP matches
    let ip: string
    try {
      const res = await page.evaluate(() => {
        return fetch('https://ifconfig.co', {
          headers: {
            Accept: 'application/json'
          }
        }).then((res) => res.json())
      })

      ip = res?.ip
    } catch (err) {
      throw new Error(`Proxy IP validation failed: ${err.toString()}`, {
        cause: err
      })
    }

    if (!ip || ip !== process.env.PROXY_VALIDATE_IP) {
      throw new Error(
        `Proxy IP mismatch: ${ip} !== ${process.env.PROXY_VALIDATE_IP}`
      )
    }
  }

  await initializeNopechaExtension(browser, {
    nopechaKey,
    minimize,
    debug,
    timeoutMs,
    proxyServer
  })

  return browser
}

export async function initializeNopechaExtension(
  browser: Browser,
  opts: {
    proxyServer?: string
    nopechaKey?: string
    minimize?: boolean
    debug?: boolean
    timeoutMs?: number
  }
) {
  const { minimize = false, debug = false, nopechaKey, proxyServer } = opts

  if (hasNopechaExtension) {
    const page = await getPage(browser, { proxyServer })
    if (minimize) {
      await minimizePage(page)
    }

    if (debug) {
      console.log('initializing nopecha extension with key', nopechaKey, '...')
    }

    // TODO: setting the nopecha extension key is really, really error prone...
    for (let i = 0; i < 5; ++i) {
      await page.goto(`https://nopecha.com/setup#${nopechaKey}`, {
        waitUntil: 'networkidle0'
      })
      await delay(500)
    }
  }
}

/**
 * Gets the default path to chrome's executable for the current platform.
 */
export const defaultChromeExecutablePath = (): string => {
  // return executablePath()

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
      try {
        const captcha = await page.$('textarea#g-recaptcha-response')
        if (!captcha) {
          // the user may have gone past the page manually
          console.log('captcha no longer found; continuing')
          break
        }

        const value = (await captcha.evaluate((el) => el.value))?.trim()
        if (value?.length) {
          // recaptcha has been solved!
          console.log('captcha solved; continuing')
          break
        }
      } catch (err) {
        // catch navigation-related page context errors
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
