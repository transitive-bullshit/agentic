'use client'

import type React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { AgenticProvider } from '@/components/agentic-provider'
import { PostHogProvider } from '@/components/posthog-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <AgenticProvider>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>{children}</TooltipProvider>

            <ReactQueryDevtools />
          </QueryClientProvider>
        </ThemeProvider>
      </AgenticProvider>
    </PostHogProvider>
  )
}
