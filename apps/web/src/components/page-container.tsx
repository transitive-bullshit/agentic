import { cn } from '@/lib/utils'

export function PageContainer({
  background = true,
  className,
  children
}: {
  background?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <>
      {background && (
        <div className='absolute top-0 left-0 w-[100vw] h-[100vh] bg-[url(/bg.png)] bg-top-right bg-no-repeat bg-size-[100vw_50vh] md:bg-auto z-0' />
      )}

      <div
        className={cn(
          'relative w-full flex-1 flex flex-col items-center max-w-[1200px] gap-16 z-10',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}
