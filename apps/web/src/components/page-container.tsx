import { cn } from '@/lib/utils'

export function PageContainer({
  background = true,
  compact = false,
  className,
  children
}: {
  background?: boolean
  compact?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <>
      {background && (
        <div className='absolute top-0 left-0 w-[100vw] h-[100vh] bg-top-right bg-no-repeat bg-size-[100vw_50vh] md:bg-auto -z-10 dark:bg-size-[100%_100%] dark:bg-center dark:w-[calc(max(100vw,1500px))] dark:h-[calc(max(100vh,1200px))] dark:left-[calc(min((100vw-1500px)/2,0px))] bg-[url(/bg.png)] dark:bg-[url(/bg-dark.jpg)]' />
      )}

      <div
        className={cn(
          'relative w-full flex-1 flex flex-col items-center max-w-[1200px] gap-16 z-10',
          compact ? 'pt-4' : 'pt-8',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}
