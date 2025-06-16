'use client'

import { redirect, RedirectType, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { useUnauthenticatedAgentic } from '@/components/agentic-provider'

export function SuccessPage({
  provider:
    // TODO
    _provider
}: {
  provider: string
}) {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const ctx = useUnauthenticatedAgentic()

  useEffect(() => {
    ;(async function () {
      if (!code) {
        // TODO
        throw new Error('Missing code or challenge')
      }

      if (!ctx) {
        return
      }

      // TODO: make generic using `provider`
      try {
        const authSession = await ctx.api.exchangeOAuthCodeWithGitHub({
          code
        })

        console.log('AUTH SUCCESS', { authSession })
      } catch (err) {
        console.error('AUTH ERROR', err)

        return redirect('/login', RedirectType.replace)
      }

      return redirect('/app', RedirectType.replace)
    })()
  }, [code, ctx])

  // TODO: show a loading state
  return null
}
