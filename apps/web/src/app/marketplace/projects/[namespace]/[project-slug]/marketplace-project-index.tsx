'use client'

import { assert, omit, sanitizeSearchParams } from '@agentic/platform-core'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { PageContainer } from '@/components/page-container'
import { ProjectPricingPlans } from '@/components/project-pricing-plans'
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
  const [isLoadingStripeCheckoutForPlan, setIsLoadingStripeCheckoutForPlan] =
    useState<string | null>(null)
  const router = useRouter()

  // Load the public project
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

  // If the user is authenticated, check if they have an active subscription to
  // this project
  const {
    data: consumer,
    isLoading: isConsumerLoading
    // isError: isConsumerError
  } = useQuery({
    queryKey: [
      'project',
      projectIdentifier,
      'user',
      ctx?.api.authSession?.user.id
    ],
    queryFn: () =>
      ctx!.api.getConsumerByProjectIdentifier({
        projectIdentifier
      }),
    enabled: !!ctx?.isAuthenticated
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
        return router.push(
          `/signup?${sanitizeSearchParams({
            next: `/marketplace/projects/${projectIdentifier}?checkout=true&plan=${pricingPlanSlug}`
          }).toString()}`
        )
      }

      let checkoutSession: { url: string; id: string } | undefined

      try {
        setIsLoadingStripeCheckoutForPlan(pricingPlanSlug)
        const res = await ctx!.api.createConsumerCheckoutSession({
          deploymentId: lastPublishedDeploymentId!,
          plan: pricingPlanSlug
        })

        console.log('checkout', res)
        checkoutSession = res.checkoutSession
      } catch (err) {
        return toastError(err, { label: 'Error creating checkout session' })
      } finally {
        setIsLoadingStripeCheckoutForPlan(null)
      }

      return router.push(checkoutSession.url)
    },
    [ctx, projectIdentifier, project, router]
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
      !isConsumerLoading &&
      !hasInitializedCheckoutFromSearchParams.current
    ) {
      hasInitializedCheckoutFromSearchParams.current = true

      if (consumer?.plan !== plan) {
        // Start checkout flow if search params have `?checkout=true&plan={plan}`
        // This is to allow unauthenticated users to subscribe to a plan by first
        // visiting `/login` or `/signup` and then being redirected to this page
        // with the target checkout search params already pre-filled.
        // Another use case for this functionality is providing a single link to
        // subscribe to a specific project and pricing plan – with the checkout
        // details pre-filled.
        void onSubscribe(checkout)
      }
    }
  }, [
    checkout,
    plan,
    ctx,
    project,
    isConsumerLoading,
    consumer,
    onSubscribe,
    hasInitializedCheckoutFromSearchParams
  ])

  return (
    <PageContainer>
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
              {project.name}
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

            <ProjectPricingPlans
              project={project}
              consumer={consumer}
              isLoadingStripeCheckoutForPlan={isLoadingStripeCheckoutForPlan}
              onSubscribe={onSubscribe}
            />
          </>
        )}
      </section>
    </PageContainer>
  )
}
