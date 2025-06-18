import Link from 'next/link'

import { HeroButton } from '@/components/hero-button'
import { Button } from '@/components/ui/button'
import { docsMarketplaceUrl } from '@/lib/config'

export function DemandSideCTA() {
  return (
    <div className='flex justify-center items-center gap-8'>
      <HeroButton asChild className='h-full'>
        <Link href='/marketplace'>MCP Marketplace</Link>
      </HeroButton>

      <Button variant='outline' asChild className='h-full'>
        <Link href={docsMarketplaceUrl}>Check out the marketplace docs</Link>
      </Button>
    </div>
  )
}
