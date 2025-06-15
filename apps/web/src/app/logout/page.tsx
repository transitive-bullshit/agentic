'use client'

import { redirect, RedirectType } from 'next/navigation'
import { useEffect } from 'react'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'

export default function LogoutPage() {
  const ctx = useAuthenticatedAgentic()

  useEffect(() => {
    ;(async () => {
      if (ctx) {
        await ctx.api.logout()
        redirect('/', RedirectType.replace)
      }
    })()
  }, [ctx])

  return null
}
