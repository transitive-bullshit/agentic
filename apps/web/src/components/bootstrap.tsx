'use client'

import { useFirstMountState } from 'react-use'

import { bootstrap } from '@/lib/bootstrap'

export function Bootstrap() {
  const isFirstMount = useFirstMountState()

  if (isFirstMount) {
    bootstrap()
  }

  // Return `null` so we can use this as a react component
  return null
}
