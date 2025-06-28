'use client'

import {
  CreditCardIcon,
  FileJsonIcon,
  HistoryIcon,
  ShieldCheckIcon,
  StarIcon,
  ZapIcon
} from 'lucide-react'

import { Feature, type FeatureData } from './feature'

const mcpMarketplaceFeatures: FeatureData[] = [
  {
    name: 'Highly Curated Tools',
    description: (
      <>
        <span className='font-semibold'>
          All Agentic tools have been hand-crafted specifically for LLM tool
          use.
        </span>{' '}
        We call this Agentic UX, and it's at the heart of why Agentic tools work
        better for LLM &amp; MCP use cases than legacy APIs.
      </>
    ),
    icon: StarIcon,
    pattern: {
      y: 16,
      squares: [
        [0, 1],
        [1, 3]
      ]
    }
  },
  {
    name: 'Production-Ready MCP Support',
    description: (
      <>
        Forget random GitHub repos and gluing local MCP servers together.
        Agentic tools are all battle-tested in production and come with real
        SLAs.
      </>
    ),
    icon: ShieldCheckIcon,
    pattern: {
      y: 22,
      squares: [[0, 1]]
    }
  },
  {
    name: 'World-Class TypeScript DX',
    description: (
      <>
        Agentic is written in TypeScript and strives for a Vercel-like DX.
        <span className='font-semibold'>One-line tool integrations</span> for
        all of the popular TS LLM SDKs (
        <span className='font-semibold'>Vercel AI SDK</span>,{' '}
        <span className='font-semibold'>OpenAI</span>,{' '}
        <span className='font-semibold'>LangChain</span>, etc).
      </>
    ),
    icon: FileJsonIcon,
    pattern: {
      y: 8,
      squares: [
        [0, 2],
        [-1, 1]
      ]
    }
  },
  {
    name: 'Stripe Billing',
    description: (
      <>
        Agentic uses Stripe for billing, and most tools are{' '}
        <span className='font-semibold'>usage-based</span>, so you'll only pay
        for what you (and your agents) actually use.
      </>
    ),
    icon: CreditCardIcon,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3]
      ]
    }
  },
  {
    name: 'Blazing Fast MCP Gateway',
    description: (
      <>
        Agentic's MCP gateway is powered by{' '}
        <span className='font-semibold'>Cloudflare's global edge network</span>.
        Tools come with customizable caching and rate-limits, so you can REST
        assured that your agents will always have a fast and reliable
        experience.
      </>
    ),
    icon: ZapIcon,
    pattern: {
      y: 32,
      squares: [
        [0, 2],
        [1, 4]
      ]
    }
  },
  {
    name: 'Semantic Versioning',
    description: (
      <>
        All Agentic tools are versioned using{' '}
        <span className='font-semibold'>semver</span>, so you can choose how to
        handle breaking changes.
      </>
    ),
    icon: HistoryIcon,
    pattern: {
      y: 26,
      squares: [
        [2, 4],
        [-2, 3]
      ]
    }
  }
]

export function MCPMarketplaceFeatures() {
  return (
    <div className='xl:max-w-none'>
      <div className='not-prose grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3'>
        {mcpMarketplaceFeatures.map((feature) => (
          <Feature key={feature.name} {...feature} />
        ))}
      </div>
    </div>
  )
}
