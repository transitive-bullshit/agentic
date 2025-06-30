/* eslint-disable no-process-env */
export const isServer = globalThis.window === undefined
export const isSafari =
  !isServer && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const title = 'Agentic'
export const description =
  "Agentic is the App Store for LLM tools. Publish any MCP server or OpenAPI service Agentic's MCP gateway and instantly turn it into a paid MCP product."
export const domain =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? 'agentic.so'

export const author = 'Travis Fischer'
export const authorTwitterUsername = 'transitive_bs'
export const copyright = `© ${new Date().getFullYear()} Agentic. All rights reserved.`

// external urls
export const twitterUrl = `https://x.com/${authorTwitterUsername}`
export const githubUrl = 'https://github.com/transitive-bullshit/agentic'
// TODO: make an agentic-specific calendar for this
export const calendarBookingUrl = 'https://cal.com/travis-fischer/15min'
export const discordUrl = 'https://discord.agentic.so'

export const keywords = [
  'agentic',
  'agentic tools',
  'MCP',
  'Model Context Protocol',
  'MCP gateway',
  'API gateway',
  'MCP marketplace',
  'MCP API gateway',
  'MCP monetization',
  'production MCPs',
  'deploy MCPs',
  'publish MCPs',
  'ai',
  'AI tools',
  'AI agents',
  'LLM tools',
  'LLM function calling',
  'LLM tool calling',
  'MCP servers',
  'MCP server provider',
  'MCP server deployment',
  'OpenAPI to MCP',
  'OpenAPI to MCP server',
  'vercel ai sdk',
  'ai sdk tools',
  'langchain tools',
  'llamaindex tools',
  'openai tools',
  'anthropic tools',
  'gemini tools'
]

export const env =
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? 'development'
export const isVercel = !!(
  process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL
)
export const isDev = env === 'development' && !isVercel
export const isProd = env === 'production'
export const isTest = env === 'test'

export const port = process.env.PORT || '3000'
export const prodUrl = `https://${domain}`
export const url = isDev ? `http://localhost:${port}` : prodUrl
export const vercelUrl =
  process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL
// export const webBaseUrl = isDev || !vercelUrl ? url : `https://${vercelUrl}`
export const apiBaseUrl = process.env.NEXT_PUBLIC_AGENTIC_API_BASE_URL!
export const gatewayBaseUrl = process.env.NEXT_PUBLIC_AGENTIC_GATEWAY_BASE_URL!

export const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY!
export const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
