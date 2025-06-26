import Link from 'next/link'

import { DotsSection } from '@/components/dots-section'
import { ExampleAgenticConfigs } from '@/components/example-agentic-configs'
import { Features } from '@/components/features'
import { GitHubStarCounter } from '@/components/github-star-counter'
import { SupplySideCTA } from '@/components/supply-side-cta'
import { githubUrl, twitterUrl } from '@/lib/config'

export default function MCPAuthorsPage() {
  return (
    <>
      {/* Hero section */}
      <DotsSection className='mb-16'>
        <div className='flex flex-col gap-8 relative z-10'>
          <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
            Your API → Paid MCP, Instantly
          </h1>

          <h5 className='text-center text-lg max-w-2xl'>
            Run one command to turn any MCP server or OpenAPI service into a
            paid MCP product,{' '}
            <em>with built-in distribution to over 20k AI engineers</em>.
          </h5>

          <SupplySideCTA />
        </div>
      </DotsSection>

      {/* How it works section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          How It Works
        </h2>

        <div>TODO</div>
      </section>

      {/* Config section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Simple, Declarative Configuration
        </h2>

        <ExampleAgenticConfigs />

        <div className='flex flex-col gap-4 text-sm max-w-2xl text-center'>
          <p>
            Configuring your Agentic project is straightforward, regardless of
            whether your origin is an MCP server or an OpenAPI service. For TS
            projects, you can use a fully-typed{' '}
            <span className='font-semibold'>agentic.config.ts</span> file, or
            fall back to using an{' '}
            <span className='font-semibold'>agentic.config.json</span> file to
            configure your project.
          </p>
        </div>
      </section>

      {/* Features section */}
      <section className='flex flex-col gap-8 md:gap-12 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Production-Ready MCP Gateway
        </h2>

        <Features />
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

      {/* CTA section */}
      <DotsSection className='mb-16'>
        <div className='flex flex-col gap-12 z-10'>
          <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
            Deploy Your MCP Today
          </h2>

          <SupplySideCTA variant='github-2' />
        </div>
      </DotsSection>
    </>
  )
}
