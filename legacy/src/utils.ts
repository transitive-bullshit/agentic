import type { Page } from 'puppeteer'
import { remark } from 'remark'
import stripMarkdown from 'strip-markdown'

export function markdownToText(markdown?: string): string {
  return remark()
    .use(stripMarkdown)
    .processSync(markdown ?? '')
    .toString()
}

export async function minimizePage(page: Page) {
  const session = await page.target().createCDPSession()
  const goods = await session.send('Browser.getWindowForTarget')
  const { windowId } = goods
  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: { windowState: 'minimized' }
  })
}

export async function maximizePage(page: Page) {
  const session = await page.target().createCDPSession()
  const goods = await session.send('Browser.getWindowForTarget')
  const { windowId } = goods
  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: { windowState: 'normal' }
  })
}

export function isRelevantRequest(url: string): boolean {
  let pathname

  try {
    const parsedUrl = new URL(url)
    pathname = parsedUrl.pathname
    url = parsedUrl.toString()
  } catch (_) {
    return false
  }

  if (!url.startsWith('https://chat.openai.com')) {
    return false
  }

  if (pathname.startsWith('/_next')) {
    return false
  }

  if (pathname.endsWith('backend-api/moderations')) {
    return false
  }

  return true
}
