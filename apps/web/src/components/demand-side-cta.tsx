import Link from 'next/link'

import { HeroButton } from '@/components/hero-button'
import { Button } from '@/components/ui/button'
import { docsMarketplaceUrl } from '@/lib/config'

export function DemandSideCTA() {
  return (
    <div className='flex justify-center items-center gap-8'>
      <HeroButton asChild className='h-full'>
        <Link href='/marketplace' className='font-mono'>
          gotoTools();
        </Link>
      </HeroButton>

      <Button variant='outline' asChild className='h-full'>
        <Link href={docsMarketplaceUrl} className='font-mono'>
          readDocs();
        </Link>
      </Button>
    </div>
  )
}
