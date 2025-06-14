import type { ReactNode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { PostHogProvider } from 'posthog-js/react'

import { ThemeProvider } from '@/components/theme-provider'
import { posthogHost, posthogKey } from '@/lib/config'
import globalStyles from '@/styles/global.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        // eslint-disable-next-line unicorn/text-encoding-identifier-case
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'Agentic'
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: globalStyles
      }
    ]
  }),
  component: RootComponent
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

const posthogOptions = {
  api_host: posthogHost,
  defaults: '2025-05-24'
} as const

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>

      <body>
        <PostHogProvider apiKey={posthogKey} options={posthogOptions}>
          <ThemeProvider defaultTheme='dark' storageKey='agentic-ui-theme'>
            {children}
          </ThemeProvider>
        </PostHogProvider>

        <TanStackRouterDevtools position='bottom-right' />
        <ReactQueryDevtools buttonPosition='top-right' />
        <Scripts />
      </body>
    </html>
  )
}
