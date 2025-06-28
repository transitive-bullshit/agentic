import Image from 'next/image'
import Link from 'next/link'
import Zoom from 'react-medium-image-zoom'

import { DotsSection } from '@/components/dots-section'
// import { ExampleAgenticConfigs } from '@/components/example-agentic-configs'
import { GitHubStarCounter } from '@/components/github-star-counter'
import { MCPGatewayFeatures } from '@/components/mcp-gateway-features'
import { PageContainer } from '@/components/page-container'
import { SupplySideCTA } from '@/components/supply-side-cta'
import { docsPublishingUrl, githubUrl, twitterUrl } from '@/lib/config'
import mcpGatewayDiagramLight from '@/public/agentic-mcp-gateway-mvp-diagram-light.png'

export default function PublishingMCPsPage() {
  return (
    <PageContainer>
      {/* Hero section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
          Your API → Paid MCP, Instantly
        </h1>

        <h5 className='text-center text-lg max-w-2xl'>
          Run one command to turn any MCP server or OpenAPI service into a paid
          MCP product. With built-in support every major LLM SDK and MCP client.
        </h5>

        <SupplySideCTA />
      </section>

      {/* How it works section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          How It Works
        </h2>

        <div className='w-full max-w-3xl flex flex-col items-center border rounded-lg shadow-sm overflow-hidden p-4 bg-white'>
          <Zoom>
            <Image
              src={mcpGatewayDiagramLight.src}
              alt='MCP Gateway Demo'
              width={mcpGatewayDiagramLight.width}
              height={mcpGatewayDiagramLight.height}
              className='w-full rounded-lg overflow-hidden'
            />
          </Zoom>
        </div>

        <p className='text-sm max-w-2xl text-center'>
          <Link href={docsPublishingUrl} className='link'>
            Deploy any MCP server or OpenAPI service to Agentic's MCP Gateway,
            which handles auth, billing, rate-limiting, caching, etc. And
            instantly turn your API into a paid MCP product that supports every
            major LLM SDK and MCP client.
          </Link>
        </p>
      </section>

      {/* Config section (TODO) */}
      {/* <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Simple, Declarative Configuration
        </h2>

        <ExampleAgenticConfigs />

        <p className='text-sm max-w-2xl text-center'>
          <Link href={`${docsPublishingUrl}/config`} className='link'>
            Configuring your Agentic project
          </Link>{' '}
          is straightforward , regardless of whether your origin is an MCP
          server or an OpenAPI service. For TS projects, you can use a
          fully-typed <span className='font-semibold'>agentic.config.ts</span>{' '}
          file, or fall back to using an{' '}
          <span className='font-semibold'>agentic.config.json</span> file to
          configure your project.{' '}
          <Link href={docsPublishingUrl} className='link'>
            Learn more
          </Link>
          .
        </p>
      </section> */}

      {/* Features section */}
      <section className='flex flex-col gap-8 md:gap-12 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Production-Ready MCP Gateway
        </h2>

        <MCPGatewayFeatures />
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
    </PageContainer>
  )
}
