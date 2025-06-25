'use client'

import NumberFlow from '@number-flow/react'
import Link from 'next/link'
import { type ReactNode, useEffect, useState } from 'react'

import { GitHubIcon } from '@/icons/github'
import { githubUrl } from '@/lib/config'
import { cn } from '@/lib/utils'

import { Button } from './ui/button'

// TODO: fetch this dynamically
const numGitHubStars = 17_600

export function GitHubStarCounter({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  const [numStars, setNumStars] = useState(0)

  useEffect(() => {
    setNumStars(numGitHubStars)
  }, [])

  return (
    <Button
      variant='outline'
      className={cn('flex items-center gap-2', className)}
      asChild
    >
      <Link href={githubUrl} target='_blank' rel='noopener'>
        <GitHubIcon />

        <NumberFlow
          value={numStars}
          format={{
            notation: 'compact',
            roundingPriority: 'morePrecision'
          }}
          suffix={children ? undefined : ' stars'}
          willChange
        />

        {children}
      </Link>
    </Button>
  )
}
