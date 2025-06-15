'use client'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'

export default function AppIndexPage() {
  const ctx = useAuthenticatedAgentic()

  // TODO: loading
  if (!ctx) return null

  return (
    <>
      <section>
        <h1 className='my-0! text-center text-balance leading-snug md:leading-none'>
          Authenticated Dashboard
        </h1>

        <pre>Auth Session: {JSON.stringify(ctx.api.authSession, null, 2)}</pre>
      </section>
    </>
  )
}
