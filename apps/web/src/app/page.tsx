import Link from 'next/link'

import { GitHubStarCounter } from '@/components/github-star-counter'
import { SupplySideCTA } from '@/components/supply-side-cta'
import {
  calendarBookingUrl,
  docsUrl,
  githubUrl,
  twitterUrl
} from '@/lib/config'

export default function TheBestDamnLandingPageEver() {
  return (
    <>
      {/* Hero section */}
      <section className='mb-16 relative'>
        <div className='absolute top-0 bottom-0 left-0 right-0 bg-[url(/dots.svg)] bg-repeat bg-center bg-size-[32px_auto] opacity-30 dark:opacity-100' />

        <div className='absolute top-0 bottom-0 left-0 right-0 bg-[radial-gradient(39%_50%_at_50%_50%,rgba(255,255,255,.3)_0%,rgb(255,255,255)_100%)] dark:bg-[radial-gradient(39%_50%_at_50%_50%,rgba(10,10,10,0)_0%,rgb(10,10,10)_100%)]' />

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
      </section>

      {/* How it works section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          How It Works
        </h2>

        <div>TODO</div>
      </section>

      {/* Features section */}
      <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Production-Ready and Extremely Flexible
        </h2>

        <div className='grid gap-6 max-w-2xl'>
          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Auth
            </h4>

            <p className='text-sm'>
              Ship to production fast with Agentic's free, built-in
              authentication. Email & password, OAuth, GitHub, Google, Twitter,
              etc – if your origin API requires OAuth credentials, Agentic
              likely already supports it, and if not,{' '}
              <Link
                href={calendarBookingUrl}
                target='_blank'
                rel='noopener'
                className='link'
              >
                let me know
              </Link>
              .
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Stripe Billing
            </h4>

            <p className='text-sm'>
              Charge for your MCP products with a flexible, declarative pricing
              model built on top of Stripe. Agentic supports almost any
              combination of fixed and{' '}
              <span className='font-semibold'>usage-based billing</span> models,
              both at the MCP level, at the tool-call level, and at the custom
              metric level (e.g., tokens, image transformations, etc).
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Support both MCP and HTTP
            </h4>

            <p className='text-sm'>
              All agentic products support being used both as a standard MCP
              server <em>and</em> as an extremely simple HTTP API. MCP is
              important for interop, discoverability, and future-proofing,
              whereas being able to call your agentic tools via simple{' '}
              <em>HTTP POST</em> requests makes tool use easy to debug and makes
              integration with existing LLM tool calling patterns a breeze. With
              Agentic, you get the best of both worlds, including future support
              for unreleased MCP features and related specs.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              API keys
            </h4>

            <p className='text-sm'>
              When a customer subscribes to your product, they're given a unique
              API key. MCP URLs are appended with this API key to correlate
              usage with their subscription. Customer HTTP tool calls use the
              same API key as a standard HTTP <em>Authorization</em> header.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Rate-limiting
            </h4>

            <p className='text-sm'>
              All agentic products are protected by durable rate-limiting built
              on top of Cloudflare's global infrastructure. Customize the
              default rate-limits, change them based on a customer's pricing
              plan, or create custom tool-specific overrides. REST assured that
              your origin API will be safe behind Agentic's robust API gateway.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Caching
            </h4>

            <p className='text-sm'>
              Opt-in to caching with familiar <em>cache-control</em> and{' '}
              <em>stale-while-revalidate</em> options. MCP tool calls include
              caching information in their <em>_meta</em> fields, providing
              parity with standard HTTP headers. All caching takes place in
              Cloudflare's global edge cache, and caching will only be enabled
              if you choose to enable it for your product or individual tools.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Analytics
            </h4>

            <p className='text-sm'>
              Agentic tracks all tool calls for usage-based billing and
              analytics at a fine-grained level, so you can drill in and deeply
              understand how your customers are using your product.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Versioning
            </h4>

            <p className='text-sm'>
              Just like Vercel, Agentic uses immutable deployments, so every
              time you make a change to your product's config, pricing, or docs,
              a unique preview deployment is created for that change. This
              enables instant rollbacks if there are problems with a deployment.
              Publishing deployments publicly uses semantic versioning (
              <em>semver</em>), so your customers can choose how to handle
              breaking changes.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              That's just the start
            </h4>

            <p className='text-sm'>
              <Link href={docsUrl} className='link'>
                Check out our docs
              </Link>{' '}
              for more details on Agentic's MCP API gateway.
            </p>
          </div>
        </div>
      </section>

      {/* Marketplace section */}
      {/* <section className='flex flex-col gap-8 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          MCP Marketplace
        </h2>

        <p>
          <i>Coming soon...</i>
        </p>
      </section> */}

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
          Deploy Your MCP Today
        </h2>

        <SupplySideCTA variant='github-2' />
      </section>
    </>
  )
}
