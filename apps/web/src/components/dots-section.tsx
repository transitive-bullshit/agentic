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
      <div className='absolute pointer-events-none top-[-50%] bottom-[-50%] left-[-50%] right-[-50%] bg-[url(/dots-light.png)] dark:bg-[url(/dots-dark.png)] bg-size-[1024px,256px] bg-no-repeat bg-center' />

      {children}
    </section>
  )
}
