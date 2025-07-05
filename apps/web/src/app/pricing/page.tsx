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
        Pricing
      </h1>

      <div className='grid grid-cols-1 rounded-[2rem] shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:w-full max-lg:max-w-md max-w-lg'>
        <div className='grid grid-cols-1 rounded-[2rem] p-2 shadow-md shadow-black/5'>
          <div className='rounded-3xl bg-background p-8 pb-9 shadow-2xl ring-1 ring-black/5 flex flex-col gap-4'>
            <p>
              Pricing for devs publishing products on Agentic is a work in
              progress. We're looking for early adopters to work with us to
              figure out the best pricing structure.
            </p>

            <p>
              If you're interested in publishing a product on Agentic, please
              get in touch.
            </p>
          </div>
        </div>
      </div>

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
