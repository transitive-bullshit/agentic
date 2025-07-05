import type {
  Consumer,
  // PricingInterval,
  PricingPlan,
  Project
} from '@agentic/platform-types'
import humanNumber from 'human-number'
import { Loader2Icon, PlusIcon } from 'lucide-react'
import plur from 'plur'

import { Button } from '@/components/ui/button'

// const intervalToLabelMap: Record<PricingInterval, string> = {
//   day: 'daily',
//   week: 'weekly',
//   month: 'monthly',
//   year: 'yearly'
// }

export function ProjectPricingPlan({
  project,
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
  const { defaultPricingInterval } = project
  const { lineItems } = plan
  const interval = plan.interval ?? defaultPricingInterval
  // const intervalLabel = intervalToLabelMap[interval]
  const baseLineItem = lineItems.find((lineItem) => lineItem.slug === 'base')
  const requestsLineItem = lineItems.find(
    (lineItem) => lineItem.slug === 'requests'
  )
  // TODO
  // const customLineItems = lineItems.find(
  //   (lineItem) => lineItem.slug !== 'base' && lineItem.slug !== 'requests'
  // )

  // TODO: support transformQuantity.divideBy
  // TODO: support defaultAggregation

  // TODO: toFixed(2) doesn't work for usage-based pricing with small amounts

  return (
    <div className='justify-self-center w-full grid grid-cols-1 rounded-[2rem] shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:w-full max-lg:max-w-md max-w-lg'>
      <div className='grid grid-cols-1 rounded-[2rem] p-2 shadow-md shadow-black/5'>
        <div className='rounded-3xl bg-card p-4 shadow-2xl ring-1 ring-black/5 flex flex-col gap-4 color-card-foreground justify-between'>
          <div className='flex flex-col gap-4'>
            <h3 className='text-center text-balance leading-snug md:leading-none text-xl font-semibold'>
              {plan.name} <span className='sr-only'>Plan</span>
            </h3>

            {plan.description && <p>{plan.description}</p>}

            <div className='flex flex-row items-center gap-2'>
              <div className='text-4xl font-semibold text-gray-950 leading-none py-2'>
                ${baseLineItem ? (baseLineItem.amount / 100).toFixed(2) : 0}
              </div>

              <div className='text-sm text-gray-600'>/ {interval}</div>
            </div>

            {requestsLineItem && plan.slug !== 'free' && (
              <div className='flex flex-col gap-2'>
                <h4 className='text-sm/6 font-medium text-gray-950'>
                  Requests:
                </h4>

                {requestsLineItem.billingScheme === 'per_unit' ? (
                  <div className='flex flex-row items-center gap-2'>
                    <div className='text-xl font-semibold text-gray-950 leading-none py-2'>
                      $
                      {requestsLineItem.unitAmount <= 0
                        ? 0
                        : (requestsLineItem.unitAmount / 100).toFixed(2)}
                    </div>

                    <div className='text-sm text-gray-600'>
                      /{' '}
                      {requestsLineItem.transformQuantity
                        ? `${requestsLineItem.transformQuantity.divideBy} ${plur('request', requestsLineItem.transformQuantity.divideBy)}`
                        : 'request'}
                    </div>
                  </div>
                ) : requestsLineItem.billingScheme === 'tiered' ? (
                  requestsLineItem.tiersMode === 'graduated' ? (
                    <div>TODO</div>
                  ) : requestsLineItem.tiersMode === 'volume' ? (
                    <div>
                      {requestsLineItem.tiers?.map((tier, index) => {
                        const isFirst = index === 0
                        // const isLast = index >= requestsLineItem.tiers!.length - 1
                        const hasUnitAmount = tier.unitAmount !== undefined
                        // const hasFlatAmount = tier.flatAmount !== undefined
                        const isFree = hasUnitAmount
                          ? // TODO: are these two mutually exclusive? check in stripe
                            tier.unitAmount === 0
                          : tier.flatAmount === 0

                        // TODO: improve `inf` label
                        const numLabel =
                          tier.upTo === 'inf'
                            ? 'infinite requests'
                            : `${humanNumber(tier.upTo)} ${plur('request', tier.upTo)}`

                        return (
                          <div key={index} className=''>
                            {isFree ? (
                              isFirst ? (
                                <div>FREE for the first {numLabel}</div>
                              ) : (
                                <div>
                                  $
                                  {hasUnitAmount
                                    ? (tier.unitAmount! / 100)
                                        .toFixed(10)
                                        .replace(/0+$/, '')
                                    : (tier.flatAmount! / 100)
                                        .toFixed(10)
                                        .replace(/0+$/, '')}{' '}
                                  {hasUnitAmount ? `per request ` : ''}up to{' '}
                                  {numLabel}
                                </div>
                              )
                            ) : (
                              <div>
                                $
                                {hasUnitAmount
                                  ? (tier.unitAmount! / 100)
                                      .toFixed(10)
                                      .replace(/0+$/, '')
                                  : (tier.flatAmount! / 100)
                                      .toFixed(10)
                                      .replace(/0+$/, '')}{' '}
                                {hasUnitAmount ? `per request ` : ''}up to{' '}
                                {numLabel}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div>
                      Unsupported pricing config. Please contact support.
                    </div>
                  )
                ) : (
                  <div>Unsupported pricing config. Please contact support.</div>
                )}
              </div>
            )}

            {plan.features && (
              <div className='flex flex-col gap-2'>
                <h4 className='text-sm/6 font-medium text-gray-950'>
                  Features:
                </h4>

                <ul className='space-y-1'>
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className='group flex flex-row items-start gap-3 text-sm/6 text-gray-600 data-[disabled]:text-gray-400'
                    >
                      <span className='inline-flex h-6 items-center'>
                        <PlusIcon
                          aria-hidden='true'
                          className='size-4 fill-gray-400 group-data-[disabled]:fill-gray-300'
                        />
                      </span>

                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
