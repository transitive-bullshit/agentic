'use client'

import NumberFlow from '@number-flow/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { GitHubIcon } from '@/icons/github'
import { githubUrl } from '@/lib/config'

import { Button } from './ui/button'

// TODO: fetch this dynamically
const numGitHubStars = 17_600

export function GitHubStarCounter() {
  const [numStars, setNumStars] = useState(0)
  useEffect(() => {
    setNumStars(numGitHubStars)
  }, [])

  return (
    <Button variant='outline' className='flex items-center gap-2' asChild>
      <Link href={githubUrl} target='_blank' rel='noopener'>
        <GitHubIcon className='' />

        <NumberFlow
          value={numStars}
          format={{
            notation: 'compact',
            roundingPriority: 'morePrecision'
          }}
          suffix=' stars'
        />
      </Link>
    </Button>
  )
}
