import {
  type Consumer,
  getPricingPlansByInterval,
  type PricingInterval,
  type Project
} from '@agentic/platform-types'
import { useLocalStorage } from 'react-use'

import { ProjectPricingPlan } from './project-pricing-plan'

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
  const { defaultPricingInterval } = project
  // TODO
  const [pricingInterval, _setPricingInterval] =
    useLocalStorage<PricingInterval>(
      `pricing-interval-${project.identifier}`,
      defaultPricingInterval
    )

  const deployment = project.lastPublishedDeployment
  if (!deployment || !pricingInterval) {
    return null
  }

  // const numPricingIntervals = deployment.pricingIntervals.length
  // const hasSinglePricingInterval = numPricingIntervals === 1
  const { pricingPlans } = deployment

  const pricingPlansByInterval = Object.fromEntries(
    deployment.pricingIntervals.map((pricingInterval) => [
      pricingInterval,
      getPricingPlansByInterval({ pricingInterval, pricingPlans })
    ])
  )

  const currentPricingIntervalPlans =
    pricingPlansByInterval[pricingInterval] ?? []

  // TODO: add support for different pricing intervals and switching between them
  const numPricingPlans = currentPricingIntervalPlans.length || 1

  return (
    <div className='flex flex-col gap-4'>
      {/* {!hasSinglePricingInterval && ()} */}

      <div
        className={`grid grid-cols grid-cols-1 gap-4 sm:grid-cols-${Math.min(
          2,
          numPricingPlans
        )} xl:grid-cols-${Math.min(3, numPricingPlans)}`}
      >
        {deployment.pricingPlans.map((plan) => (
          <ProjectPricingPlan
            key={plan.slug}
            plan={plan}
            project={project}
            consumer={consumer}
            isLoadingStripeCheckoutForPlan={isLoadingStripeCheckoutForPlan}
            onSubscribe={onSubscribe}
          />
        ))}
      </div>
    </div>
  )
}
