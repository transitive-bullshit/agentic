import delay from 'delay'
import {
  type Browser,
  type Page,
  type Protocol,
  type PuppeteerLaunchOptions
} from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import { OpenAIAuth, getBrowser } from './openai-auth'

puppeteer.use(StealthPlugin())

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
export async function getOpenAIAuth2Captcha({
  email,
  password,
  timeoutMs = 2 * 60 * 1000,
  browser,
  captchaToken
}: {
  email?: string
  password?: string
  timeoutMs?: number
  browser?: Browser
  captchaToken?: string
}): Promise<OpenAIAuth> {
  let page: Page
  let origBrowser = browser
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: captchaToken
      },
      visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
  )

  try {
    if (!browser) {
      browser = await getBrowser()
    }

    const userAgent = await browser.userAgent()
    page = (await browser.pages())[0] || (await browser.newPage())
    page.setDefaultTimeout(timeoutMs)

    await page.goto('https://chat.openai.com/auth/login')

    // NOTE: this is where you may encounter a CAPTCHA
    await page.solveRecaptchas()

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
      await page.type('#username', email, { delay: 10 })
      await page.solveRecaptchas()
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
