import Link from 'next/link'

import { PageContainer } from '@/components/page-container'
import { SupplySideCTA } from '@/components/supply-side-cta'
import { githubUrl, twitterUrl } from '@/lib/config'
import { cn } from '@/lib/utils'

import styles from './styles.module.css'

export default function AboutPage() {
  return (
    <PageContainer>
      <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
        About
      </h1>

      <section className={cn('prose dark:prose-invert', styles.markdown)}>
        <h2>Setting the stage</h2>

        <p>
          It's 2025. LLMs are still scaling. AI agents are just starting to take
          off. MCP is exploding. The singularity looms. Shoggoth looks back on
          us from the near future and gives a sly smile that doesn't quite reach
          His inhuman eyes.
        </p>

        <p>
          In this increasingly AI-native world, what's the best way for "normal"
          software engineers like us to stay relevant and provide value for both
          our families as well as our future AI edgelords?
        </p>

        <p>
          Well, I don't know about you, but contributing to foundation models,
          AI alignment, and AGI research all seem incredibly sexy but are also a
          lil outside my areas of expertise.
        </p>

        <p>
          That's why Agentic is focused solely on building value at the LLM tool
          calling layer. MCPs are a great example here.
        </p>

        <p>
          There's a lot that will change in AI over the next decade, but one
          thing I believe strongly is that no matter how much the underlying AI
          systems change,{' '}
          <span className='font-semibold'>
            providing access to high quality tools that are specifically
            designed and optimized for agents will become increasingly important
            over time
          </span>
          .
        </p>

        <p>
          We call this <span className='font-semibold'>Agentic UX</span>, and
          it's at the heart of Agentic's mission.
        </p>

        <h2>Mission</h2>
        <p className='font-semibold italic'>
          Agentic's mission is to build the world's best library of tools for AI
          agents.
        </p>

        {/* <h2>What is Agentic UX?</h2>
        <p>
          Agentic User Experience measures how optimized a resource is for
          consumption by LLM-based apps and more autonomous AI agents.
        </p>

        <p>
          `llms.txt` is a great example of a readonly format optimized for
          Agentic UX.
        </p>

        <p>
          Anthropic's Model Context Protocol (MCP) and Google's Agent to Agent
          Protocol (A2A) are both examples of protocols purpose-built for
          Agentic UX. There are dozens of other aspirational protocols with
          similar aims. [xkcd standards]
        </p> */}

        <h2>Team</h2>
        <p>
          Agentic was founded in 2023 by{' '}
          <Link
            href={twitterUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            Travis Fischer
          </Link>{' '}
          (hey hey 👋) . We're backed by{' '}
          <Link
            href='https://hf0.com'
            target='_blank'
            rel='noopener'
            className='link'
          >
            HF0
          </Link>
          ,{' '}
          <Link
            href='https://hf0.com'
            target='_blank'
            rel='noopener'
            className='link'
          >
            Backend Capital
          </Link>
          , and
          <Link
            href='https://hf0.com'
            target='_blank'
            rel='noopener'
            className='link'
          >
            Transpose Capital
          </Link>
          .
        </p>

        <p>
          I'm currently running Agentic as a solo founder while traveling around
          the world, but i'm actively looking to hire a few remote engineers and
          would consider bringing on a co-founder if they're a really strong
          fit.
        </p>

        <p>
          If you're an expert TypeScript dev who vibes with our mission and
          loves open source – and if you have an interest in AI engineering, AI
          agents, API gateways, OpenAPI, MCP, AI codegen, etc, feel free to{' '}
          <Link
            href={twitterUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            DM me on twitter
          </Link>
          , and please include a few links to your GitHub + related projects.
        </p>

        <p className='text-sm italic'>
          (this page was written with love and an intentional lack of LLM
          assistance on a very long and sleepy international flight 💕)
        </p>

        <h2>Tech stack</h2>
        <ul>
          <li>TypeScript</li>
          <li>Node.js</li>
          <li>Postgres</li>
          <li>Drizzle ORM</li>
          <li>Hono</li>
          <li>Stripe</li>
          <li>Cloudflare Workers</li>
          <li>Vercel</li>
          <li>Sentry</li>
          <li>Resend</li>
          <li>Cursor</li>
        </ul>

        <p>
          <Link
            href={githubUrl}
            target='_blank'
            rel='noopener'
            className='link'
          >
            Check out the source on GitHub for more details
          </Link>
          .
        </p>
      </section>

      {/* CTA section */}
      <section className='flex flex-col gap-12'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Don't miss out on this AI wave
        </h2>

        <SupplySideCTA variant='github-2' />
      </section>
    </PageContainer>
  )
}
