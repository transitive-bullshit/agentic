/* eslint-disable no-process-env */
export const isServer = globalThis.window === undefined
export const isSafari =
  !isServer && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const title = 'Agentic'
export const description =
  'Agentic is an API gateway built exclusively for AI agents.'
export const domain =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? 'agentic.so'

export const author = 'Travis Fischer'
export const authorTwitterUsername = 'transitive_bs'
export const twitterUrl = `https://x.com/${authorTwitterUsername}`
export const copyright = `© ${new Date().getFullYear()} Agentic. All rights reserved.`
export const githubUrl = 'https://github.com/transitive-bullshit/agentic'

export const keywords = [
  'agentic',
  'MCP',
  'Model Context Protocol',
  'MCP gateway',
  'API gateway',
  'MCP marketplace',
  'MCP API gateway',
  'MCP monetization',
  'production MCPs',
  'ai',
  'AI tools',
  'AI agents',
  'LLM tools',
  'MCP servers',
  'MCP server provider',
  'MCP server deployment',
  'OpenAPI to MCP',
  'OpenAPI to MCP server'
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
export const apiBaseUrl = isDev || !vercelUrl ? url : `https://${vercelUrl}`

export const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY!
export const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
