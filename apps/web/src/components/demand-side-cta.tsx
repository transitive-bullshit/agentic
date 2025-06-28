import Link from 'next/link'

import { HeroButton } from '@/components/hero-button'
import { Button } from '@/components/ui/button'
import { docsUrl } from '@/lib/config'

export function DemandSideCTA() {
  return (
    <div className='flex justify-center items-center gap-12'>
      <HeroButton asChild className='h-full'>
        <Link href='/marketplace' className='font-mono'>
          gotoTools();
        </Link>
      </HeroButton>

      <Button variant='outline' asChild className='h-full'>
        <Link href={docsUrl} className='font-mono'>
          readTheDocs();
        </Link>
      </Button>
    </div>
  )
}
