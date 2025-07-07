import type {
  Consumer,
  // PricingInterval,
  PricingPlan,
  Project
} from '@agentic/platform-types'
import humanNumber from 'human-number'
import {
  CornerDownRightIcon,
  Loader2Icon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldMinusIcon
} from 'lucide-react'
import Link from 'next/link'
import plur from 'plur'

import { Button } from '@/components/ui/button'
import {
  getRateLimitIntervalLabel,
  pricingAmountToFixedString
} from '@/lib/utils'

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
  const isFreePlan = plan.slug === 'free'

  const deployment = project.lastPublishedDeployment
  const requestsRateLimit = plan.rateLimit ?? deployment?.defaultRateLimit

  // TODO: support custom line-items
  // const customLineItems = lineItems.find(
  //   (lineItem) => lineItem.slug !== 'base' && lineItem.slug !== 'requests'
  // )

  // TODO: support defaultAggregation
  // TODO: support trialPeriodDays
  // TODO: highlight if any tools are disabled on this pricing plan

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
              <div className='text-4xl font-semibold leading-none py-2'>
                $
                {baseLineItem
                  ? pricingAmountToFixedString(baseLineItem.amount)
                  : 0}
              </div>

              <div className='text-sm'>/ {interval}</div>
            </div>

            {requestsLineItem && !isFreePlan && (
              <div className='flex flex-col gap-2'>
                <h4 className='text-sm/6 font-medium'>Requests:</h4>

                {requestsLineItem.billingScheme === 'per_unit' ? (
                  <div className='ml-4 flex flex-row items-center gap-2'>
                    <div className='text-xl font-semibold leading-none py-2'>
                      ${pricingAmountToFixedString(requestsLineItem.unitAmount)}
                    </div>

                    <div className='text-sm'>
                      / per{' '}
                      {requestsLineItem.transformQuantity
                        ? `${requestsLineItem.transformQuantity.divideBy} ${plur('request', requestsLineItem.transformQuantity.divideBy)}`
                        : 'request'}
                    </div>
                  </div>
                ) : requestsLineItem.billingScheme === 'tiered' ? (
                  <div className='ml-4 flex flex-col gap-2'>
                    {requestsLineItem.tiers?.map((tier, index) => {
                      const isFirst = index === 0
                      const hasUnitAmount = tier.unitAmount !== undefined
                      const isFree = hasUnitAmount
                        ? // TODO: are these two mutually exclusive? check in stripe
                          tier.unitAmount === 0
                        : tier.flatAmount === 0

                      const isTierInfinite = tier.upTo === 'inf'
                      const numLabel =
                        tier.upTo === 'inf'
                          ? 'infinite requests'
                          : `${humanNumber(tier.upTo)} ${plur('request', tier.upTo)}`
                      const price = `$${pricingAmountToFixedString(
                        hasUnitAmount ? tier.unitAmount! : tier.flatAmount!
                      )}${hasUnitAmount ? ' per request' : ''}`

                      const numDesc = isFree
                        ? isFirst
                          ? isTierInfinite
                            ? `FREE for all requests per ${interval}`
                            : `FREE for the first ${numLabel} per ${interval}`
                          : isTierInfinite
                            ? `FREE for all requests after that per ${interval}`
                            : `FREE for requests up to ${numLabel} per ${interval}`
                        : isFirst
                          ? isTierInfinite
                            ? `${price} per ${interval}`
                            : `${price} for the first ${numLabel} per ${interval}`
                          : isTierInfinite
                            ? `${price} after that per ${interval}`
                            : `${price} up to ${numLabel} per ${interval}`

                      return (
                        <div
                          key={index}
                          className='flex flex-row items-center gap-2 text-sm text-secondary-foreground/80'
                        >
                          <CornerDownRightIcon className='size-4' />

                          <span>{numDesc}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div>Unsupported pricing config. Please contact support.</div>
                )}
              </div>
            )}

            {isFreePlan && (
              <p className='text-pretty text-sm text-secondary-foreground/80'>
                Try before you buy. 100% free!
              </p>
            )}

            {requestsRateLimit?.enabled && (
              <div className='flex flex-row items-center gap-2 text-sm text-secondary-foreground/80'>
                {isFreePlan ? (
                  <ShieldMinusIcon aria-hidden className='size-4' />
                ) : (
                  <ShieldCheckIcon aria-hidden className='size-4' />
                )}

                <span>
                  {isFreePlan ? 'Limited' : 'Rate-limited'} to{' '}
                  {requestsRateLimit.limit} requests per{' '}
                  {getRateLimitIntervalLabel(requestsRateLimit.interval)}
                </span>
              </div>
            )}

            {plan.features && (
              <div className='flex flex-col gap-2'>
                <h4 className='text-sm/6 font-medium'>Features:</h4>

                <ul className='ml-4 flex flex-col gap-2 list-disc'>
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className='flex flex-row items-center gap-2 text-sm text-secondary-foreground/80'
                    >
                      <PlusIcon aria-hidden className='size-4' />

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {requestsLineItem?.billingScheme === 'tiered' && (
              <p className='text-pretty text-xs/5 text-muted-foreground'>
                {requestsLineItem.tiersMode === 'graduated' ? (
                  <>
                    Requests pricing tiers use{' '}
                    <Link
                      href='https://docs.stripe.com/products-prices/pricing-models#graduated-pricing'
                      className='link'
                      target='_blank'
                      rel='noreferrer'
                    >
                      graduated pricing
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Requests pricing tiers use{' '}
                    <Link
                      href='https://docs.stripe.com/products-prices/pricing-models#volume-based-pricing'
                      className='link'
                      target='_blank'
                      rel='noreferrer'
                    >
                      volume-based pricing
                    </Link>
                    .
                  </>
                )}
              </p>
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
