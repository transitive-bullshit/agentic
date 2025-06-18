import Link from 'next/link'

import { GitHubStarCounter } from '@/components/github-star-counter'
import { SupplySideCTA } from '@/components/supply-side-cta'
import {
  calendarBookingUrl,
  discordUrl,
  docsUrl,
  githubUrl,
  twitterUrl
} from '@/lib/config'

export default function TheBestDamnLandingPageEver() {
  return (
    <>
      {/* Hero section */}
      <section className='gap-8'>
        <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-extrabold'>
          Your API → Paid MCP, Instantly
        </h1>

        <h5 className='text-center text-lg max-w-2xl'>
          Run one command to turn any MCP server or OpenAPI service into a paid
          MCP product,{' '}
          <em>with built-in distribution to over 20k AI engineers</em>.
        </h5>

        <SupplySideCTA />
      </section>

      {/* How it works section */}
      <section className='flex flex-col gap-8'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-2xl font-heading'>
          How It Works
        </h2>

        <div>TODO</div>
      </section>

      {/* Features section */}
      <section className='flex flex-col gap-8'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-2xl font-heading'>
          Production-Ready and Extremely Flexible
        </h2>

        <div className='grid gap-6'>
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
              Monetization
            </h4>

            <p className='text-sm'>
              Charge for your MCP products with a flexible, declarative pricing
              model built on top of Stripe. Agentic supports almost any
              combination of fixed and usage-based billing models, both at the
              MCP level, at the tool-call level, and at the custom metric level
              (e.g., tokens, image transformations, etc).
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Support both MCP <em>and</em> HTTP
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
              Rate-limiting
            </h4>

            <p className='text-sm'>
              Customize your MCP product with durable rate-limiting built on top
              of Cloudflare's global infrastructure. Create default rate-limits,
              change them based on a customer's subscribed pricing plan, and
              create custom tool-specific overrides, all with a simple,
              strongly-typed JSON config. REST assured that your origin API will
              be safe behind Agentic's robust API gateway.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Caching
            </h4>

            <p className='text-sm'>
              Opt-in to caching with familiar <em>cache-control</em> and{' '}
              <em>stale-while-revalidate</em> features. MCP tool calls include
              caching information in their <em>_meta</em> fields with symmetry
              to standard HTTP headers. All caching takes place in Cloudflare's
              global edge cache, and will only be enabled if you choose to
              enable it for your product or specific tools.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              Analytics
            </h4>

            <p className='text-sm'>
              Agentic tracks usage-based billing and analytics at a fine-grained
              level, so you can understand how your customers are using your
              product.
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
              Publish deployment publicly uses semantic versioning (
              <em>semver</em>), so your customers can choose how to handle
              breaking changes.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h4 className='text-center text-balance text-lg font-heading'>
              And more!
            </h4>

            <p className='text-sm'>
              Checkout our <Link href={docsUrl}>docs</Link> for more details on
              Agentic's MCP API gateway.
            </p>
          </div>
        </div>
      </section>

      {/* Marketplace section */}
      <section className='flex flex-col gap-8'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-2xl font-heading'>
          MCP Marketplace
        </h2>

        <p>Coming soon...</p>
      </section>

      {/* Open source section */}
      <section className='flex flex-col items-center gap-8 max-w-2xl text-center'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-2xl font-heading italic'>
          Agentic is 100% Open Source!
        </h2>

        <p className='text-sm'>
          Join the tens of thousands of TypeScript AI engineers who've{' '}
          <Link
            href={githubUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            starred the project on GitHub
          </Link>
          .{' '}
          <Link
            href={githubUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            Check out the source on GitHub
          </Link>
          ,{' '}
          <Link
            href={discordUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            join our community on Discord
          </Link>
          , or{' '}
          <Link
            href={twitterUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            ping me on Twitter
          </Link>
          .
        </p>

        <GitHubStarCounter />
      </section>

      {/* CTA section */}
      <section className='flex flex-col gap-8'>
        <SupplySideCTA />
      </section>
    </>
  )
}
