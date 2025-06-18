import Link from 'next/link'

import { HeroButton } from '@/components/hero-button'
import { Button } from '@/components/ui/button'
import { calendarBookingUrl, docsQuickStartUrl } from '@/lib/config'

export function SupplySideCTA() {
  return (
    <div className='flex justify-center items-center gap-8'>
      <HeroButton asChild className='h-full'>
        <Link href={docsQuickStartUrl}>Get Started</Link>
      </HeroButton>

      <Button variant='outline' asChild className='h-full'>
        <Link href={calendarBookingUrl} target='_blank' rel='noopener'>
          Book a call with me 👋
        </Link>
      </Button>
    </div>
  )
}
