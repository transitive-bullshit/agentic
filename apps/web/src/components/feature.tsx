'use client'

import type { ComponentType, ReactNode } from 'react'
import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValue
} from 'motion/react'
import Link from 'next/link'

import { GridPattern } from './grid-pattern'

export type FeatureData = {
  name: string
  description: ReactNode
  icon: ComponentType<{ className?: string }>
  pattern: Omit<GridPattern, 'width' | 'height' | 'x'>
  href?: string
}

export function Feature({
  name,
  description,
  icon,
  pattern,
  href
}: FeatureData) {
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

      <div className='relative rounded-2xl p-4 flex flex-col gap-6 pt-12 text-start'>
        <FeatureIcon icon={icon} />

        <h3 className='text-gray-900 text-lg font-semibold leading-0 dark:text-white'>
          {/* <span className='absolute inset-0 rounded-2xl' /> */}
          {name}
        </h3>

        <p className='text-gray-600 dark:text-gray-400 text-[0.875rem] leading-[1.5rem]'>
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
function FeatureIcon({ icon: Icon }: { icon: FeatureData['icon'] }) {
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
}: FeatureData['pattern'] & {
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
