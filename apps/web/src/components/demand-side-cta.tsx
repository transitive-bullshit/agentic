import Link from 'next/link'

import { HeroButton } from '@/components/hero-button'
import { Button } from '@/components/ui/button'

export function DemandSideCTA() {
  return (
    <div className='flex justify-center items-center gap-4 sm:gap-8'>
      <HeroButton asChild className='h-full'>
        <Link href='/marketplace' className='font-mono'>
          gotoTools();
        </Link>
      </HeroButton>

      <Button variant='outline' asChild className='h-full py-[9px]'>
        <Link href='https://docs.agentic.so' className='font-mono'>
          readTheDocs();
        </Link>
      </Button>
    </div>
  )
}
