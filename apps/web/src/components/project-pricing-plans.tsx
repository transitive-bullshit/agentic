import type { Consumer, Project } from '@agentic/platform-types'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ProjectPricingPlans({
  project,
  consumer,
  isLoadingStripeCheckoutForPlan,
  onSubscribe
}: {
  project: Project
  consumer?: Consumer
  isLoadingStripeCheckoutForPlan: string | null
  onSubscribe: (planSlug: string) => void
  className?: string
}) {
  // TODO: add support for different pricing intervals
  const numPricingPlans =
    project.lastPublishedDeployment?.pricingPlans.length || 1

  return (
    <div
      className={`grid grid-cols grid-cols-1 gap-4 sm:grid-cols-${Math.min(
        2,
        numPricingPlans
      )} xl:grid-cols-${Math.min(3, numPricingPlans)}`}
    >
      {project.lastPublishedDeployment!.pricingPlans.map((plan) => (
        <div
          key={plan.slug}
          className='bg-card flex flex-col gap-4 p-4 border rounded-lg shadow-sm color-card-foreground'
        >
          <h3 className='text-center text-balance leading-snug md:leading-none text-xl font-semibold'>
            {plan.name}
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
      ))}
    </div>
  )
}
