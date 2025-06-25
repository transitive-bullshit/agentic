'use client'

import { sanitizeSearchParams } from '@agentic/platform-core'
import Link from 'next/link'

import { HeroButton } from '@/components/hero-button'
import { Button } from '@/components/ui/button'
import { GitHubIcon } from '@/icons/github'
import { calendarBookingUrl, docsQuickStartUrl, githubUrl } from '@/lib/config'

import { useAgentic } from './agentic-provider'
import { GitHubStarCounter } from './github-star-counter'

export function SupplySideCTA({
  variant = 'github'
}: {
  variant?: 'book-call' | 'github' | 'github-2'
}) {
  const ctx = useAgentic()

  return (
    <div className='flex justify-center items-center gap-8'>
      <HeroButton asChild className=''>
        <Link
          href={
            ctx?.isAuthenticated
              ? docsQuickStartUrl
              : `/signup?${sanitizeSearchParams({ next: docsQuickStartUrl })}`
          }
        >
          Get Started
        </Link>
      </HeroButton>

      {variant === 'github' ? (
        <GitHubStarCounter className='h-full py-[9px]' />
      ) : variant === 'github-2' ? (
        <Button variant='outline' asChild className='h-full py-[9px]'>
          <Link href={githubUrl} target='_blank' rel='noopener'>
            <GitHubIcon />
            Star us on GitHub
          </Link>
        </Button>
      ) : (
        <Button variant='outline' asChild className='h-full py-[9px]'>
          <Link href={calendarBookingUrl} target='_blank' rel='noopener'>
            Book a call with the founder 👋
          </Link>
        </Button>
      )}
    </div>
  )
}
