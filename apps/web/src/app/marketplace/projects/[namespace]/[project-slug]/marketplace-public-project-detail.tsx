'use client'

import type { Project } from '@agentic/platform-types'
import { assert, omit, sanitizeSearchParams } from '@agentic/platform-core'
import { ChevronsUpDownIcon, ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import plur from 'plur'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAgentic } from '@/components/agentic-provider'
import { CodeBlock } from '@/components/code-block'
import { ExampleUsage } from '@/components/example-usage'
import { HeroButton } from '@/components/hero-button'
import { LoadingIndicator } from '@/components/loading-indicator'
import { SSRMarkdown } from '@/components/markdown/ssr-markdown'
import { PageContainer } from '@/components/page-container'
import { ProjectPricingPlans } from '@/components/project-pricing-plans'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitHubIcon } from '@/icons/github'
import { toast, toastError } from '@/lib/notifications'
import { useQuery } from '@/lib/query-client'

import {
  type MarketplacePublicProjectDetailTab,
  marketplacePublicProjectDetailTabsSet,
  MAX_TOOLS_TO_SHOW
} from './utils'

export function MarketplacePublicProjectDetail({
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

  const deployment = useMemo(() => project?.lastPublishedDeployment, [project])
  const featuredToolName = useMemo(() => {
    const toolConfigs = deployment?.toolConfigs?.filter(
      (toolConfig) => toolConfig?.enabled !== false
    )

    return (
      toolConfigs?.find((toolConfig) =>
        toolConfig.examples?.find((example) => example.featured)
      )?.name ??
      toolConfigs?.find((toolConfig) => toolConfig.examples?.length)?.name ??
      toolConfigs?.[0]?.name ??
      deployment?.tools[0]?.name
    )
  }, [deployment])

  const tab = useMemo<MarketplacePublicProjectDetailTab>(() => {
    const tab = searchParams.get('tab')?.toLowerCase()
    if (!tab || !marketplacePublicProjectDetailTabsSet.has(tab)) {
      return 'overview'
    }

    if (tab === 'readme' && !deployment?.readme?.trim()) {
      return 'overview'
    }

    return tab as MarketplacePublicProjectDetailTab
  }, [searchParams, deployment])

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
          <div className='flex flex-col gap-4 w-full'>
            <ProjectHeader project={project} tab={tab} />

            <Tabs
              value={tab}
              onValueChange={(value) => {
                if (value === 'overview') {
                  router.push(`/marketplace/projects/${projectIdentifier}`)
                } else {
                  router.push(
                    `/marketplace/projects/${projectIdentifier}?tab=${value}`
                  )
                }
              }}
            >
              <TabsList>
                <TabsTrigger value='overview' className='cursor-pointer'>
                  Overview
                </TabsTrigger>

                {deployment?.readme?.trim() && (
                  <TabsTrigger value='readme' className='cursor-pointer'>
                    Readme
                  </TabsTrigger>
                )}

                <TabsTrigger
                  value='tools'
                  className='cursor-pointer'
                  disabled={!deployment}
                >
                  Tools
                </TabsTrigger>

                <TabsTrigger
                  value='pricing'
                  className='cursor-pointer'
                  disabled={!deployment}
                >
                  Pricing
                </TabsTrigger>

                <TabsTrigger value='debug' className='cursor-pointer'>
                  Debug
                </TabsTrigger>
              </TabsList>

              <div className='bg-card p-4 border rounded-lg shadow-sm color-card-foreground'>
                {tab === 'overview' && (
                  <TabsContent value='overview' className='flex flex-col gap-4'>
                    <h2 className='text-balance leading-snug md:leading-none text-xl font-semibold'>
                      Overview
                    </h2>

                    <div
                      className={`grid grid-cols grid-cols-1 lg:grid-cols-2 gap-8 md:gap-4`}
                    >
                      <div className='flex flex-col gap-8'>
                        {deployment ? (
                          <>
                            <p>
                              {deployment.description ||
                                'No description available'}
                            </p>

                            <div className='flex flex-col gap-4'>
                              <h3 className='text-balance leading-snug md:leading-none text-lg font-semibold'>
                                Tools
                              </h3>

                              <ul className='flex flex-col gap-4'>
                                {deployment.tools
                                  .slice(0, MAX_TOOLS_TO_SHOW)
                                  .map((tool) => (
                                    <li
                                      key={tool.name}
                                      className='p-4 border rounded-sm w-full flex flex-col gap-4'
                                    >
                                      <h3 className='text-balance leading-snug md:leading-none text-md font-semibold'>
                                        {tool.name}
                                      </h3>

                                      <p className='text-sm text-gray-500'>
                                        {tool.description}
                                      </p>
                                    </li>
                                  ))}

                                {deployment.tools.length >
                                  MAX_TOOLS_TO_SHOW && (
                                  <li>
                                    <Button
                                      asChild
                                      className='w-full flex flex-col gap-4'
                                      variant='outline'
                                    >
                                      <Link
                                        href={`/marketplace/projects/${projectIdentifier}?tab=tools`}
                                      >
                                        View{' '}
                                        {deployment.tools.length -
                                          MAX_TOOLS_TO_SHOW}{' '}
                                        more{' '}
                                        {plur(
                                          'tool',
                                          deployment.tools.length -
                                            MAX_TOOLS_TO_SHOW
                                        )}
                                      </Link>
                                    </Button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <p>
                            This project doesn't have any published deployments.
                          </p>
                        )}
                      </div>

                      <div className='flex flex-col gap-4'>
                        <ExampleUsage
                          projectIdentifier={projectIdentifier}
                          project={project}
                          tool={featuredToolName}
                        />
                      </div>
                    </div>
                  </TabsContent>
                )}

                {deployment?.readme?.trim() && tab === 'readme' && (
                  <TabsContent value='readme' className='flex flex-col gap-4'>
                    <SSRMarkdown
                      markdown={deployment.readme}
                      className='items-start!'
                    />
                  </TabsContent>
                )}

                {tab === 'tools' && (
                  <TabsContent value='tools' className='flex flex-col gap-4'>
                    <h2 className='text-balance leading-snug md:leading-none text-xl font-semibold'>
                      Tools
                    </h2>

                    {deployment && (
                      <ul className='flex flex-col gap-4'>
                        {deployment.tools.map((tool) => (
                          <li
                            key={tool.name}
                            className='p-4 border rounded-sm w-full flex flex-col gap-4'
                          >
                            <h3 className='text-balance leading-snug md:leading-none text-md font-semibold'>
                              {tool.name}
                            </h3>

                            <p className='text-sm text-gray-500'>
                              {tool.description}
                            </p>

                            <Collapsible className='w-full flex flex-col align-start gap-2'>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant='outline'
                                  className='self-start'
                                >
                                  Input schema
                                  <ChevronsUpDownIcon />
                                </Button>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <CodeBlock
                                  lang='json'
                                  code={JSON.stringify(
                                    tool.inputSchema,
                                    null,
                                    2
                                  )}
                                  className='border rounded-sm'
                                />
                              </CollapsibleContent>
                            </Collapsible>

                            {tool.outputSchema && (
                              <Collapsible className='w-full flex flex-col align-start gap-2'>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant='outline'
                                    className='self-start'
                                  >
                                    Output schema
                                    <ChevronsUpDownIcon />
                                  </Button>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                  <CodeBlock
                                    lang='json'
                                    code={JSON.stringify(
                                      tool.outputSchema,
                                      null,
                                      2
                                    )}
                                    className='border rounded-sm'
                                  />
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                )}

                {tab === 'pricing' && (
                  <TabsContent value='pricing' className='flex flex-col gap-4'>
                    <h2 className='text-balance leading-snug md:leading-none text-xl font-semibold'>
                      Pricing
                    </h2>

                    <ProjectPricingPlans
                      project={project}
                      consumer={consumer}
                      isLoadingStripeCheckoutForPlan={
                        isLoadingStripeCheckoutForPlan
                      }
                      onSubscribe={onSubscribe}
                    />
                  </TabsContent>
                )}

                {tab === 'debug' && (
                  <TabsContent value='debug' className='flex flex-col gap-4'>
                    <h2 className='text-balance leading-snug md:leading-none text-xl font-semibold'>
                      Debug
                    </h2>

                    <pre className='max-w-full overflow-x-auto'>
                      {JSON.stringify(
                        omit(
                          project,
                          'lastPublishedDeployment',
                          'lastDeployment'
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        )}
      </section>
    </PageContainer>
  )
}

function ProjectHeader({
  project,
  tab
}: {
  project: Project
  tab?: MarketplacePublicProjectDetailTab
}) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='w-full flex flex-row gap-2.5 items-center'>
        <img
          src={
            project.lastPublishedDeployment?.iconUrl ||
            project.user?.image ||
            '/agentic-icon-circle-light.svg'
          }
          alt={project.name}
          className='aspect-square w-10 h-10'
        />

        <h1 className='flex-1 font-semibold text-balance text-3xl leading-tight'>
          {project.name}
        </h1>

        <HeroButton
          heroVariant='orange'
          className='justify-self-end'
          disabled={tab === 'pricing'}
          asChild={tab !== 'pricing'}
        >
          <Link
            href={`/marketplace/projects/${project.identifier}?tab=pricing`}
          >
            Subscribe to {project.identifier}
          </Link>
        </HeroButton>
      </div>

      <div className='flex flex-row items-center'>
        <div className='text-sm text-muted-foreground flex flex-row gap-0.5 items-center hover:no-underline! no-underline!'>
          <span>{project.identifier}</span>

          {/* TODO: <CopyIcon className='w-4 h-4' /> */}
        </div>

        {project.lastPublishedDeployment?.websiteUrl && (
          <Button asChild variant='link'>
            <Link
              href={project.lastPublishedDeployment.websiteUrl}
              className='text-sm flex flex-row gap-1.5! items-center text-muted-foreground! py-1! px-2!'
              target='_blank'
              rel='noopener noreferrer'
            >
              <ExternalLinkIcon className='w-4 h-4' />

              <span>Homepage</span>
            </Link>
          </Button>
        )}

        {project.lastPublishedDeployment?.sourceUrl && (
          <Button asChild variant='link'>
            <Link
              href={project.lastPublishedDeployment.sourceUrl}
              className='text-sm flex flex-row gap-1.5! items-center text-muted-foreground! py-1! px-2!'
              target='_blank'
              rel='noopener noreferrer'
            >
              <GitHubIcon className='w-4 h-4' />

              <span>GitHub</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
