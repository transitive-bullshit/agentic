'use client'

import { assert, omit, sanitizeSearchParams } from '@agentic/platform-core'
import { redirect, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

import { useAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { toast, toastError } from '@/lib/notifications'
import { useQuery } from '@/lib/query-client'

export function MarketplaceProjectIndex({
  projectIdentifier
}: {
  projectIdentifier: string
}) {
  const ctx = useAgentic()
  const searchParams = useSearchParams()
  const checkout = searchParams.get('checkout')
  const plan = searchParams.get('plan')

  const {
    data: project,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['project', projectIdentifier],
    queryFn: () =>
      ctx!.api.getPublicProjectByIdentifier({
        projectIdentifier,
        populate: ['lastPublishedDeployment']
      }),
    enabled: !!ctx
  })

  const onSubscribe = useCallback(
    async (pricingPlanSlug: string) => {
      assert(ctx, 500, 'Agentic context is required')
      assert(project, 500, 'Project is required')
      const { lastPublishedDeploymentId } = project
      assert(
        lastPublishedDeploymentId,
        500,
        `Public project "${projectIdentifier}" expected to have a last published deployment, but none found.`
      )

      if (!ctx.isAuthenticated) {
        return redirect(
          `/signup?${sanitizeSearchParams({
            next: `/marketplace/projects/${projectIdentifier}?checkout=true&plan=${pricingPlanSlug}`
          }).toString()}`
        )
      }

      let checkoutSession: { url: string; id: string } | undefined

      try {
        const res = await ctx!.api.createConsumerCheckoutSession({
          deploymentId: lastPublishedDeploymentId!,
          plan: pricingPlanSlug
        })

        console.log('checkoutSession', res)
        checkoutSession = res.checkoutSession
      } catch (err) {
        return toastError(err, { label: 'Error creating checkout session' })
      }

      redirect(checkoutSession.url)
    },
    [ctx, projectIdentifier, project]
  )

  const hasInitializedCheckoutFromSearchParams = useRef(false)

  useEffect(() => {
    if (!ctx) return

    if (checkout === 'canceled') {
      toast('Checkout canceled')
    } else if (
      checkout === 'true' &&
      plan &&
      project &&
      !hasInitializedCheckoutFromSearchParams.current
    ) {
      hasInitializedCheckoutFromSearchParams.current = true

      // Start checkout flow if search params have `?checkout=true&plan={plan}`
      // This is to allow unauthenticated users to subscribe to a plan by first
      // visiting `/login` or `/signup` and then being redirected to this page
      // with the target checkout search params already pre-filled.
      // Another use case for this functionality is providing a single link to
      // subscribe to a specific project and pricing plan – with the checkout
      // details pre-filled.
      void onSubscribe(checkout)
    }
  }, [
    checkout,
    plan,
    ctx,
    project,
    onSubscribe,
    hasInitializedCheckoutFromSearchParams
  ])

  return (
    <section>
      {!ctx || isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <p>Error fetching project</p>
      ) : !project ? (
        <p>Project "{projectIdentifier}" not found</p>
      ) : (
        <>
          <h1
            className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
          >
            Project {project.name}
          </h1>

          <div className='mt-8'>
            <pre className='max-w-lg'>
              {JSON.stringify(
                omit(project, 'lastPublishedDeployment', 'lastDeployment'),
                null,
                2
              )}
            </pre>
          </div>

          <div className='mt-8'>
            <h2 className='text-center text-balance leading-snug md:leading-none text-2xl font-extrabold mb-4'>
              Pricing Plans
            </h2>

            {project.lastPublishedDeployment!.pricingPlans.map((plan) => (
              <div key={plan.slug} className='grid gap-4'>
                <h3 className='text-center text-balance leading-snug md:leading-none text-xl font-bold'>
                  {plan.name}
                </h3>

                <pre className='max-w-lg'>{JSON.stringify(plan, null, 2)}</pre>

                <Button
                  onClick={() =>
                    onSubscribe(
                      project.lastPublishedDeployment?.pricingPlans[0]?.slug ??
                        'free'
                    )
                  }
                  disabled={
                    !project.lastPublishedDeployment?.pricingPlans[0]?.slug
                  }
                >
                  Subscribe to "{plan.name}"
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
