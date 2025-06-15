'use client'

import type { AuthorizeResult } from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useLocalStorage } from 'react-use'

import { useAgentic } from '@/components/agentic-provider'

// function FieldInfo({ field }: { field: AnyFieldApi }) {
//   return (
//     <>
//       {field.state.meta.isTouched && !field.state.meta.isValid ? (
//         <em>{field.state.meta.errors.join(',')}</em>
//       ) : null}

//       {field.state.meta.isValidating ? 'Validating...' : null}
//     </>
//   )
// }

export default async function Page({
  params
}: {
  params: Promise<{ provider: string }>
}) {
  const { provider } = await params
  assert(provider, 'Missing provider')

  return <SuccessPage provider={provider} />
}

function SuccessPage({ provider }: { provider: string }) {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const { api } = useAgentic()
  const [authResult] = useLocalStorage<AuthorizeResult | undefined>(
    'auth-result'
  )

  useEffect(() => {
    ;(async function () {
      if (!code) {
        // TODO
        throw new Error('Missing code or challenge')
      }

      if (!authResult) {
        // TODO
        throw new Error('Missing auth-result')
      }

      if (!authResult.challenge) {
        // TODO
        throw new Error('Missing challenge')
      }

      const authUser = await api.exchangeAuthCode({
        code,
        redirectUri: new URL(
          `/auth/${provider}/success`,
          globalThis.window.location.origin
        ).toString(),
        verifier: authResult.challenge?.verifier
      })

      console.log('AUTH SUCCESS', {
        authUser,
        authTokens: api.authTokens
      })
    })()
  }, [code, api, authResult, provider])

  // TODO: show a loading state
  return null
}
