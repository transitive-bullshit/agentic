'use client'

import {
  ChartNoAxesCombinedIcon,
  CheckCheckIcon,
  CreditCardIcon,
  DatabaseZapIcon,
  HistoryIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  TextSelectIcon,
  UserIcon
} from 'lucide-react'

import { Feature, type FeatureData } from './feature'

const docsPublishingUrl = 'https://docs.agentic.so/publishing'

const mcpGatewayFeatures: FeatureData[] = [
  {
    name: 'Auth',
    description: (
      <>
        Ship to production fast with Agentic's free, hosted authentication.
        Email & password, OAuth, GitHub, Google, Twitter, etc – if your origin
        API requires OAuth credentials, Agentic likely already supports it, and
        if not, we'd be happy to add it.
      </>
    ),
    icon: UserIcon,
    href: `${docsPublishingUrl}/config/auth`,
    pattern: {
      y: 16,
      squares: [
        [0, 1],
        [1, 3]
      ]
    }
  },
  {
    name: 'Stripe Billing',
    description: (
      <>
        Charge for your MCP products with a flexible, declarative pricing model
        built on top of Stripe. Agentic supports almost any combination of fixed
        and <span className='font-semibold'>usage-based billing</span> models,
        both at the MCP level, at the tool-call level, and at the custom metric
        level (e.g., tokens, image transformations, etc).
      </>
    ),
    icon: CreditCardIcon,
    href: `${docsPublishingUrl}/config/pricing`,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3]
      ]
    }
  },
  {
    name: 'Support both MCP and HTTP',
    description: (
      <>
        All Agentic tools are exposed as both{' '}
        <span className='font-semibold'>MCP servers</span> as well as simple{' '}
        <span className='font-semibold'>HTTP APIs</span>. MCP is important for
        interop and future-proofing, whereas simple HTTP POST requests make
        tools easy to debug and simplifies usage with LLM tool calling.
      </>
    ),
    icon: CheckCheckIcon,
    pattern: {
      y: 32,
      squares: [
        [0, 2],
        [1, 4]
      ]
    }
  },
  {
    name: 'API Keys',
    description: (
      <>
        When a customer subscribes to your product, they're given a unique API
        key. MCP URLs are appended with this API key to correlate usage with
        their subscription. Customer HTTP tool calls use the same API key as a
        standard HTTP <em>Authorization</em> header.
      </>
    ),
    icon: KeyRoundIcon,
    pattern: {
      y: 22,
      squares: [[0, 1]]
    }
  },
  {
    name: 'Rate-Limiting',
    description: (
      <>
        Agentic durable rate-limiting is built on top of Cloudflare's global
        infrastructure. Customize the default rate-limits, change them based on
        a customer's pricing plan, or create custom tool-specific overrides.
        REST assured that your origin API will be safe behind Agentic's MCP
        gateway.
      </>
    ),
    icon: ShieldCheckIcon,
    href: `${docsPublishingUrl}/config/rate-limits`,
    pattern: {
      y: 2,
      squares: [
        [-2, 3],
        [1, 4]
      ]
    }
  },
  {
    name: 'Caching',
    description: (
      <>
        Opt-in to caching with familiar <em>cache-control</em> and{' '}
        <em>stale-while-revalidate</em> options. MCP tool calls include caching
        information in their <em>_meta</em> fields, providing parity with
        standard HTTP headers. Agentic uses Cloudflare's global edge cache for
        caching, which guarantees unmatched global performance.
      </>
    ),
    icon: DatabaseZapIcon,
    href: `${docsPublishingUrl}/config/caching`,
    pattern: {
      y: 8,
      squares: [
        [0, 2],
        [-1, 1]
      ]
    }
  },
  {
    name: 'Analytics',
    description: (
      <>
        Agentic tracks all tool calls for usage-based billing and analytics at a
        fine-grained level, so you can drill in and deeply understand how your
        customers are using your product.
      </>
    ),
    icon: ChartNoAxesCombinedIcon,
    pattern: {
      y: -2,
      squares: [[-2, 2]]
    }
  },
  {
    name: 'Versioning & Instant Rollbacks',
    description: (
      <>
        Agentic uses immutable deployments, so every time you make a change to
        your product, a unique preview deployment is created. This enables
        instant rollbacks if there are problems with a deployment. Publishing
        uses <span className='font-semibold'>semver</span> (semantic
        versioning), so your customers can choose how to handle breaking
        changes.
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
  },
  {
    name: "That's just the start",
    description: (
      <>Check out our docs for more details on Agentic's MCP gateway.</>
    ),
    href: `${docsPublishingUrl}/quickstart`,
    icon: TextSelectIcon,
    pattern: {
      y: 13,
      squares: [
        [0, 2],
        [-1, 4]
      ]
    }
  }
]

export function MCPGatewayFeatures() {
  return (
    <div className='xl:max-w-none'>
      <div className='not-prose grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3'>
        {mcpGatewayFeatures.map((feature) => (
          <Feature key={feature.name} {...feature} />
        ))}
      </div>
    </div>
  )
}
