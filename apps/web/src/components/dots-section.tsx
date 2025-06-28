import { cn } from '@/lib/utils'

export function DotsSection({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('relative', className)}>
      <div className='absolute top-[-25%] bottom-[-25%] left-[-25%] right-[-25%] bg-[url(/dots.svg)] bg-repeat bg-center bg-size-[32px_auto] opacity-30 dark:opacity-100' />

      <div className='absolute top-[-25%] bottom-[-25%] left-[-25%] right-[-25%] bg-radial from-[rgba(255,255,255,.3)] to-[rgb(255,255,255)] dark:from-[rgba(10,10,10,0)] dark:to-[rgb(10,10,10)]' />

      {children}
    </section>
  )
}
