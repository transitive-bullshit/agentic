import Link from 'next/link'

import { DemandSideCTA } from '@/components/demand-side-cta'
import { DotsSection } from '@/components/dots-section'
import { ExampleUsageSection } from '@/components/example-usage-section'
import { GitHubStarCounter } from '@/components/github-star-counter'
import { HeroSimulation2 } from '@/components/hero-simulation-2'
import { MCPMarketplaceFeatures } from '@/components/mcp-marketplace-features'
import { PageContainer } from '@/components/page-container'
import { SupplySideCTA } from '@/components/supply-side-cta'
import { githubUrl, twitterUrl } from '@/lib/config'

export default async function TheBestDamnLandingPageEver() {
  return (
    <PageContainer>
      {/* Hero section */}
      <section className='flex flex-col gap-10 mb-16'>
        <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
          The App Store for LLM Tools
        </h1>

        <h5 className='text-center text-lg max-w-2xl'>
          Agentic is a curated marketplace of LLM tools that work with every
          major LLM SDK and MCP client.
        </h5>

        <DemandSideCTA />
      </section>

      {/* Example usage section */}
      <ExampleUsageSection />

      {/* Features section */}
      <section className='flex flex-col items-center gap-8 text-center mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Agentic tools are{' '}
          <span className='font-semibold'>optimized for LLMs</span>
        </h2>

        <MCPMarketplaceFeatures />
      </section>

      {/* MCP section */}
      <section className='flex flex-col items-center gap-8 text-center mb-16 max-w-2xl'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Agentic makes <span className='font-semibold'>MCP fun!</span>
        </h2>

        <div className='h-96 w-full rounded-lg overflow-hidden shadow-sm'>
          <HeroSimulation2 />
        </div>

        <p className='italic font-semibold'>
          Agentic's mission is to provide the world's best library of tools for
          AI agents.
        </p>

        <p>
          <Link
            href='https://docs.agentic.so/publishing/quickstart'
            className='link'
          >
            And of course, <span className='font-semibold'>MCP</span> is an
            integral part of that mission. We're working on a bunch of features
            designed to simplify advanced MCP use cases like bundling multiple
            tools, shared auth profiles, Vercel-like preview deployments, and a
            lot more...
          </Link>
        </p>
      </section>

      {/* CTA section */}
      <DotsSection className='flex flex-col gap-12 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Publish your own MCP products with Agentic
        </h2>

        <h5 className='text-center max-w-2xl'>
          Run one command to turn any MCP server or OpenAPI service into a paid
          MCP product. With built-in support for every major LLM SDK and MCP
          client.
        </h5>

        <SupplySideCTA variant='docs' />
      </DotsSection>

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

      {/* Social proof section (TODO) */}
      {/* <section className='gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          TODO: social proof
        </h2>

        <p className='text-center text-lg max-w-2xl'>TODO</p>
      </section> */}

      {/* Demand-side CTA section */}
      <DotsSection className='flex flex-col gap-12 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Level up your AI Agents with the best tools
        </h2>

        <DemandSideCTA />
      </DotsSection>
    </PageContainer>
  )
}
