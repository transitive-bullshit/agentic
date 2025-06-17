'use client'

import { sanitizeSearchParams } from '@agentic/platform-core'
import { redirect, RedirectType, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import {
  useNextUrl,
  useUnauthenticatedAgentic
} from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { toastError } from '@/lib/notifications'

export function OAuthSuccessCallback({
  provider:
    // TODO: make generic using this provider instead of hard-coding github
    _provider
}: {
  provider: string
}) {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const ctx = useUnauthenticatedAgentic()
  const nextUrl = useNextUrl()

  useEffect(() => {
    ;(async function () {
      if (!ctx) {
        return
      }

      if (!code) {
        // TODO
        throw new Error('Missing code or challenge')
      }

      // TODO: make generic using `provider`
      try {
        await ctx.api.exchangeOAuthCodeWithGitHub({ code })
      } catch (err) {
        await toastError(err, { label: 'Auth error' })

        return redirect(
          `/login?${sanitizeSearchParams({ next: nextUrl }).toString()}`,
          RedirectType.replace
        )
      }

      return redirect(nextUrl || '/app', RedirectType.replace)
    })()
  }, [code, ctx, nextUrl])

  return <LoadingIndicator />
}
