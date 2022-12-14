import delay from 'delay'
import {
  type Browser,
  type Page,
  type Protocol,
  type PuppeteerLaunchOptions
} from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

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
  timeoutMs = 2 * 60 * 1000,
  browser,
  isGoogleLogin
}: {
  email?: string
  password?: string
  timeoutMs?: number
  browser?: Browser
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

    // NOTE: this is where you may encounter a CAPTCHA

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
        await page.keyboard.press('Enter')
        await Promise.all([
          page.waitForNavigation({
            waitUntil: 'networkidle0'
          })
        ])
      } else {
        await page.type('#username', email, { delay: 10 })
        await page.click('button[type="submit"]')
        await page.waitForSelector('#password')
        await page.type('#password', password, { delay: 10 })
        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({
            waitUntil: 'networkidle0'
          })
        ])
      }
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
  const macChromePath =
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

  return puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--exclude-switches', 'enable-automation'],
    ignoreHTTPSErrors: true,
    // executablePath: executablePath()
    executablePath: macChromePath,
    ...launchOptions
  })
}
