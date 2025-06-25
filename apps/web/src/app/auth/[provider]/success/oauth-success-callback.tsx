'use client'

import { sanitizeSearchParams } from '@agentic/platform-core'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()

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

        return router.replace(
          `/login?${sanitizeSearchParams({ next: nextUrl }).toString()}`
        )
      }

      return router.replace(nextUrl || '/app')
    })()
  }, [code, ctx, nextUrl, router])

  return <LoadingIndicator />
}
