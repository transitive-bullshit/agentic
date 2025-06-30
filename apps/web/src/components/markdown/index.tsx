import { cn } from '@/lib/utils'

import styles from './styles.module.css'

export function Markdown({
  children,
  className
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('prose dark:prose-invert', styles.markdown, className)}>
      {children}
    </div>
  )
}
