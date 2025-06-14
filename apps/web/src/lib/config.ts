export const isServer = globalThis.window === undefined
export const isSafari =
  !isServer && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const title = 'Agentic'
export const description =
  'Agentic is an API gateway built exclusively for AI agents.'
export const domain =
  import.meta.env.VITE_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? 'agentic.so'

export const author = 'Travis Fischer'
export const authorTwitterUsername = 'transitive_bs'
export const twitterUrl = `https://x.com/${authorTwitterUsername}`
export const copyright = `© ${new Date().getFullYear()} Agentic. All rights reserved.`
export const githubUrl = 'https://github.com/transitive-bullshit/agentic'

export const env =
  import.meta.env.VITE_PUBLIC_VERCEL_ENV ??
  import.meta.env.NODE_ENV ??
  'development'
export const isVercel = !!(
  import.meta.env.VITE_PUBLIC_VERCEL_ENV || import.meta.env.VERCEL
)
export const isDev = env === 'development' && !isVercel
export const isProd = env === 'production'
export const isTest = env === 'test'

export const port = import.meta.env.PORT || '3000'
export const prodUrl = `https://${domain}`
export const url = isDev ? `http://localhost:${port}` : prodUrl
export const vercelUrl =
  import.meta.env.VERCEL_URL ?? import.meta.env.VITE_PUBLIC_VERCEL_URL
export const apiBaseUrl = isDev || !vercelUrl ? url : `https://${vercelUrl}`

export const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY!
export const posthogHost =
  import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
