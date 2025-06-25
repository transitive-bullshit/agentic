import Link from 'next/link'

import { DemandSideCTA } from '@/components/demand-side-cta'
import { ExampleUsage } from '@/components/example-usage'
import { GitHubStarCounter } from '@/components/github-star-counter'
import { githubUrl, twitterUrl } from '@/lib/config'

export default function TheBestDamnLandingPageEver() {
  return (
    <>
      {/* Hero section */}
      <section className='mb-16 relative'>
        <div className='absolute top-0 bottom-0 left-0 right-0 bg-[url(/dots.svg)] bg-repeat bg-center bg-size-[32px_auto] opacity-30 dark:opacity-100' />

        <div className='absolute top-0 bottom-0 left-0 right-0 bg-[radial-gradient(39%_50%_at_50%_50%,rgba(255,255,255,.3)_0%,rgb(255,255,255)_100%)] dark:bg-[radial-gradient(39%_50%_at_50%_50%,rgba(10,10,10,0)_0%,rgb(10,10,10)_100%)]' />

        <div className='flex flex-col gap-8 relative z-10'>
          <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
            The App Store for LLM Tools
          </h1>

          <h5 className='text-center text-lg max-w-2xl'>
            Agentic is a curated marketplace of production-grade LLM tools. All
            tools are exposed as both MCP servers as well as simple HTTP APIs.
          </h5>

          <DemandSideCTA />
        </div>
      </section>

      <section></section>

      {/* How it works section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          How It Works
        </h2>

        <ExampleUsage />
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
          Open source is very dear to my heart, and I couldn't be happier that
          Agentic is fully OSS. It's written in{' '}
          <span className='font-semibold'>TypeScript</span> and has a small but
          vibrant developer community.{' '}
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
      <section className='flex flex-col gap-12 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Level up your AI Agents with the best tools
        </h2>

        <DemandSideCTA />
      </section>
    </>
  )
}
