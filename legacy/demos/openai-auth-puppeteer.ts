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

export type OpenAIAuthInfo = {
  userAgent: string
  clearanceToken: string
  sessionToken: string
  cookies?: Record<string, Protocol.Network.Cookie>
}

/**
 * Bypasses OpenAI's use of Cloudflare to get the cookies required to use
 * ChatGPT. Uses Puppeteer with a stealth plugin under the hood.
 */
export async function getOpenAIAuthInfo({
  email,
  password,
  timeout = 2 * 60 * 1000,
  browser
}: {
  email: string
  password: string
  timeout?: number
  browser?: Browser
}): Promise<OpenAIAuthInfo> {
  let page: Page
  let origBrowser = browser

  try {
    if (!browser) {
      browser = await getBrowser()
    }

    const userAgent = await browser.userAgent()
    page = (await browser.pages())[0] || (await browser.newPage())
    page.setDefaultTimeout(timeout)

    await page.goto('https://chat.openai.com/auth/login')
    await page.waitForSelector('#__next .btn-primary', { timeout })
    await delay(1000)

    if (email && password) {
      await Promise.all([
        page.click('#__next .btn-primary'),
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        })
      ])
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

    const pageCookies = await page.cookies()
    const cookies = pageCookies.reduce(
      (map, cookie) => ({ ...map, [cookie.name]: cookie }),
      {}
    )

    const authInfo: OpenAIAuthInfo = {
      userAgent,
      clearanceToken: cookies['cf_clearance']?.value,
      sessionToken: cookies['__Secure-next-auth.session-token']?.value,
      cookies
    }

    return authInfo
  } catch (err) {
    console.error(err)
    throw null
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
