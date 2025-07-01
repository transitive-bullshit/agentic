import Link from 'next/link'

import { DotsSection } from '@/components/dots-section'
import { GitHubStarCounter } from '@/components/github-star-counter'
import { HeroButton } from '@/components/hero-button'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { calendarBookingUrl, emailUrl, twitterUrl } from '@/lib/config'

export default function AboutPage() {
  return (
    <PageContainer className='gap-12'>
      <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
        Contact
      </h1>

      <section className='flex flex-col gap-4 max-w-2xl text-center'>
        <p>
          Agentic is currently a solo effort by{' '}
          <Link
            href={twitterUrl}
            className='link'
            target='_blank'
            rel='noopener'
          >
            Travis Fischer
          </Link>
          . 👋
        </p>

        <p>
          As with MCP itself, Agentic is an active work in progress, so please
          reach out if you have any questions, feedback, or feature requests.
        </p>
      </section>

      {/* CTA section */}
      <DotsSection className='max-w-2xl'>
        <div className='relative grid grid-cols-1 sm:grid-cols-2 gap-8'>
          <HeroButton asChild heroVariant='orange'>
            <Link href={twitterUrl} target='_blank' rel='noopener'>
              DM me on Twitter / X
            </Link>
          </HeroButton>

          <Button asChild variant='outline' className='h-full py-[9px]'>
            <Link href={emailUrl}>Send me an email</Link>
          </Button>

          <Button asChild variant='outline' className='h-full py-[9px]'>
            <Link href={calendarBookingUrl} target='_blank' rel='noopener'>
              Book a call with me
            </Link>
          </Button>

          <GitHubStarCounter className='h-full py-[9px]' />
        </div>
      </DotsSection>
    </PageContainer>
  )
}
