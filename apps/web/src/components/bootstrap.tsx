'use client'

import { useFirstMountState } from 'react-use'

import { bootstrap } from '@/lib/bootstrap'

export function Bootstrap() {
  const isFirstMount = useFirstMountState()

  if (isFirstMount) {
    bootstrap()
  }

  return null
}
