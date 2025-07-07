'use client'

import { sanitizeSearchParams } from '@agentic/platform-core'
import Link from 'next/link'

import { HeroButton, type HeroButtonVariant } from '@/components/hero-button'
import { Button } from '@/components/ui/button'
import { GitHubIcon } from '@/icons/github'
import { calendarBookingUrl, githubUrl } from '@/lib/config'

import { useAgentic } from './agentic-provider'
import { GitHubStarCounter } from './github-star-counter'

const docsPublishingQuickStartUrl =
  'https://docs.agentic.so/publishing/quickstart'

export function SupplySideCTA({
  variant = 'github',
  heroVariant = 'orange'
}: {
  variant?: 'book-call' | 'docs' | 'github' | 'github-2'
  heroVariant?: HeroButtonVariant
}) {
  const ctx = useAgentic()

  return (
    <div className='flex justify-center items-center gap-4 sm:gap-8'>
      <HeroButton asChild heroVariant={heroVariant}>
        <Link
          href={
            ctx?.isAuthenticated
              ? docsPublishingQuickStartUrl
              : `/signup?${sanitizeSearchParams({
                  next: docsPublishingQuickStartUrl
                })}`
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
          <Link href='https://docs.agentic.so/publishing'>Publishing Docs</Link>
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
