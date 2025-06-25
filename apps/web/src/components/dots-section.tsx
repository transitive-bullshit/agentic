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
      <div className='absolute top-0 bottom-0 left-0 right-0 bg-[url(/dots.svg)] bg-repeat bg-center bg-size-[32px_auto] opacity-30 dark:opacity-100' />

      <div className='absolute top-0 bottom-0 left-0 right-0 bg-[radial-gradient(39%_50%_at_50%_50%,rgba(255,255,255,.3)_0%,rgb(255,255,255)_100%)] dark:bg-[radial-gradient(39%_50%_at_50%_50%,rgba(10,10,10,0)_0%,rgb(10,10,10)_100%)]' />

      {children}
    </section>
  )
}
