'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import { type BundledLanguage } from 'shiki/bundle/web'

import { LoadingIndicator } from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { toastError } from '@/lib/notifications'
import { cn } from '@/lib/utils'

import { highlight } from './highlight'

export function CodeBlock({
  initial,
  code,
  lang,
  theme,
  className
}: {
  initial?: JSX.Element
  code: string
  lang?: BundledLanguage
  theme?: string
  className?: string
}) {
  const [nodes, setNodes] = useState(initial)
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    void highlight({
      code,
      lang,
      theme
    }).then(setNodes)
  }, [code, lang, theme])

  const onCopy = useCallback(() => {
    ;(async () => {
      try {
        await navigator.clipboard.writeText(code)
        setIsCopied(true)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null
          setIsCopied(false)
        }, 2000)
      } catch {
        setIsCopied(true)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        void toastError('Error copying code to clipboard')
      }
    })()
  }, [code, timeoutRef])

  const numNewLines = code.split('\n').length

  return (
    <div
      className={cn('relative group rounded-sm w-full shadow-sm', className)}
    >
      {nodes ? (
        <>
          {nodes}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'absolute right-2 px-2.5! opacity-0 group-hover:opacity-100 group-hover:duration-0 transition-opacity duration-150',
                  numNewLines <= 1 ? 'top-[50%] translate-y-[-50%]' : 'top-2'
                )}
                onClick={onCopy}
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </TooltipTrigger>

            <TooltipContent side='bottom'>
              {isCopied ? <span>Copied</span> : <span>Copy to clipboard</span>}
            </TooltipContent>
          </Tooltip>
        </>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  )
}
