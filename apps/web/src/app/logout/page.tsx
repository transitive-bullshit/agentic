'use client'

import { useEffect } from 'react'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'

export default function LogoutPage() {
  const ctx = useAuthenticatedAgentic()

  useEffect(() => {
    ;(async () => {
      if (ctx) {
        ctx.logout()
      }
    })()
  }, [ctx])

  return null
}
