'use client'

import { sanitizeSearchParams } from '@agentic/platform-core'
import Link from 'next/link'

import { HeroButton, type HeroButtonVariant } from '@/components/hero-button'
import { Button } from '@/components/ui/button'
import { GitHubIcon } from '@/icons/github'
import {
  calendarBookingUrl,
  docsPublishingQuickStartUrl,
  docsPublishingUrl,
  githubUrl
} from '@/lib/config'

import { useAgentic } from './agentic-provider'
import { GitHubStarCounter } from './github-star-counter'

export function SupplySideCTA({
  variant = 'github',
  heroVariant = 'orange'
}: {
  variant?: 'book-call' | 'docs' | 'github' | 'github-2'
  heroVariant?: HeroButtonVariant
}) {
  const ctx = useAgentic()

  return (
    <div className='flex justify-center items-center gap-8 md:gap-12'>
      <HeroButton asChild heroVariant={heroVariant}>
        <Link
          href={
            ctx?.isAuthenticated
              ? docsPublishingQuickStartUrl
              : `/signup?${sanitizeSearchParams({ next: docsPublishingQuickStartUrl })}`
          }
        >
          Quick Start
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
      ) : variant === 'docs' ? (
        <Button variant='outline' asChild className='h-full py-[9px]'>
          <Link href={docsPublishingUrl}>Publishing Docs</Link>
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
