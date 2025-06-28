import Link from 'next/link'

import { highlight } from '@/components/code-block/highlight'
import { DemandSideCTA } from '@/components/demand-side-cta'
import { DotsSection } from '@/components/dots-section'
import { ExampleUsage } from '@/components/example-usage'
import { GitHubStarCounter } from '@/components/github-star-counter'
import { githubUrl, twitterUrl } from '@/lib/config'
import {
  defaultConfig,
  getCodeForDeveloperConfig
} from '@/lib/developer-config'
import { globalAgenticApiClient } from '@/lib/global-api'

export default async function TheBestDamnLandingPageEver() {
  const projectIdentifier = '@agentic/search'
  const prompt = 'What is the latest news about AI?'

  const initialProject =
    await globalAgenticApiClient.getPublicProjectByIdentifier({
      projectIdentifier,
      populate: ['lastPublishedDeployment']
    })

  // TODO: this should be loaded in `ExampleUsage`
  const initialCodeSnippet = getCodeForDeveloperConfig({
    config: defaultConfig,
    project: initialProject,
    deployment: initialProject.lastPublishedDeployment!,
    identifier: projectIdentifier,
    prompt
  })
  const initialCodeBlock = await highlight(initialCodeSnippet)

  return (
    <>
      {/* Hero section */}
      <DotsSection className='mb-16'>
        <div className='flex flex-col gap-10 relative z-10'>
          <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
            The App Store for LLM Tools
          </h1>

          <h5 className='text-center text-lg max-w-2xl'>
            Agentic is a curated marketplace of production-grade LLM tools. All
            tools are exposed as both MCP servers as well as simple HTTP APIs.
          </h5>

          <DemandSideCTA />
        </div>
      </DotsSection>

      {/* <div className='w-[40%] h-full min-h-full' />

          <HeroSimulation2 className='absolute! top-[-50%]! left-[30%] w-full h-[200%]!' /> */}

      {/* How it works section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Agentic tools work <span className='font-semibold'>everywhere</span>
        </h2>

        <ExampleUsage
          projectIdentifier={projectIdentifier}
          prompt={prompt}
          project={initialProject}
          initialCodeBlock={initialCodeBlock}
        />

        <div className='flex flex-col gap-4 text-sm max-w-2xl text-center'>
          <p>
            This example uses the{' '}
            <Link
              href={`/marketplace/projects/${projectIdentifier}`}
              className='link'
            >
              {projectIdentifier}
            </Link>{' '}
            tool to provide an LLM access to the web.
          </p>

          <p>
            All Agentic tools are exposed as both{' '}
            <span className='font-semibold'>MCP servers</span> as well as simple{' '}
            <span className='font-semibold'>HTTP APIs</span>. MCP is important
            for interop and future-proofing, whereas simple HTTP POST requests
            make tool use easy to debug and simplifies integration with existing
            LLM tool calling.
          </p>
        </div>
      </section>

      {/* Marketplace section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          MCP Tools that just work
        </h2>

        <p>
          <i>Coming soon...</i>
        </p>
      </section>

      {/* Open source section */}
      <section className='flex flex-col items-center gap-8 max-w-2xl text-center mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Agentic is 100% Open Source
        </h2>

        <p className=''>
          Agentic is a fully OSS{' '}
          <span className='font-semibold'>TypeScript</span> project with a small
          but vibrant developer community.{' '}
          <Link
            href={githubUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            Check out the source on GitHub
          </Link>{' '}
          or{' '}
          <Link
            href={twitterUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            ping me on Twitter with questions / feedback
          </Link>
          .
        </p>

        <GitHubStarCounter />
      </section>

      {/* Social proof section */}
      <section className='gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          TODO: social proof
        </h2>

        <p className='text-center text-lg max-w-2xl'>TODO</p>
      </section>

      {/* CTA section */}

      <DotsSection className='mb-16'>
        <div className='flex flex-col gap-12 relative z-10'>
          <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
            Level up your AI Agents with the best tools
          </h2>

          <DemandSideCTA />
        </div>
      </DotsSection>
    </>
  )
}
