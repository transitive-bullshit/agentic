'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { posthog } from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { Suspense, useEffect, useState } from 'react'

import { posthogHost, posthogKey } from '@/lib/config'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
        capture_pageview: false // Disable automatic pageview capture, as we capture manually
      })
    }
  }, [])

  if (!posthogKey) {
    return children
  }

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />

      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const [prevPathname, setPrevPathname] = useState<string | null>(null)

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = globalThis.window.origin + pathname
      if (searchParams.toString()) {
        url = url + '?' + searchParams.toString()
      }

      if (prevPathname && prevPathname !== pathname) {
        posthog.capture('$pageleave', { $pathname: prevPathname })
      }

      posthog.capture('$pageview', { $current_url: url })
      setPrevPathname(pathname)
    }
  }, [pathname, prevPathname, searchParams, posthog])

  return null
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
