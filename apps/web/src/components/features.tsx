'use client'

import type { ComponentType, ReactNode } from 'react'
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
import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValue
} from 'motion/react'
import Link from 'next/link'

import { calendarBookingUrl, docsUrl } from '@/lib/config'

import { GridPattern } from './grid-pattern'

type Feature = {
  name: string
  description: ReactNode
  icon: ComponentType<{ className?: string }>
  pattern: Omit<GridPattern, 'width' | 'height' | 'x'>
  href?: string
}

const FEATURES: Feature[] = [
  {
    name: 'Auth',
    description: (
      <>
        Ship to production fast with Agentic's free, built-in authentication.
        Email & password, OAuth, GitHub, Google, Twitter, etc – if your origin
        API requires OAuth credentials, Agentic likely already supports it, and
        if not,{' '}
        <Link
          href={calendarBookingUrl}
          target='_blank'
          rel='noopener'
          className='link'
        >
          let us know
        </Link>
        .
      </>
    ),
    icon: UserIcon,
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
        tools easy to debug and simplifies integrating with LLM SDKs.
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
    name: 'Rate-limiting',
    description: (
      <>
        All agentic products are protected by durable rate-limiting built on top
        of Cloudflare's global infrastructure. Customize the default
        rate-limits, change them based on a customer's pricing plan, or create
        custom tool-specific overrides. REST assured that your origin API will
        be safe behind Agentic's MCP gateway.
      </>
    ),
    icon: ShieldCheckIcon,
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
        standard HTTP headers. All caching takes place in Cloudflare's global
        edge cache, and caching will only be enabled if you choose to enable it
        for your product or individual tools.
      </>
    ),
    icon: DatabaseZapIcon,
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
        Just like Vercel, Agentic uses immutable deployments, so every time you
        make a change to your product's config, pricing, or docs, a unique
        preview deployment is created for that change. This enables instant
        rollbacks if there are problems with a deployment. Publishing uses{' '}
        <span className='font-semibold'>semver</span> (semantic versioning), so
        your customers can choose how to handle breaking changes.
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
    href: docsUrl,
    icon: TextSelectIcon,
    pattern: {
      y: 13,
      squares: [
        [0, 2],
        [0, 2]
      ]
    }
  }
]

function Feature({ name, description, icon, pattern, href }: Feature) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function onMouseMove({
    currentTarget,
    clientX,
    clientY
  }: React.MouseEvent<HTMLElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const content = (
    <>
      <FeaturePattern {...pattern} mouseX={mouseX} mouseY={mouseY} />

      <div className='ring-gray-900/7.5 group-hover:ring-gray-900/10 absolute inset-0 rounded-2xl ring-1 ring-inset dark:ring-white/10 dark:group-hover:ring-white/20' />

      <div className='relative rounded-2xl px-4 pb-4 pt-16'>
        <FeatureIcon icon={icon} />

        <h3 className='text-gray-900 mt-4 text-[0.875rem] font-semibold leading-7 dark:text-white'>
          {/* <span className='absolute inset-0 rounded-2xl' /> */}
          {name}
        </h3>

        <p className='text-gray-600 dark:text-gray-400 mt-1 text-[0.875rem] leading-[1.5rem]'>
          {description}
        </p>
      </div>
    </>
  )

  const className =
    'dark:bg-white/2.5 bg-gray-50 hover:shadow-gray-900/5 group relative flex rounded-2xl transition-shadow hover:shadow-md dark:hover:shadow-black/5'

  if (href) {
    return (
      <Link
        href={href}
        key={name}
        onMouseMove={onMouseMove}
        className={className}
      >
        {content}
      </Link>
    )
  } else {
    return (
      <div key={name} onMouseMove={onMouseMove} className={className}>
        {content}
      </div>
    )
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function FeatureIcon({ icon: Icon }: { icon: Feature['icon'] }) {
  return (
    <div className='dark:bg-white/7.5 bg-gray-900/5 ring-gray-900/25 group-hover:ring-gray-900/25 dark:group-hover:bg-sky-300/10 dark:group-hover:ring-sky-400 flex size-7 items-center justify-center rounded-full ring-1 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 dark:ring-white/15'>
      <Icon className='fill-gray-700/10 stroke-gray-700 group-hover:stroke-gray-900 dark:stroke-gray-400 dark:group-hover:stroke-sky-400 dark:group-hover:fill-sky-300/10 size-5 transition-colors duration-300 dark:fill-white/10' />
    </div>
  )
}

function FeaturePattern({
  mouseX,
  mouseY,
  ...gridProps
}: Feature['pattern'] & {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  const maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  const style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className='pointer-events-none'>
      <div className='absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50'>
        <GridPattern
          width={72}
          height={56}
          x='50%'
          className='dark:fill-white/1 dark:stroke-white/2.5 absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5'
          {...gridProps}
        />
      </div>

      <motion.div
        className='from-sky-100 to-sky-300 dark:from-sky-500 dark:to-sky-300 absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition duration-300 group-hover:opacity-50 dark:group-hover:opacity-15'
        style={style}
      />

      <motion.div
        className='absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100'
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x='50%'
          className='dark:fill-white/2.5 absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:stroke-white/10'
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}

export function Features() {
  return (
    <div className='xl:max-w-none'>
      <div className='not-prose grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3'>
        {FEATURES.map((feature) => (
          <Feature key={feature.name} {...feature} />
        ))}
      </div>
    </div>
  )
}
