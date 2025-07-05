import type { Consumer, PricingPlan, Project } from '@agentic/platform-types'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ProjectPricingPlan({
  plan,
  consumer,
  isLoadingStripeCheckoutForPlan,
  onSubscribe
}: {
  project: Project
  plan: PricingPlan
  consumer?: Consumer
  isLoadingStripeCheckoutForPlan: string | null
  onSubscribe: (planSlug: string) => void
  className?: string
}) {
  return (
    <div className='justify-self-center w-full grid grid-cols-1 rounded-[2rem] shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:w-full max-lg:max-w-md max-w-lg'>
      <div className='grid grid-cols-1 rounded-[2rem] p-2 shadow-md shadow-black/5'>
        <div className='rounded-3xl bg-card p-4 shadow-2xl ring-1 ring-black/5 flex flex-col gap-4 color-card-foreground'>
          <h3 className='text-center text-balance leading-snug md:leading-none text-xl font-semibold'>
            {plan.name} <span className='sr-only'>Plan</span>
          </h3>

          <pre className='max-w-lg'>{JSON.stringify(plan, null, 2)}</pre>

          <Button
            onClick={() => onSubscribe(plan.slug)}
            // TODO: handle free plans correctly
            disabled={
              consumer?.plan === plan.slug || !!isLoadingStripeCheckoutForPlan
            }
          >
            {isLoadingStripeCheckoutForPlan === plan.slug && (
              <Loader2Icon className='animate-spin mr-2' />
            )}

            {consumer?.plan === plan.slug ? (
              <span>Currently subscribed to "{plan.name}"</span>
            ) : (
              <span>Subscribe to "{plan.name}"</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
