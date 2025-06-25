import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { CheckIcon, CopyIcon } from 'lucide-react'
import {
  Fragment,
  type JSX,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { type BundledLanguage, codeToHast } from 'shiki/bundle/web'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { toastError } from '@/lib/notifications'
import { cn } from '@/lib/utils'

import { LoadingIndicator } from './loading-indicator'
import { Button } from './ui/button'

export async function highlight({
  code,
  lang = 'ts',
  theme = 'github-dark',
  className
}: {
  code: string
  lang?: BundledLanguage
  theme?: string
  className?: string
}) {
  const out = await codeToHast(code, {
    lang,
    theme,
    transformers: [
      {
        pre(node) {
          if (className) {
            this.addClassToHast(node, className)
          }
        }
      }
    ]
  })

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs
  }) as JSX.Element
}

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
      theme,
      className: 'w-full text-wrap p-4 text-sm'
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
                  'absolute right-4 px-2.5! opacity-0 group-hover:opacity-100 group-hover:duration-0 transition-opacity duration-150',
                  numNewLines <= 1 ? 'top-[50%] translate-y-[-50%]' : 'top-4'
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
