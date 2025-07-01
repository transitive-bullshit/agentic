'use client'

import { markdownToHtml } from '@fisch0920/markdown-to-html'
import { useAsync } from 'react-use'

import { cn } from '@/lib/utils'

import { LoadingIndicator } from '../loading-indicator'
import styles from './styles.module.css'

// TODO: figure out how to make this server-only to not bloat the client-side bundle
export function SSRMarkdown({
  className,
  markdown
}: {
  className?: string
  markdown: string
}) {
  const { value: html, loading } = useAsync(
    async () => markdownToHtml(markdown),
    [markdown]
  )

  if (loading) {
    return (
      <div className={cn('flex justify-center items-center h-full', className)}>
        <LoadingIndicator />
      </div>
    )
  }

  return (
    <div
      className={cn('prose dark:prose-invert', styles.markdown, className)}
      dangerouslySetInnerHTML={{ __html: html! }}
    />
  )
}
